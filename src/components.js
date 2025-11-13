export function renderHeader(active = "") {
    return `
    <header class="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur border-b border-white/10">
      <div class="container flex items-center justify-between py-3">
        <a href="/" class="flex items-center gap-3">
          <img src="/assets/logo.png" alt="CT Communication" class="h-9 w-auto drop-shadow" />
          <span class="sr-only">CT Communication</span>
        </a>
        <nav class="flex gap-6">
          <a href="/induno" class="nav-link ${active==='induno' ? 'text-blue-400' : ''}">Induno Olona</a>
          <a href="/varese" class="nav-link ${active==='varese' ? 'text-blue-400' : ''}">Varese</a>
        </nav>
      </div>
    </header>`;
  }
  
  export function renderFooter() {
    const year = new Date().getFullYear();
    return `
    <footer class="border-t border-white/10 bg-neutral-950">
      <div class="container py-10 text-sm text-neutral-400">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© ${year} CT Communication — Tutti i diritti riservati</p>
          <div class="flex gap-4">
            <a class="nav-link" href="/induno">Induno Olona</a>
            <a class="nav-link" href="/varese">Varese</a>
          </div>
        </div>
      </div>
    </footer>`;
  }
  
  export function renderTeam(gridId) {
    const container = document.getElementById(gridId);
    if (!container) return;
  
    const team = [
      { name: "Matteo Cortazzi", role: "Proprietario", photo: "/assets/team/matteo.png" },
      { name: "Vincenzo Laforgia", role: "Dipendente", photo: "/assets/team/vincenzo.png" },
      { name: "Serena Baroffio", role: "Dipendente", photo: "/assets/team/serena.png" }
    ];
  
    if (!team.length) {
      container.innerHTML = `<p class="text-sm text-neutral-400">Nessun membro del team configurato.</p>`;
      return;
    }
  
    container.innerHTML = team
      .map((m) => {
        const name = m.name || "";
        const role = m.role || "";
        let photo = (m.photo || "").trim();
  
        if (!photo) {
          photo = "/assets/logo.png";
        }
  
        return `
          <div class="card" data-aos="fade-up">
            <div class="aspect-[9/16] overflow-hidden rounded-md mb-4 bg-neutral-800 flex items-center justify-center">
              <img src="${photo}" alt="${name}" class="w-full h-full object-cover transition duration-500 hover:scale-105"
                onerror="this.style.display='none'; this.parentElement.classList.add('text-sm','text-neutral-400'); this.parentElement.textContent='immagine mancante';"/>
            </div>
            <h3 class="text-lg font-semibold">${name}</h3>
            <p class="text-neutral-400">${role}</p>
          </div>
        `;
      })
      .join("");
  }

  export function enablePageTransitions() {
    // entry animation
    document.documentElement.classList.add("page-enter");
    setTimeout(() => document.documentElement.classList.remove("page-enter"), 250);

    // intercept internal nav clicks for fade-out before navigation
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const isInternal = href.startsWith("/") && !a.hasAttribute("target");
      if (!isInternal) return;
      e.preventDefault();
      document.documentElement.classList.add("page-exit");
      setTimeout(() => (window.location.href = href), 220);
    });
  }