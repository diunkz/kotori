// ==========================================
// 1. DADOS DE EXEMPLO DO CATÁLOGO KOTORI
// ==========================================
const PRODUCTS = [
  {
    id: 'sv8a-terastal-jp',
    name: 'Booster Box Terastal Festival ex (SV8a)',
    category: 'Booster Box',
    language: 'Japonês · 10 Packs',
    price: 489.90,
    badge: 'Destaque',
    bgClass: 'bg-brand-moss-soft',
    icon: '📦'
  },
  {
    id: 'sv2a-151-jp',
    name: 'Booster Box Pokémon Card 151 (SV2a)',
    category: 'Booster Box',
    language: 'Japonês · 20 Packs',
    price: 649.90,
    badge: 'Clássico',
    bgClass: 'bg-brand-earth-soft',
    icon: '🔥'
  },
  {
    id: 'cgc-10-pikachu',
    name: 'Pikachu AR #173/165 — CGC Pristine 10',
    category: 'Slab',
    language: 'Japonês · Slab CGC',
    price: 420.00,
    badge: 'Slab CGC 10',
    bgClass: 'bg-brand-lilac-soft',
    icon: '💎'
  },
  {
    id: 'etb-prismatic-en',
    name: 'Elite Trainer Box Prismatic Evolutions',
    category: 'ETB',
    language: 'Inglês · Lacrada',
    price: 549.90,
    badge: 'ETB',
    bgClass: 'bg-brand-accent-soft',
    icon: '🎁'
  },
  {
    id: 'cn-gem-pack',
    name: 'Gem Pack Vol. 1 — Chinês Simplificado',
    category: 'Booster Box',
    language: 'Chinês · Exclusivo',
    price: 279.90,
    badge: 'Importado CN',
    bgClass: 'bg-brand-moss-soft',
    icon: '✨'
  },
  {
    id: 'articuno-ar-102',
    name: 'Articuno AR #102/100 — Battle Partners',
    category: 'Avulsas',
    language: 'Japonês · Near Mint',
    price: 115.00,
    badge: 'Single AR',
    bgClass: 'bg-brand-lilac-soft',
    icon: '❄️'
  }
];

const VIEW_LABELS = {
  inicio: 'Início',
  destaques: 'Destaques',
  catalogo: 'Catálogo',
  sobre: 'Sobre',
  checkout: 'Pedido'
};

// ==========================================
// 2. ESTADO GLOBAL
// ==========================================
let cart = JSON.parse(localStorage.getItem('kotori_cart')) || [];
let currentCategory = 'Todos';
let searchQuery = '';
let activeView = 'inicio';
let isTransitioning = false;
let isDraggingItem = false;
let isFeeding = false;

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initMobileMenu();
  initSettingsPopover();
  initFeedHintState();
  initDraggableItems();
  initHeroMedal();
  initCatalogFilters();
  renderProducts();
  initCartDrawer();
  renderCart();
});

// ==========================================
// 4. AVISO INTELIGENTE DE PRIMEIRA VISITA
// ==========================================
function initFeedHintState() {
  const hintEl = document.getElementById('kotori-feed-hint');
  if (!hintEl) return;

  if (sessionStorage.getItem('kotori_fed_once') === 'true') {
    hintEl.classList.add('hidden');
  }
}

// ==========================================
// 5. MENU HAMBÚRGUER MOBILE + DROPDOWN
// ==========================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const dropdown = document.getElementById('mobile-menu-dropdown');

  if (!menuBtn || !dropdown) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = dropdown.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!isHidden));
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
      dropdown.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function closeMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const dropdown = document.getElementById('mobile-menu-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
}

