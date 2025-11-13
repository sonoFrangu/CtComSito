import { createClient } from '@supabase/supabase-js';

console.log('gestione.js caricato');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  alert('ERRORE configurazione: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non sono impostate.');
  console.error('Missing env', { supabaseUrl, supabaseKey });
}

const supabase = createClient(supabaseUrl, supabaseKey);

const $ = (id) => document.getElementById(id);

// --- Helper messaggi ---
function showError(scope, error) {
  const msg =
    typeof error === 'string'
      ? error
      : error && error.message
      ? error.message
      : JSON.stringify(error);
  console.error('ERRORE', scope, error);
  alert('ERRORE ' + scope + ': ' + msg);
}

function showInfo(message) {
  console.log('INFO:', message);
  alert(message);
}

// --- GALLERIA ELEMENTS ---
const galSede = $('gal-sede');
const galInput = $('gal-input');
const galClear = $('gal-clear');
const galPreview = $('gal-preview');
const galUpload = $('gal-upload');
const galStatus = $('gal-status');
const galStatusList = $('gal-status-list');
const galleryReload = $('gallery-reload');
const cntInd = $('cnt-induno');
const cntVar = $('cnt-varese');
const listInd = $('gal-list-induno');
const listVar = $('gal-list-varese');

// --- DEV ELEMENTS ---
const devName = $('dev-name');
const devDesc = $('dev-desc');
const devPrice = $('dev-price');
const devImages = $('dev-images');
const devSave = $('dev-save');
const devClear = $('dev-clear');
const devList = $('dev-list');
const devReload = $('dev-reload');
const devStatus = $('dev-status');

let bufferFiles = [];

// ----------------- GALLERIA -----------------
function clearGalStatuses() {
  galStatus.textContent = '';
  galStatusList.innerHTML = '';
}

function addGalStatus(text, cls) {
  const li = document.createElement('li');
  li.textContent = text;
  if (cls) li.className = cls;
  galStatusList.appendChild(li);
  return li;
}

function renderPreview(files) {
  galPreview.innerHTML = (files || [])
    .map((f) => {
      const url = URL.createObjectURL(f);
      return `
        <div class="relative overflow-hidden rounded aspect-video">
          <img src="${url}" class="object-cover w-full h-full" />
        </div>
      `;
    })
    .join('');
}

// file picker
if (galInput) {
  galInput.addEventListener('click', () => {
    galInput.value = '';
  });

  galInput.addEventListener('change', () => {
    const files = Array.from(galInput.files || []);
    bufferFiles = files.filter((f) => (f.type || '').startsWith('image/'));
    renderPreview(bufferFiles);
    if (files.length && !bufferFiles.length) {
      galStatus.textContent = 'I file selezionati non sono immagini.';
    } else {
      galStatus.textContent = '';
    }
  });
}

if (galClear) {
  galClear.addEventListener('click', () => {
    bufferFiles = [];
    galInput.value = '';
    galPreview.innerHTML = '';
    clearGalStatuses();
  });
}

async function countBySede(sede) {
  const { data, error } = await supabase
    .from('gallery')
    .select('id', { count: 'exact', head: false })
    .eq('sede', sede);

  if (error) {
    showError('countBySede(' + sede + ')', error);
    return 0;
  }
  return (data || []).length;
}

