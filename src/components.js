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
  
  export async function renderTeam(gridId) {
    const container = document.getElementById(gridId);
    if (!container) return;
    const res = await fetch("/employees.json");
    const team = await res.json();
    container.innerHTML = team.map(m => `
      <div class="card" data-aos="fade-up">
        <div class="aspect-[4/3] overflow-hidden rounded-md mb-4 bg-neutral-800">
          <img src="${m.photo}" alt="${m.name}" class="w-full h-full object-cover transition duration-500 hover:scale-105"/>
        </div>
        <h3 class="text-lg font-semibold">${m.name}</h3>
        <p class="text-neutral-400">${m.role}</p>
      </div>
    `).join("");
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
  