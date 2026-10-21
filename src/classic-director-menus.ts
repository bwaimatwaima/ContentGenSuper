/**
 * Classic Video Director Top Menu Bar Controller.
 * Provides standard NLE desktop menu bar behavior (File, View, Tools, Workflow, Help):
 * - Click to open/close menu
 * - Hover-switch between menus when any menu is open
 * - Keyboard navigation (Left/Right/Esc)
 * - Outside click dismissal
 * - Action item dispatching
 */

let activeMenuId: string | null = null;
let initialized = false;

export function initClassicDirectorMenus(): void {
  if (initialized) return;

  const header = document.querySelector('#video-director-modal #video-director-main-view > div:first-child');
  if (!header) return;

  const menuTriggers = header.querySelectorAll<HTMLButtonElement>('[data-vd-menu-trigger]');
  const menuDropdowns = header.querySelectorAll<HTMLElement>('[data-vd-menu-dropdown]');

  function closeAllMenus(): void {
    if (!activeMenuId) return;
    activeMenuId = null;
    menuTriggers.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('vd-menu-active');
    });
    menuDropdowns.forEach((panel) => {
      panel.classList.add('hidden');
      panel.classList.remove('opacity-100', 'scale-100');
      panel.classList.add('opacity-0', 'scale-95');
    });
  }

  function openMenu(menuName: string): void {
    closeAllMenus();
    activeMenuId = menuName;

    const trigger = header?.querySelector<HTMLButtonElement>(`[data-vd-menu-trigger="${menuName}"]`);
    const dropdown = header?.querySelector<HTMLElement>(`[data-vd-menu-dropdown="${menuName}"]`);

    if (trigger && dropdown) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.classList.add('vd-menu-active');
      dropdown.classList.remove('hidden');
      requestAnimationFrame(() => {
        dropdown.classList.remove('opacity-0', 'scale-95');
        dropdown.classList.add('opacity-100', 'scale-100');
      });
    }
  }

  function toggleMenu(menuName: string): void {
    if (activeMenuId === menuName) {
      closeAllMenus();
    } else {
      openMenu(menuName);
    }
  }

  menuTriggers.forEach((btn) => {
    const menuName = btn.dataset.vdMenuTrigger;
    if (!menuName) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(menuName);
    });

    btn.addEventListener('mouseenter', () => {
      if (activeMenuId && activeMenuId !== menuName) {
        openMenu(menuName);
      }
    });
  });

  // Action wiring for individual menu items
  header.querySelector('#vd-menu-save-item')?.addEventListener('click', () => {
    document.getElementById('save-project-video-btn')?.click();
  });
  header.querySelector('#vd-menu-import-item')?.addEventListener('click', () => {
    document.getElementById('import-project-video-btn')?.click() || document.getElementById('import-project-input')?.click();
  });
  header.querySelector('#vd-menu-archive-item')?.addEventListener('click', () => {
    document.getElementById('export-project-archive-video-btn')?.click();
  });
  header.querySelector('#vd-menu-export-item')?.addEventListener('click', () => {
    document.getElementById('video-export-btn')?.click();
  });
  header.querySelector('#vd-menu-history-item')?.addEventListener('click', () => {
    document.getElementById('history-btn')?.click();
  });
  header.querySelector('#vd-menu-close-item')?.addEventListener('click', () => {
    document.getElementById('close-video-director-modal-btn')?.click();
  });
  header.querySelector('#vd-menu-seq-track-item')?.addEventListener('click', () => {
    document.getElementById('toggle-timeline-btn-modal')?.click();
  });
  header.querySelector('#vd-menu-studio-ui-item')?.addEventListener('click', () => {
    document.getElementById('cg-open-studio-ui-btn')?.click();
  });
  header.querySelector('#vd-menu-vfx-item')?.addEventListener('click', () => {
    document.getElementById('vfx-studio-video-director-btn')?.click();
  });
  header.querySelector('#vd-menu-cmd-item')?.addEventListener('click', () => {
    import('./director-workspace').then((m) => m.openStudioCommandPalette()).catch(() => {});
  });
  header.querySelector('#vd-menu-keyframes-item')?.addEventListener('click', () => {
    import('./camera-keyframes-ui').then((m) => m.openCameraKeyframesPanel?.()).catch(() => {});
  });
  header.querySelector('#vd-menu-vf-item')?.addEventListener('click', () => {
    document.getElementById('direct-video-visual-first-btn')?.click();
  });
  header.querySelector('#vd-menu-upload-audio-item')?.addEventListener('click', () => {
    document.getElementById('upload-audio-btn')?.click() || document.getElementById('audio-upload-input')?.click();
  });
  header.querySelector('#vd-menu-narration-item')?.addEventListener('click', () => {
    document.getElementById('direct-video-audio-first-btn')?.click();
  });
  header.querySelector('#vd-menu-shortcuts-item')?.addEventListener('click', () => {
    document.getElementById('help-btn')?.click();
  });
  header.querySelector('#vd-menu-academy-item')?.addEventListener('click', () => {
    document.getElementById('header-academy-btn')?.click();
  });

  // Action clicks inside dropdowns
  menuDropdowns.forEach((panel) => {
    panel.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Keep open if user clicked inside form inputs/selects/labels
      if (target.closest('select') || target.closest('input') || target.closest('label') || target.closest('.vd-keep-open')) {
        return;
      }

      // Close on clicking any action button or menu item
      const actionBtn = target.closest('button, a, [data-vd-action]');
      if (actionBtn) {
        setTimeout(closeAllMenus, 80);
      }
    });
  });

  // Global click outside to dismiss
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target?.closest('#vd-menubar-container')) {
      closeAllMenus();
    }
  });

  // Escape key to dismiss & Left/Right navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllMenus();
      return;
    }

    if (!activeMenuId) return;

    const triggerList = Array.from(menuTriggers);
    const currentIndex = triggerList.findIndex((t) => t.dataset.vdMenuTrigger === activeMenuId);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % triggerList.length;
      const nextName = triggerList[nextIndex]?.dataset.vdMenuTrigger;
      if (nextName) openMenu(nextName);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + triggerList.length) % triggerList.length;
      const prevName = triggerList[prevIndex]?.dataset.vdMenuTrigger;
      if (prevName) openMenu(prevName);
    }
  });

  // Close menus when director closes or switches
  window.addEventListener('contentgen:video-director-closing', closeAllMenus);

  initialized = true;
}
