/* =========================================================
   PUZOV CLIENT — interactions
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     toasts
  --------------------------------------------------------- */
  const toastHost = $('#toasts');
  function toast(message) {
    if (!toastHost) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    toastHost.append(el);
    while (toastHost.children.length > 4) toastHost.firstElementChild.remove();
    window.setTimeout(() => {
      el.classList.add('is-out');
      window.setTimeout(() => el.remove(), 320);
    }, 3400);
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-toast]');
    if (trigger) {
      event.preventDefault();
      toast(trigger.getAttribute('data-toast'));
    }
  });

  /* ---------------------------------------------------------
     pixel avatars
  --------------------------------------------------------- */
  const AVATARS = {
    steve: {
      palette: { H: '#3d2b1f', S: '#c99a6b', B: '#3f6da8', W: '#ececec', M: '#7a4a2d' },
      rows: [
        'HHHHHHHH',
        'HHHHHHHH',
        'HSSSSSSH',
        'HSBWWBSH',
        'HSSSSSSH',
        'HSSMMSSH',
        'HSSSSSSH',
        'HHSSSSHH'
      ]
    },
    steve2: {
      palette: { H: '#2c2119', S: '#b98a5e', B: '#3a5f92', W: '#e4e4e4', M: '#4a3324' },
      rows: [
        'HHHHHHHH',
        'HHSSSSHH',
        'HSSSSSSH',
        'HSBWWBSH',
        'HSSSSSSH',
        'HSMMMMSH',
        'HSSSSSSH',
        'HHSSSSHH'
      ]
    },
    cap: {
      palette: { R: '#cf4b3f', K: '#241f1c', S: '#d6a077', B: '#2f5d99', W: '#f2f2f2', M: '#8a5a3b' },
      rows: [
        'RRRRRRRR',
        'RRRRRRRR',
        'RSSSSSSR',
        'KSSSSSSK',
        'KSBWWBSK',
        'KSSSSSSK',
        'KSSMMSSK',
        'KKSSSSKK'
      ]
    },
    pink: {
      palette: { P: '#e07aa8', S: '#f2c6b3', B: '#4b7bc4', W: '#ffffff', M: '#c96a8f' },
      rows: [
        'PPPPPPPP',
        'PPPPPPPP',
        'PSSSSSSP',
        'PSBWWBSP',
        'PSSSSSSP',
        'PSSMMSSP',
        'PPSSSSPP',
        'PPSSSSPP'
      ]
    },
    glasses: {
      palette: { H: '#2e2e33', S: '#d8a97e', K: '#111114', G: '#6fe3ff', M: '#8a5a3b' },
      rows: [
        'HHHHHHHH',
        'HHHHHHHH',
        'HSSSSSSH',
        'HKKGKKKH',
        'HSSSSSSH',
        'HSSMMSSH',
        'HSSSSSSH',
        'HHSSSSHH'
      ]
    }
  };

  function drawAvatar(canvas, name) {
    const avatar = AVATARS[name] || AVATARS.steve;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cell = canvas.width / 8;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    avatar.rows.forEach((row, y) => {
      row.split('').forEach((key, x) => {
        const color = avatar.palette[key];
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      });
    });
  }

  $$('canvas[data-avatar]').forEach((canvas) => {
    drawAvatar(canvas, canvas.getAttribute('data-avatar'));
  });

  /* ---------------------------------------------------------
     client modules
  --------------------------------------------------------- */
  const MODULES = {
    combat: [
      { id: 'killaura', name: 'KillAura', desc: 'Бьёт всё, что движется. Иногда — воздух.', key: 'R', on: true },
      { id: 'reach', name: 'Reach', desc: 'Достаёт до цели. И до совести.', key: '—', on: true, range: { label: 'Range', min: 3, max: 6, step: 0.01, value: 3.42 } },
      { id: 'triggerbot', name: 'TriggerBot', desc: 'Стреляет, когда ты уже умер от страха.', key: 'V', on: false },
      { id: 'autoclicker', name: 'AutoClicker', desc: '12 CPS чистыми, без мозолей.', key: 'C', on: false },
      { id: 'criticals', name: 'Criticals', desc: 'Прыжок веры в хитбокс.', key: '—', on: false },
      { id: 'velocity', name: 'Velocity', desc: 'Отбрасывание? Не слышали.', key: '—', on: false }
    ],
    movement: [
      { id: 'fly', name: 'Fly', desc: 'Гравитация — опция. Мы её выключили.', key: 'F', on: true, range: { label: 'Speed', min: 0.5, max: 3, step: 0.05, value: 1.2 } },
      { id: 'speed', name: 'Speed', desc: 'Быстрее, чем античит грузит чанки.', key: '—', on: false },
      { id: 'sprint', name: 'Sprint', desc: 'Спринт, который не заканчивается.', key: '—', on: true },
      { id: 'nofall', name: 'NoFall', desc: 'Падать больно. Нам — нет.', key: '—', on: false },
      { id: 'step', name: 'Step', desc: 'Бордюры — для пешеходов.', key: '—', on: false },
      { id: 'jesus', name: 'Jesus', desc: 'Ходит по воде. Пьёт только чай.', key: 'J', on: false }
    ],
    visuals: [
      { id: 'esp', name: 'ESP', desc: 'Видит всех. Даже того, кто в стене.', key: 'X', on: true },
      { id: 'tracers', name: 'Tracers', desc: 'Линии до врагов. Как в кино.', key: '—', on: false },
      { id: 'xray', name: 'X-Ray', desc: 'Алмазы сами себя не найдут.', key: '—', on: false },
      { id: 'fullbright', name: 'Fullbright', desc: 'Ночь? Какая ночь.', key: 'G', on: false },
      { id: 'nametags', name: 'Nametags', desc: 'Имена, дистанция, здоровье. Всё как у людей.', key: '—', on: false },
      { id: 'chams', name: 'Chams', desc: 'Враги светятся. Красиво.', key: '—', on: false }
    ],
    player: [
      { id: 'scaffold', name: 'Scaffold', desc: 'Строит под ногами. Не спотыкается.', key: '—', on: false },
      { id: 'autototem', name: 'AutoTotem', desc: 'Тотем всегда на месте. Даже когда тебя нет.', key: '—', on: false },
      { id: 'cheststealer', name: 'ChestStealer', desc: 'Сундук опустел. Ты — нет.', key: '—', on: false },
      { id: 'fastplace', name: 'FastPlace', desc: 'Ставит блоки быстрее, чем думает.', key: '—', on: false },
      { id: 'inventorymove', name: 'InventoryMove', desc: 'Инвентарь на бегу. Цивилизация.', key: '—', on: false },
      { id: 'noslowdown', name: 'NoSlowdown', desc: 'Замедление? Не слышали.', key: '—', on: false }
    ],
    misc: [
      { id: 'antiafk', name: 'AntiAFK', desc: 'Ты спишь. Клиент работает.', key: '—', on: false },
      { id: 'autorespawn', name: 'AutoRespawn', desc: 'Смерть — это просто кнопка.', key: '—', on: true },
      { id: 'spammer', name: 'Spammer', desc: 'Реклама сервера. Тактично.', key: '—', on: false },
      { id: 'fakelag', name: 'FakeLag', desc: 'Лагает только для других. Удобно.', key: '—', on: false },
      { id: 'pingspoof', name: 'PingSpoof', desc: 'Пинг 12 мс. Честно.', key: '—', on: false },
      { id: 'selfdestruct', name: 'SelfDestruct', desc: 'Удаляет клиент. И улики.', key: 'Ins', on: false }
    ]
  };

  const CATEGORY_LABELS = {
    combat: 'Combat',
    movement: 'Movement',
    visuals: 'Visuals',
    player: 'Player',
    misc: 'Misc'
  };

  const listEl = $('#moduleList');
  const tabs = $$('#moduleTabs .client__tab');
  const categoryTitle = $('#categoryTitle');
  const categoryHint = $('#categoryHint');
  const activeCountEl = $('#activeCount');
  const searchEl = $('#moduleSearch');
  let currentCat = 'combat';
  let searchQuery = '';

  const allModules = () => Object.values(MODULES).flat();

  function updateActiveCount() {
    if (activeCountEl) activeCountEl.textContent = String(allModules().filter((m) => m.on).length);
  }

  function rangeStyle(range) {
    const pct = ((range.value - range.min) / (range.max - range.min)) * 100;
    return pct.toFixed(1) + '%';
  }

  function renderModules() {
    if (!listEl) return;
    const items = MODULES[currentCat] || [];
    const query = searchQuery.trim().toLowerCase();
    const visible = query
      ? items.filter((m) => (m.name + ' ' + m.desc).toLowerCase().includes(query))
      : items;

    if (!visible.length) {
      listEl.innerHTML = '<div class="client__empty">ничего не найдено. как и читов на этом сайте</div>';
    } else {
      listEl.innerHTML = visible.map((m) => {
        const range = m.range
          ? `<div class="module__range">
               <span>${m.range.label}</span>
               <input type="range" min="${m.range.min}" max="${m.range.max}" step="${m.range.step}"
                      value="${m.range.value}" data-range="${m.id}" aria-label="${m.range.label}"
                      style="--val:${rangeStyle(m.range)}">
               <b>${m.range.value}</b>
             </div>`
          : '';
        return `<div class="module${m.on ? ' is-on' : ''}" data-module="${m.id}">
          <div class="module__row">
            <div>
              <div class="module__name">${m.name}</div>
              <div class="module__desc">${m.desc}</div>
            </div>
            <span class="module__key">${m.key}</span>
            <button class="toggle" type="button" role="switch" aria-checked="${m.on}" aria-label="${m.name}"></button>
          </div>
          ${range}
        </div>`;
      }).join('');
    }

    if (categoryTitle) categoryTitle.textContent = CATEGORY_LABELS[currentCat];
    if (categoryHint) {
      categoryHint.textContent = query
        ? `найдено ${visible.length} из ${items.length}`
        : `${items.length} модулей · кликни по тумблеру`;
    }
    updateActiveCount();
  }

  function activateTab(tab) {
    currentCat = tab.dataset.cat;
    searchQuery = '';
    if (searchEl) searchEl.value = '';
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    if (listEl) listEl.setAttribute('aria-labelledby', tab.id);
    renderModules();
    if (listEl) listEl.scrollTop = 0;
  }

  tabs.forEach((tab) => {
    tab.querySelector('i').textContent = String((MODULES[tab.dataset.cat] || []).length);
    tab.addEventListener('click', () => activateTab(tab));
  });

  const tablist = $('#moduleTabs');
  if (tablist) {
    tablist.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(current + 1) % tabs.length];
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(current - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      next.focus();
      activateTab(next);
    });
  }

  if (listEl) {
    listEl.addEventListener('click', (event) => {
      const toggle = event.target.closest('.toggle');
      if (!toggle) return;
      const moduleEl = toggle.closest('[data-module]');
      const mod = (MODULES[currentCat] || []).find((m) => m.id === moduleEl.dataset.module);
      if (!mod) return;
      mod.on = !mod.on;
      toggle.setAttribute('aria-checked', String(mod.on));
      moduleEl.classList.toggle('is-on', mod.on);
      updateActiveCount();
      if (mod.id === 'selfdestruct' && mod.on) {
        toast('Клиент удалён. Шутка. Он и не устанавливался.');
      }
    });

    listEl.addEventListener('input', (event) => {
      const input = event.target.closest('[data-range]');
      if (!input) return;
      const moduleEl = input.closest('[data-module]');
      const mod = (MODULES[currentCat] || []).find((m) => m.id === moduleEl.dataset.module);
      if (!mod || !mod.range) return;
      mod.range.value = Number(input.value);
      input.style.setProperty('--val', rangeStyle(mod.range));
      const label = moduleEl.querySelector('.module__range b');
      if (label) label.textContent = Number(input.value).toFixed(2).replace(/\.?0+$/, '');
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value;
      renderModules();
    });
  }

  renderModules();

  /* ---------------------------------------------------------
     header / scroll progress
  --------------------------------------------------------- */
  const header = $('#header');
  const progress = $('#scrollProgress');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 12);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${Math.min(100, (y / Math.max(1, max)) * 100)}%`;
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     mobile menu
  --------------------------------------------------------- */
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');

  function setMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  }

  if (burger) {
    burger.addEventListener('click', () => {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (mobileMenu) {
    $$('a', mobileMenu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
    $$('[data-open-pay]', mobileMenu).forEach((button) => button.addEventListener('click', () => setMenu(false)));
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) setMenu(false);
  });

  /* ---------------------------------------------------------
     reveal on scroll
  --------------------------------------------------------- */
  const revealEls = $$('.reveal');
  ['.bento .card', '.reviews .review', '.faq__item'].forEach((selector) => {
    $$(selector).forEach((el, index) => el.style.setProperty('--d', `${index * 55}ms`));
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     cursor glow
  --------------------------------------------------------- */
  const glow = $('#cursorGlow');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (glow && finePointer && !reduceMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;
    let raf = 0;

    const loop = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = window.requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!glow.classList.contains('is-on')) {
        glow.classList.add('is-on');
        raf = window.requestAnimationFrame(loop);
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      glow.classList.remove('is-on');
      window.cancelAnimationFrame(raf);
      raf = 0;
    });
  }

  /* ---------------------------------------------------------
     hero tilt
  --------------------------------------------------------- */
  const tiltEl = $('[data-tilt]');
  if (tiltEl && finePointer && !reduceMotion) {
    const scene = $('.scene', tiltEl);
    tiltEl.addEventListener('pointermove', (event) => {
      const rect = tiltEl.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      if (scene) {
        scene.style.setProperty('--ry', `${px * 7}deg`);
        scene.style.setProperty('--rx', `${py * -7}deg`);
      }
    });
    tiltEl.addEventListener('pointerleave', () => {
      if (scene) {
        scene.style.setProperty('--ry', '0deg');
        scene.style.setProperty('--rx', '0deg');
      }
    });
  }

  /* ---------------------------------------------------------
     faq accordion
  --------------------------------------------------------- */
  const faqButtons = $$('.faq__q');
  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq__item');
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach((other) => {
        if (other === button) return;
        other.setAttribute('aria-expanded', 'false');
        const otherItem = other.closest('.faq__item');
        if (otherItem) otherItem.classList.remove('is-open');
      });
      button.setAttribute('aria-expanded', String(!isOpen));
      if (item) item.classList.toggle('is-open', !isOpen);
    });
  });

  /* ---------------------------------------------------------
     payment modal
  --------------------------------------------------------- */
  const dialog = $('#payDialog');
  const payBtn = $('#payBtn');
  const payStep = dialog && $('[data-step="pay"]', dialog);
  const doneStep = dialog && $('[data-step="done"]', dialog);
  let payTimer = 0;

  function resetPay() {
    window.clearTimeout(payTimer);
    if (payStep) payStep.hidden = false;
    if (doneStep) doneStep.hidden = true;
    if (payBtn) {
      payBtn.disabled = false;
      const label = $('span', payBtn);
      if (label) label.textContent = 'Оплатить 100 ₽';
      payBtn.style.opacity = '';
    }
  }

  function openPay() {
    if (!dialog) return;
    resetPay();
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('modal-open');
  }

  function closePay() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('modal-open');
  }

  $$('[data-open-pay]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openPay();
    });
  });
  $$('[data-close-pay]').forEach((button) => {
    button.addEventListener('click', closePay);
  });
  if (dialog) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closePay();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      window.setTimeout(resetPay, 220);
    });
  }

  if (payBtn) {
    payBtn.addEventListener('click', () => {
      if (payBtn.disabled) return;
      payBtn.disabled = true;
      payBtn.style.opacity = '.75';
      const label = $('span', payBtn);
      if (label) label.textContent = 'Соединяемся с банком…';
      payTimer = window.setTimeout(() => {
        if (payStep) payStep.hidden = true;
        if (doneStep) doneStep.hidden = false;
        payBtn.disabled = false;
        payBtn.style.opacity = '';
        if (label) label.textContent = 'Оплатить 100 ₽';
        burstConfetti();
      }, 1350);
    });
  }

  $$('.pay-method').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.pay-method').forEach((b) => b.classList.toggle('is-active', b === button));
      if (payBtn) payBtn.dataset.method = button.textContent.trim();
    });
  });

  const copyKeyBtn = $('[data-copy-key]');
  if (copyKeyBtn) {
    copyKeyBtn.addEventListener('click', async () => {
      const keyEl = $('#licenseKey');
      const text = keyEl ? keyEl.textContent.trim() : '';
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (error) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.append(ta);
        ta.select();
        try {
          ok = document.execCommand('copy');
        } catch (e) {
          ok = false;
        }
        ta.remove();
      }
      toast(ok ? 'Ключ скопирован. Иди в лоадер, которого нет.' : 'Не получилось скопировать. Вот ключ: ' + text);
    });
  }

  /* ---------------------------------------------------------
     confetti + easter eggs
  --------------------------------------------------------- */
  function burstConfetti() {
    if (reduceMotion) return;
    const colors = ['#c6ff4a', '#9be94a', '#8b5cf6', '#5ee7ff', '#f2f3ee'];
    for (let i = 0; i < 64; i += 1) {
      const piece = document.createElement('i');
      const size = 5 + Math.random() * 6;
      piece.style.cssText = `position:fixed;top:${18 + Math.random() * 18}vh;left:${50 + (Math.random() - 0.5) * 16}vw;width:${size}px;height:${size}px;background:${colors[i % colors.length]};z-index:300;pointer-events:none;border-radius:1px;`;
      document.body.append(piece);
      const dx = (Math.random() - 0.5) * 70;
      const dy = 55 + Math.random() * 40;
      const spin = (Math.random() - 0.5) * 900;
      const anim = piece.animate([
        { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate3d(${dx}vw, ${dy}vh, 0) rotate(${spin}deg)`, opacity: 0 }
      ], {
        duration: 1500 + Math.random() * 1500,
        easing: 'cubic-bezier(.18,.62,.32,1)'
      });
      anim.onfinish = () => piece.remove();
    }
  }

  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea')) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === konami[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        document.documentElement.classList.add('godmode');
        toast('GODMODE активирован. Античит плачет. Мама звонит.');
        burstConfetti();
        window.setTimeout(() => document.documentElement.classList.remove('godmode'), 7000);
      }
    } else {
      konamiIndex = 0;
    }
  });

  console.log(
    '%c PUZOV CLIENT ',
    'background:#c6ff4a;color:#0a0d05;font-weight:800;padding:7px 12px;border-radius:5px;font-family:monospace',
    '\n100 ₽ навсегда. Сайт-шутка: читов нет, ключ ненастоящий, домен куплен ради рофла.\nПривет, друг.'
  );
})();