function renderGalleryTable(tbody, sede, rows) {
  tbody.innerHTML = rows
    .map((r) => {
      const { data: pub } = supabase.storage.from(`${sede}-gallery`).getPublicUrl(r.path);
      const url = pub?.publicUrl || '';
      return `
        <tr>
          <td class="px-2 py-1 truncate">${r.path}</td>
          <td class="px-2 py-1">
            <img src="${url}" class="inline-block object-cover w-16 h-10 rounded" />
          </td>
          <td class="px-2 py-1">
            <button class="btn-primary gal-del" data-id="${r.id}" data-sede="${sede}" data-path="${r.path}">
              Elimina
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function loadGallery() {
  galStatus.textContent = '';
  const { data, error } = await supabase
    .from('gallery')
    .select('id,sede,path,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    galStatus.textContent = 'Errore DB (gallery): ' + (error.message || error);
    showError('loadGallery', error);
    return;
  }

  const rows = data || [];
  console.log('loadGallery ok, righe:', rows.length);

  const ind = rows.filter((r) => r.sede === 'induno');
  const va = rows.filter((r) => r.sede === 'varese');

  cntInd.textContent = String(ind.length);
  cntVar.textContent = String(va.length);

  renderGalleryTable(listInd, 'induno', ind);
  renderGalleryTable(listVar, 'varese', va);
}

// delete immagine
[listInd, listVar].forEach((tbl) => {
  if (!tbl) return;
  tbl.addEventListener('click', async (e) => {
    const btn = e.target.closest('.gal-del');
    if (!btn) return;
    if (!confirm('Eliminare questa immagine?')) return;

    const { id, sede, path } = btn.dataset;

    const { error: delStorageErr } = await supabase.storage.from(`${sede}-gallery`).remove([path]);
    if (delStorageErr) {
      showError('rimozione file storage', delStorageErr);
      return;
    }

    const { error: delDbErr } = await supabase.from('gallery').delete().eq('id', Number(id));
    if (delDbErr) {
      showError('rimozione record gallery', delDbErr);
      return;
    }

    await loadGallery();
    alert('Immagine eliminata');
  });
});

if (galleryReload) {
  galleryReload.addEventListener('click', async () => {
    await loadGallery();
    alert('Galleria aggiornata');
  });
}

// upload
if (galUpload) {
  galUpload.addEventListener('click', async () => {
    const lock = document.getElementById('lock');
    if (lock && lock.style.display !== 'none') {
      galStatus.textContent = 'Sblocca con password per procedere.';
      showInfo('Devi prima inserire la password per usare il pannello.');
      return;
    }

    clearGalStatuses();

    const sede = galSede.value;
    const bucket = `${sede}-gallery`;

    if (!bufferFiles.length) {
      galStatus.textContent = 'Seleziona immagini prima di caricare.';
      showInfo("Nessun file selezionato per l'upload.");
      return;
    }

    const already = await countBySede(sede);
    const remaining = Math.max(0, 6 - already);

    if (remaining === 0) {
      galStatus.textContent = 'Limite raggiunto (6). Elimina prima qualche foto.';
      showInfo('Limite di 6 immagini per la sede "' + sede + '" già raggiunto.');
      return;
    }

    galUpload.disabled = true;
    galUpload.classList.add('opacity-50');

    let ok = 0;

    for (const file of bufferFiles.slice(0, remaining)) {
      const row = addGalStatus(`Caricamento ${file.name}...`);
      const path = `${Date.now()}-${file.name}`.replace(/\s+/g, '_');

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (upErr) {
        row.textContent = `Errore upload ${file.name}: ${upErr.message || upErr}`;
        row.className = 'text-red-400';
        showError('upload storage ' + file.name, upErr);
        continue;
      }

      row.textContent = `Salvo nel DB: ${file.name}...`;

      const { error: insErr } = await supabase.from('gallery').insert({ sede, path });

      if (insErr) {
        row.textContent = `Errore DB ${file.name}: ${insErr.message || insErr}`;
        row.className = 'text-red-400';
        showError('insert gallery ' + file.name, insErr);
        continue;
      }

      row.textContent = `Caricato ${file.name}`;
      row.className = 'text-green-400';
      ok++;
    }

    galStatus.textContent = ok ? `Caricate ${ok} immagini.` : 'Nessun file caricato.';
    if (ok) alert(`Caricate ${ok} immagini`); else alert('Nessun file caricato');

    bufferFiles = [];
    galInput.value = '';
    galPreview.innerHTML = '';

    galUpload.disabled = false;
    galUpload.classList.remove('opacity-50');

    await loadGallery();
  });
}

// ----------------- DISPOSITIVI -----------------
function priceToNumber(p) {
  if (!p) return null;
  const clean = String(p).replace(/[^0-9.,]/g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

function deviceRow(r) {
  const price = r.price == null ? '—' : `€${Number(r.price).toFixed(2)}`;
  const imgs = Array.isArray(r.images) ? r.images.length : 0;
  return `
    <tr data-id="${r.id}">
      <td class="px-2 py-1 text-left">${r.name}</td>
      <td class="px-2 py-1 text-center">${price}</td>
      <td class="px-2 py-1 text-center">${imgs}</td>
      <td class="px-2 py-1 space-x-1 text-center">
        <button class="btn-primary dev-edit">Modifica</button>
        <button class="btn-primary dev-del">Elimina</button>
      </td>
    </tr>
  `;
}

async function loadDevices() {
  devStatus.textContent = '';
  const { data, error } = await supabase
    .from('devices')
    .select('id,name,descr,price,images,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    devStatus.textContent = 'Errore DB (devices): ' + (error.message || error);
    showError('loadDevices', error);
    return;
  }

  console.log('loadDevices ok, dispositivi:', (data || []).length);
  devList.innerHTML = (data || []).map(deviceRow).join('');
}

if (devReload) {
  devReload.addEventListener('click', async () => {
    await loadDevices();
    alert('Telefoni aggiornati');
  });
}

if (devClear) {
  devClear.addEventListener('click', () => {
    devName.value = '';
    devDesc.value = '';
    devPrice.value = '';
    devImages.value = '';
    devStatus.textContent = '';
  });
}

if (devSave) {
  devSave.addEventListener('click', async () => {
    devStatus.textContent = 'Salvataggio...';

    const name = (devName.value || '').trim();
    const descr = (devDesc.value || '').trim();
    const price = priceToNumber((devPrice.value || '').trim());
    const images = (devImages.value || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name || !descr) {
      devStatus.textContent = 'Nome e descrizione sono obbligatori.';
      return;
    }

    const { error } = await supabase.from('devices').insert({ name, descr, price, images });

    if (error) {
      devStatus.textContent = 'Errore DB: ' + (error.message || error);
      showError('insert device', error);
      return;
    }

    devStatus.textContent = 'Telefono aggiunto!';
    alert('Telefono aggiunto');

    devClear.click();
    await loadDevices();
  });
}

if (devList) {
  devList.addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const id = Number(row.dataset.id);

    if (e.target.matches('.dev-del')) {
      if (!confirm('Eliminare questo telefono?')) return;
      const { error } = await supabase.from('devices').delete().eq('id', id);
      if (error) {
        showError('delete device', error);
        return;
      }
      await loadDevices();
      alert('Telefono eliminato');
    }

    if (e.target.matches('.dev-edit')) {
      const { data, error } = await supabase.from('devices').select('*').eq('id', id).single();

      if (error) {
        showError('read device ' + id, error);
        return;
      }

      const newName = prompt('Nome', data.name ?? '') ?? data.name;
      const newDescr = prompt('Descrizione', data.descr ?? '') ?? data.descr;
      const priceStr =
        prompt('Prezzo (vuoto per nessuno)', data.price == null ? '' : String(data.price)) ??
        (data.price == null ? '' : String(data.price));
      const imagesStr =
        prompt(
          'Immagini (URL separati da newline)',
          Array.isArray(data.images) ? data.images.join('\n') : ''
        ) ?? (Array.isArray(data.images) ? data.images.join('\n') : '');

      const newPrice = priceStr.trim() === '' ? null : priceToNumber(priceStr);
      const newImages = imagesStr
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const { error: uErr } = await supabase
        .from('devices')
        .update({ name: newName, descr: newDescr, price: newPrice, images: newImages })
        .eq('id', id);

      if (uErr) {
        showError('update device ' + id, uErr);
        return;
      }

      await loadDevices();
      alert('Telefono aggiornato');
    }
  });
}

// avvio
(async () => {
  showInfo('Pannello gestione inizializzato (gestione.js)');
  await loadGallery();
  await loadDevices();
  console.log('Gestione pronta.');
})();