// ==========================================
// 6. NAVEGAÇÃO POR TELAS COM FADE RÁPIDO
// ==========================================
function initNavigation() {
  const navButtons = document.querySelectorAll('[data-nav]');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      closeMobileMenu();
      navigateTo(target);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'inicio';
    if (hash !== activeView) {
      if (hash === 'checkout' && cart.length > 0) {
        prepareCheckoutPage();
      }
      navigateTo(hash === 'checkout' && cart.length === 0 ? 'catalogo' : hash, false);
    }
  });

  const initialHash = window.location.hash.replace('#', '');
  const validViews = ['inicio', 'destaques', 'catalogo', 'sobre', 'checkout'];
  const startView = validViews.includes(initialHash) ? initialHash : 'inicio';

  if (startView === 'checkout' && cart.length > 0) {
    prepareCheckoutPage();
  }
  showViewImmediate(startView === 'checkout' && cart.length === 0 ? 'catalogo' : startView);
}

function showViewImmediate(viewName) {
  activeView = viewName;
  document.querySelectorAll('.page-view').forEach((sec) => {
    const isTarget = sec.id === `view-${viewName}`;
    sec.classList.toggle('hidden', !isTarget);
    sec.classList.toggle('is-visible', isTarget);
  });
  updateActiveNav(viewName);
}

window.navigateTo = function(viewName, updateHash = true) {
  if (isTransitioning || viewName === activeView) return;

  const currentEl = document.getElementById(`view-${activeView}`);
  const nextEl = document.getElementById(`view-${viewName}`);
  if (!nextEl) return;

  isTransitioning = true;
  updateActiveNav(viewName);

  if (updateHash) {
    history.pushState(null, '', `#${viewName}`);
  }

  currentEl.classList.remove('is-visible');

  setTimeout(() => {
    currentEl.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });

    nextEl.classList.remove('hidden');

    void nextEl.offsetWidth;
    nextEl.classList.add('is-visible');

    activeView = viewName;
    isTransitioning = false;
  }, 200);
};

function updateActiveNav(viewName) {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === viewName);
  });

  const mobileLabel = document.getElementById('mobile-current-page');
  if (mobileLabel && VIEW_LABELS[viewName]) {
    mobileLabel.textContent = VIEW_LABELS[viewName];
  }
}

// ==========================================
// 7. TEMA CLARO / ESCURO
// ==========================================
function initTheme() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun = document.getElementById('icon-sun');

  const savedTheme = localStorage.getItem('kotori_theme') || 'light';
  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const nextTheme = html.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('kotori_theme', nextTheme);
  });

  function applyTheme(theme) {
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    if (theme === 'dark') {
      iconMoon.classList.add('hidden');
      iconSun.classList.remove('hidden');
    } else {
      iconSun.classList.add('hidden');
      iconMoon.classList.remove('hidden');
    }
  }
}

// ==========================================
// 8. ENGRENAGEM DE CONFIGURAÇÕES
// ==========================================
function initSettingsPopover() {
  const btn = document.getElementById('settings-btn');
  const popover = document.getElementById('settings-popover');
  const checkbox = document.getElementById('toggle-animations');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMobileMenu();
    popover.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!popover.contains(e.target) && !btn.contains(e.target)) {
      popover.classList.add('hidden');
    }
  });

  checkbox.addEventListener('change', () => {
    document.body.classList.toggle('animations-paused', checkbox.checked);
  });
}

// ==========================================
// 9. RASTREAMENTO DOS OLHOS + ALIMENTAR PÁSSARO
// ==========================================
function updateBirdEyeTracking(targetX, targetY) {
  const birdSvg = document.getElementById('kotori-bird-svg');
  const pupilLeft = document.getElementById('kotori-pupil-left');
  const pupilRight = document.getElementById('kotori-pupil-right');

  if (!birdSvg || !pupilLeft || !pupilRight) return;

  const rect = birdSvg.getBoundingClientRect();
  const faceCenterX = rect.left + rect.width * 0.5;
  const faceCenterY = rect.top + rect.height * 0.35;

  const dx = targetX - faceCenterX;
  const dy = targetY - faceCenterY;
  const angle = Math.atan2(dy, dx);
  const maxOffset = 1.9;

  const offsetX = Math.cos(angle) * maxOffset;
  const offsetY = Math.sin(angle) * maxOffset;

  pupilLeft.setAttribute('cx', (81 + offsetX).toFixed(2));
  pupilLeft.setAttribute('cy', (53 + offsetY).toFixed(2));
  pupilLeft.setAttribute('r', '1.45');

  pupilRight.setAttribute('cx', (102 + offsetX).toFixed(2));
  pupilRight.setAttribute('cy', (50 + offsetY).toFixed(2));
  pupilRight.setAttribute('r', '1.45');
}

