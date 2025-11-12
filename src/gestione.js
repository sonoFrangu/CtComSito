// =============================
//  Protezione con password (frontend)
//  ⚠️ Cambia la password sotto!
// =============================
const ADMIN_PASSWORD = "ct-admin-2025"; // <-- modifica qui
const LOCK_ID = "admin-lock";
const PASS_INPUT_ID = "admin-pass";
const PASS_ERR_ID = "admin-error";
const LOGOUT_BTN_ID = "admin-logout";

const lockEl = document.getElementById(LOCK_ID);
const passEl = document.getElementById(PASS_INPUT_ID);
const errEl = document.getElementById(PASS_ERR_ID);
const logoutEl = document.getElementById(LOGOUT_BTN_ID);

function showLock(show) {
  if (!lockEl) return;
  lockEl.style.display = show ? "flex" : "none";
  document.documentElement.classList.toggle("overflow-hidden", show);
}
function isAuthed() { return localStorage.getItem("gest_auth") === "ok"; }
function setAuthed(ok) { ok ? localStorage.setItem("gest_auth", "ok") : localStorage.removeItem("gest_auth"); }

if (!isAuthed()) showLock(true); else showLock(false);

const formEl = document.getElementById("admin-form");
formEl?.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = passEl?.value || "";
  if (val === ADMIN_PASSWORD) {
    setAuthed(true);
    errEl?.classList.add("hidden");
    showLock(false);
    passEl.value = "";
    logoutEl?.classList.remove("hidden");
  } else {
    errEl?.classList.remove("hidden");
    passEl?.focus();
  }
});
logoutEl?.addEventListener("click", () => { setAuthed(false); showLock(true); });

// =============================
//  FOTO – drag&drop + generatore snippet
// =============================
const fotoBtn = document.getElementById("foto-genera");
const fotoSede = document.getElementById("foto-sede");
const fotoFiles = document.getElementById("foto-files");
const fotoOut = document.getElementById("foto-output");
const copyFoto = document.getElementById("copy-foto");
const fotoDrop = document.getElementById("foto-drop");
const fotoInput = document.getElementById("foto-input");

function addFilesToTextarea(fileList) {
  const names = Array.from(fileList).map(f => f.name).join("\n");
  fotoFiles.value = [fotoFiles.value, names].filter(Boolean).join("\n");
}
fotoInput?.addEventListener("change", (e) => { if (e.target.files?.length) addFilesToTextarea(e.target.files); });
function preventDefaults(e){ e.preventDefault(); e.stopPropagation(); }
["dragenter","dragover","dragleave","drop"].forEach(ev => fotoDrop?.addEventListener(ev, preventDefaults));
fotoDrop?.addEventListener("dragover", () => fotoDrop.classList.add("ring-1","ring-blue-400/40"));
fotoDrop?.addEventListener("dragleave", () => fotoDrop.classList.remove("ring-1","ring-blue-400/40"));
fotoDrop?.addEventListener("drop", (e) => {
  fotoDrop.classList.remove("ring-1","ring-blue-400/40");
  const dt = e.dataTransfer; if (dt?.files?.length) addFilesToTextarea(dt.files);
});

function buildFotoCards(sede, files) {
  return files.map((f, i) => {
    const delay = i * 50;
    const src = `/assets/${sede}-gallery/${f}`;
    const alt = `Negozio ${sede === 'induno' ? 'Induno' : 'Varese'} ${i+1}`;
    return `
<div class="card overflow-hidden" data-aos="fade-up"${delay ? ` data-aos-delay="${delay}"` : ""}>
  <img src="${src}" alt="${alt}" class="w-full h-48 object-cover"
       onerror="this.replaceWith(Object.assign(document.createElement('div'),{textContent:'${src} mancante',className:'p-4 text-sm text-neutral-400'}))">
</div>`; }).join("\n");
}

fotoBtn?.addEventListener("click", () => {
  const sede = fotoSede.value; // "induno" | "varese"
  const files = fotoFiles.value.split("\n").map(s => s.trim()).filter(Boolean);
  fotoOut.value = files.length ? buildFotoCards(sede, files) : "<!-- nessun file inserito -->";
});
copyFoto?.addEventListener("click", async () => {
  if (!fotoOut.value) return; await navigator.clipboard.writeText(fotoOut.value);
  copyFoto.textContent = "Copiato!"; setTimeout(() => (copyFoto.textContent = "Copia"), 1200);
});

// =============================
//  DISPOSITIVI – JSON + UI immagini dinamiche + download
// =============================
const devNome = document.getElementById("dev-nome");
const devDesc = document.getElementById("dev-desc");
const devPrezzo = document.getElementById("dev-prezzo");
const devImgsWrap = document.getElementById("dev-images");
const devOut = document.getElementById("dev-output");
const devGen = document.getElementById("dev-genera");
const copyDev = document.getElementById("copy-dev");
const dlDev = document.getElementById("download-dev");
const dlDevicesEmpty = document.getElementById("download-devices-empty");

// Aggiungi/rimuovi righe immagine
devImgsWrap?.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".dev-add");
  if (!addBtn) return;
  const row = document.createElement("div");
  row.className = "flex gap-2";
  row.innerHTML = `
    <input class="w-full bg-neutral-900 border border-white/10 rounded-md p-2" placeholder="/assets/devices/immagine.jpg">
    <button type="button" class="btn-primary dev-remove">−</button>
  `;
  devImgsWrap.appendChild(row);
});

devImgsWrap?.addEventListener("click", (e) => {
  const remBtn = e.target.closest(".dev-remove");
  if (!remBtn) return;
  remBtn.parentElement?.remove();
});

function getDeviceImages() {
  return Array.from(devImgsWrap.querySelectorAll("input"))
    .map(i => i.value.trim())
    .filter(Boolean);
}
function toDeviceJson() {
  const obj = {
    name: (devNome.value || "").trim(),
    desc: (devDesc.value || "").trim(),
    price: (devPrezzo.value || "").trim() || null,
    images: getDeviceImages()
  };
  return JSON.stringify(obj, null, 2);
}

devGen?.addEventListener("click", () => { devOut.value = toDeviceJson(); });
copyDev?.addEventListener("click", async () => {
  if (!devOut.value) devOut.value = toDeviceJson();
  await navigator.clipboard.writeText(devOut.value);
  copyDev.textContent = "Copiato!"; setTimeout(() => (copyDev.textContent = "Copia"), 1200);
});

dlDev?.addEventListener("click", () => {
  const blob = new Blob([devOut.value || toDeviceJson()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "device.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

dlDevicesEmpty?.addEventListener("click", () => {
  const blob = new Blob(["[]"], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "devices.json";
  a.click();
  URL.revokeObjectURL(a.href);
});