function resetBirdPupils() {
  const pupilLeft = document.getElementById('kotori-pupil-left');
  const pupilRight = document.getElementById('kotori-pupil-right');

  if (pupilLeft) {
    pupilLeft.setAttribute('cx', '79.8');
    pupilLeft.setAttribute('cy', '51.8');
    pupilLeft.setAttribute('r', '1.2');
  }
  if (pupilRight) {
    pupilRight.setAttribute('cx', '100.8');
    pupilRight.setAttribute('cy', '48.8');
    pupilRight.setAttribute('r', '1.2');
  }
}

function triggerHappyBird() {
  const birdSvg = document.getElementById('kotori-bird-svg');
  const heroBtn = document.getElementById('hero-flip-btn');
  const feedHint = document.getElementById('kotori-feed-hint');
  const feedHintText = document.getElementById('kotori-feed-hint-text');

  if (!birdSvg || !heroBtn) return;

  isFeeding = true;
  resetBirdPupils();
  heroBtn.classList.remove('is-flipped');
  heroBtn.classList.add('no-hover-flip');

  const alreadyFed = sessionStorage.getItem('kotori_fed_once') === 'true';
  if (!alreadyFed && feedHint && feedHintText) {
    sessionStorage.setItem('kotori_fed_once', 'true');
    feedHintText.textContent = 'Nhac! O Kotori ficou super feliz ♥';
  }

  birdSvg.classList.remove('is-happy');
  void birdSvg.offsetWidth;
  birdSvg.classList.add('is-happy');

  clearTimeout(window._happyBirdTimer);
  window._happyBirdTimer = setTimeout(() => {
    birdSvg.classList.remove('is-happy');

    if (feedHint && !feedHint.classList.contains('hidden')) {
      feedHint.classList.add('opacity-0', 'translate-y-1');
      setTimeout(() => feedHint.classList.add('hidden'), 450);
    }

    isFeeding = false;
    heroBtn.classList.remove('no-hover-flip');
  }, 2400);
}

function initDraggableItems() {
  const items = document.querySelectorAll('.draggable-sticker');
  const heroBtn = document.getElementById('hero-flip-btn');

  items.forEach((item) => {
    const isSeed = item.classList.contains('seed-item');
    const baseRotate = item.dataset.rotate || '0';
    let offsetX = 0;
    let offsetY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    item.style.transform = `translate(0px, 0px) rotate(${baseRotate}deg)`;

    item.addEventListener('pointerdown', (e) => {
      isDragging = true;
      isDraggingItem = true;
      heroBtn.classList.remove('is-flipped');
      heroBtn.classList.add('no-hover-flip');

      item.setPointerCapture(e.pointerId);
      item.classList.remove('is-returning');
      item.classList.add('is-dragging');

      startX = e.clientX - offsetX;
      startY = e.clientY - offsetY;

      if (isSeed && !isFeeding) {
        const rect = item.getBoundingClientRect();
        updateBirdEyeTracking(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });

    item.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      offsetX = e.clientX - startX;
      offsetY = e.clientY - startY;
      item.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${baseRotate}deg) scale(1.12)`;

      if (isSeed && !isFeeding) {
        const rect = item.getBoundingClientRect();
        updateBirdEyeTracking(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });

    const stopDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      isDraggingItem = false;
      item.releasePointerCapture(e.pointerId);
      item.classList.remove('is-dragging');

      if (isSeed) {
        resetBirdPupils();
      }

      const itemRect = item.getBoundingClientRect();
      const birdRect = heroBtn.getBoundingClientRect();
      const centerX = itemRect.left + itemRect.width / 2;
      const centerY = itemRect.top + itemRect.height / 2;

      const isOverBird =
        centerX >= birdRect.left &&
        centerX <= birdRect.right &&
        centerY >= birdRect.top &&
        centerY <= birdRect.bottom;

      if (isSeed && isOverBird) {
        triggerHappyBird();
        item.classList.add('is-eaten');

        offsetX = 0;
        offsetY = 0;
        item.style.transform = `translate(0px, 0px) rotate(${baseRotate}deg) scale(0.5)`;

        setTimeout(() => {
          item.classList.add('is-returning');
          item.classList.remove('is-eaten');
          item.style.transform = `translate(0px, 0px) rotate(${baseRotate}deg) scale(1)`;
        }, 2500);
      } else {
        setTimeout(() => {
          if (!isFeeding && !isDraggingItem) {
            heroBtn.classList.remove('no-hover-flip');
          }
        }, 350);

        offsetX = 0;
        offsetY = 0;
        item.classList.add('is-returning');
        item.style.transform = `translate(0px, 0px) rotate(${baseRotate}deg) scale(1)`;
      }
    };

    item.addEventListener('pointerup', stopDrag);
    item.addEventListener('pointercancel', stopDrag);
  });
}

// ==========================================
// 10. MEDALHÃO CENTRAL (GIRO RÁPIDO NO PC + SWIPE NO MOBILE)
// ==========================================
function initHeroMedal() {
  const heroBtn = document.getElementById('hero-flip-btn');
  let isHovered = false;
  let touchStartX = 0;
  let didSwipe = false;

  heroBtn.addEventListener('mouseenter', () => {
    isHovered = true;
    if (isDraggingItem || isFeeding) return;
    heroBtn.classList.add('is-flipped');
  });

  heroBtn.addEventListener('mouseleave', () => {
    isHovered = false;
    heroBtn.classList.remove('is-flipped');
  });

  function triggerAutoFlip() {
    const isPaused = document.body.classList.contains('animations-paused');
    const isDesktop = window.innerWidth >= 640;

    if (!isPaused && !isHovered && !isDraggingItem && !isFeeding && isDesktop && activeView === 'inicio') {
      heroBtn.classList.add('is-flipped');
      setTimeout(() => {
        if (!isHovered) {
          heroBtn.classList.remove('is-flipped');
        }
      }, 650);
    }
  }

  setTimeout(() => {
    triggerAutoFlip();
    setInterval(triggerAutoFlip, 5200);
  }, 1800);

  heroBtn.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    didSwipe = false;
  }, { passive: true });

  heroBtn.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 25 && !isFeeding) {
      didSwipe = true;
      heroBtn.classList.add('is-flipped');

      clearTimeout(window._flipResetTimer);
      window._flipResetTimer = setTimeout(() => {
        heroBtn.classList.remove('is-flipped');
      }, 2500);
    }
  }, { passive: true });

  heroBtn.addEventListener('click', () => {
    if (didSwipe) {
      didSwipe = false;
      return;
    }
    heroBtn.classList.add('is-flipped');
    setTimeout(() => {
      navigateTo('catalogo');
      setTimeout(() => heroBtn.classList.remove('is-flipped'), 300);
    }, 220);
  });
}

// ==========================================
// 11. CATÁLOGO, BUSCA E FILTROS
// ==========================================
function initCatalogFilters() {
  const filterButtons = document.querySelectorAll('.filter-pill');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyCategoryFilter(btn.dataset.category);
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    renderProducts();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderProducts();
  });
}

function applyCategoryFilter(category) {
  currentCategory = category;
  const filterButtons = document.querySelectorAll('.filter-pill');

  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.category === category;
    btn.classList.toggle('border-foreground', isActive);
    btn.classList.toggle('bg-foreground', isActive);
    btn.classList.toggle('text-background', isActive);
    btn.classList.toggle('border-border', !isActive);
    btn.classList.toggle('bg-card', !isActive);
    btn.classList.toggle('text-muted-foreground', !isActive);
  });

  renderProducts();
}

window.filterCatalog = function(category) {
  applyCategoryFilter(category);
  navigateTo('catalogo');
};

function getProductActionHTML(productId) {
  const inCart = cart.find((item) => item.id === productId);
  if (!inCart) {
    return `
      <button
        type="button"
        onclick="addToCart('${productId}')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-transform hover:scale-105 active:scale-95"
      >
        + Adicionar
      </button>
    `;
  }

  return `
    <div class="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-xs">
      <button
        type="button"
        onclick="updateCartQty('${productId}', -1)"
        aria-label="Diminuir quantidade"
        class="flex h-5 w-5 items-center justify-center rounded-full hover:bg-background/20 font-bold"
      >−</button>
      <span class="min-w-[16px] text-center font-bold">${inCart.qty}</span>
      <button
        type="button"
        onclick="updateCartQty('${productId}', 1)"
        aria-label="Aumentar quantidade"
        class="flex h-5 w-5 items-center justify-center rounded-full hover:bg-background/20 font-bold"
      >+</button>
    </div>
  `;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.className = 'mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';

  const filtered = PRODUCTS.filter((item) => {
    const matchesCategory = currentCategory === 'Todos' || item.category === currentCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery) ||
      item.language.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full rounded-3xl border border-border bg-background-soft p-10 text-center">
        <p class="text-base font-semibold">Nenhum item encontrado</p>
        <p class="mt-1 text-sm text-muted-foreground">Tente buscar por outro nome ou limpar os filtros.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
      <article class="group flex flex-col justify-between rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-md">
        <div>
          <div class="relative flex aspect-[4/3] items-center justify-center rounded-2xl ${product.bgClass} p-6">
            <span class="absolute left-3 top-3 rounded-full border border-border bg-card/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              ${product.badge}
            </span>
            <span class="text-5xl transition-transform duration-300 group-hover:scale-110">${product.icon}</span>
          </div>

          <p class="mt-4 text-xs text-muted-foreground">${product.language}</p>
          <h3 class="mt-1 font-display text-base font-bold leading-snug">${product.name}</h3>
        </div>

        <div class="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-border">
          <span class="font-display text-lg font-bold whitespace-nowrap shrink-0">${formatBRL(product.price)}</span>
          <div id="product-action-${product.id}" class="relative shrink-0">
            ${getProductActionHTML(product.id)}
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

function updateProductCardAction(productId) {
  const wrapper = document.getElementById(`product-action-${productId}`);
  if (!wrapper) return;

  const activeFeedback = wrapper.querySelector('.btn-feedback-bubble, .btn-plus-one');
  wrapper.innerHTML = getProductActionHTML(productId);
  if (activeFeedback) {
    wrapper.appendChild(activeFeedback);
  }
}

function showButtonFeedback(productId, type) {
  const wrapper = document.getElementById(`product-action-${productId}`);
  if (!wrapper) return;

  wrapper.querySelectorAll('.btn-feedback-bubble, .btn-plus-one').forEach((el) => el.remove());

  const badge = document.createElement('span');

  if (type === 'added') {
    badge.className = 'btn-feedback-bubble rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background shadow-md';
    badge.textContent = 'Adicionado ao carrinho!';
  } else if (type === 'plus-one') {
    badge.className = 'btn-plus-one rounded-full bg-brand-moss px-2.5 py-1 text-xs font-extrabold text-zinc-950 shadow-sm';
    badge.textContent = '+1';
  } else if (type === 'minus-one') {
    badge.className = 'btn-plus-one rounded-full bg-brand-earth-soft border border-border px-2.5 py-1 text-xs font-extrabold text-foreground shadow-sm';
    badge.textContent = '-1';
  } else if (type === 'removed') {
    badge.className = 'btn-feedback-bubble rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md';
    badge.textContent = 'Removido do carrinho';
  }

  wrapper.appendChild(badge);
  badge.addEventListener('animationend', () => badge.remove(), { once: true });
}

// ==========================================
// 12. CARRINHO DE COMPRAS E CHECKOUT QR CODE
// ==========================================
function initCartDrawer() {
  const openBtn = document.getElementById('open-cart-btn');
  const closeBtn = document.getElementById('close-cart-btn');
  const clearBtn = document.getElementById('clear-cart-btn');
  const backdrop = document.getElementById('cart-backdrop');
  const drawer = document.getElementById('cart-drawer');
  const whatsappBtn = document.getElementById('checkout-whatsapp-btn');

  const openDrawer = () => {
    closeMobileMenu();
    backdrop.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
  };

  const closeDrawer = () => {
    backdrop.classList.add('hidden');
    drawer.classList.add('translate-x-full');
  };

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  clearBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
  });

  whatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    prepareCheckoutPage();
    closeDrawer();
    navigateTo('checkout');
  });
}

function prepareCheckoutPage() {
  const qrImg = document.getElementById('checkout-qr-img');
  const directLink = document.getElementById('checkout-direct-link');
  if (!qrImg || !directLink || cart.length === 0) return;

  const lines = cart.map(
    (item) => `• ${item.qty}x ${item.name} (${formatBRL(item.price * item.qty)})`
  );
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const message = encodeURIComponent(
    `Olá! Gostaria de fazer o seguinte pedido:\n\n${lines.join('\n')}\n\n*Subtotal:* ${formatBRL(total)}\n*Cidade/Bairro (Manaus):* `
  );

  const whatsappUrl = `https://wa.me/5592995254107?text=${message}`;
  directLink.href = whatsappUrl;
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&data=${encodeURIComponent(whatsappUrl)}`;
}

window.addToCart = function(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
    saveCart();
    renderCart();
    updateProductCardAction(productId);
    showButtonFeedback(productId, 'plus-one');
  } else {
    cart.push({ ...product, qty: 1 });
    saveCart();
    renderCart();
    updateProductCardAction(productId);
    showButtonFeedback(productId, 'added');
  }
};

window.updateCartQty = function(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
    saveCart();
    renderCart();
    updateProductCardAction(productId);
    showButtonFeedback(productId, 'removed');
  } else {
    saveCart();
    renderCart();
    updateProductCardAction(productId);
    if (delta > 0) {
      showButtonFeedback(productId, 'plus-one');
    } else if (delta < 0) {
      showButtonFeedback(productId, 'minus-one');
    }
  }
};

window.removeFromCart = function(productId) {
  const exists = cart.some((i) => i.id === productId);
  if (!exists) return;

  cart = cart.filter((i) => i.id !== productId);
  saveCart();
  renderCart();
  updateProductCardAction(productId);
  showButtonFeedback(productId, 'removed');
};

function saveCart() {
  localStorage.setItem('kotori_cart', JSON.stringify(cart));
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const badge = document.getElementById('cart-badge');
  const subtotalEl = document.getElementById('cart-subtotal');

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  badge.textContent = totalItems;
  subtotalEl.textContent = formatBRL(subtotal);

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <p class="text-sm font-medium">Seu carrinho está vazio</p>
        <p class="mt-1 text-xs">Explore o catálogo para adicionar boxes ou cartas.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
      <div class="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background-soft p-3.5">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bgClass} text-xl">
            ${item.icon}
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold leading-snug line-clamp-2">${item.name}</h4>
            <p class="mt-0.5 text-xs text-muted-foreground">${formatBRL(item.price)}</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <div class="flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 text-xs">
            <button type="button" onclick="updateCartQty('${item.id}', -1)" aria-label="Diminuir quantidade" class="px-1 font-bold hover:text-muted-foreground">−</button>
            <span class="min-w-[16px] text-center font-semibold">${item.qty}</span>
            <button type="button" onclick="updateCartQty('${item.id}', 1)" aria-label="Aumentar quantidade" class="px-1 font-bold hover:text-muted-foreground">+</button>
          </div>

          <button
            type="button"
            onclick="removeFromCart('${item.id}')"
            aria-label="Remover item do carrinho"
            title="Remover item"
            class="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}