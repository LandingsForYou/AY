"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");

if (menuToggle && navigation) {
  function closeMenu() {
    navigation.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Відкрити меню");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    navigation.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header")) closeMenu();
  });
}


// Catalog: native touch swipe + accessible previous/next controls.
const catalogTrack = document.querySelector(".catalog__track");
if (catalogTrack) {
  const cards = [...catalogTrack.querySelectorAll(".catalog-card")];
  const previous = document.querySelector(".catalog__arrow--prev");
  const next = document.querySelector(".catalog__arrow--next");
  const counter = document.querySelector(".catalog__counter");
  const progress = document.querySelector(".catalog__progress-fill");
  const getIndex = () => {
    const positions = cards.map((card) => Math.abs(card.offsetLeft - cards[0].offsetLeft - catalogTrack.scrollLeft));
    return positions.indexOf(Math.min(...positions));
  };
  const update = () => {
    const index = getIndex();
    previous.disabled = index === 0;
    next.disabled = catalogTrack.scrollLeft + catalogTrack.clientWidth >= catalogTrack.scrollWidth - 3;
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    if (progress) progress.style.width = `${((index + 1) / cards.length) * 100}%`;
  };
  const move = (step) => {
    const index = Math.max(0, Math.min(cards.length - 1, getIndex() + step));
    catalogTrack.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  catalogTrack.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// Accessible native dialogs for tailoring and sizing.
const ayModalTriggers = document.querySelectorAll("[data-ay-modal]");
let ayLastTrigger = null;
for (const trigger of ayModalTriggers) {
  trigger.addEventListener("click", () => {
    const dialog = document.getElementById(trigger.dataset.ayModal);
    if (!dialog || typeof dialog.showModal !== "function") return;
    ayLastTrigger = trigger;
    dialog.showModal();
    document.body.classList.add("ay-modal-open");
  });
}
for (const dialog of document.querySelectorAll(".ay-dialog")) {
  dialog.querySelector("[data-ay-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("ay-modal-open");
    ayLastTrigger?.focus();
  });
}


// AY orders: no bot credentials in browser. Configure a secure endpoint to deliver automatically.
// The endpoint must accept POST JSON and respond with { ok: true } only after bot delivery.
const AY_ORDER_ENDPOINT = ""; // Example: https://your-domain.example/api/order (do not put a bot token here)
(() => {
  const tabs = [...document.querySelectorAll('[data-order-tab]')];
  const forms = [...document.querySelectorAll('.ay-order-form')];
  const modal = document.querySelector('#ay-confirm');
  const preview = document.querySelector('#ay-confirm-preview');
  const status = document.querySelector('#ay-confirm-status');
  const share = document.querySelector('#ay-share-order');
  const copy = document.querySelector('#ay-copy-order');
  let currentMessage = '';
  const activate = (kind, focus = false) => {
    tabs.forEach(tab => { const active = tab.dataset.orderTab === kind; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus(); });
    forms.forEach(form => { form.hidden = form.dataset.kind !== kind; });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.orderTab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next].dataset.orderTab, true);
    });
  });
  const orderDialog = document.querySelector('#order-forms');
  let orderTrigger = null;
  document.querySelectorAll('[data-order-kind]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const kind = link.dataset.orderKind;
    activate(kind);
    orderTrigger = link;
    if (kind === 'product') {
      const select = document.querySelector('#ay-form-product [name="product"]');
      if (select && link.dataset.orderProduct && [...select.options].some(o => o.value === link.dataset.orderProduct)) select.value = link.dataset.orderProduct;
      const fabric = document.querySelector('#ay-form-product [name="fabric"]');
      if (fabric && link.dataset.orderFabric && [...fabric.options].some(o => o.value === link.dataset.orderFabric)) fabric.value = link.dataset.orderFabric;
    }
    const parentDialog = link.closest('dialog');
    if (parentDialog && parentDialog !== orderDialog) parentDialog.close();
    if (!orderDialog.open) orderDialog.showModal();
    document.body.classList.add('ay-modal-open');
  }));
  orderDialog.querySelector('[data-order-close]').addEventListener('click', () => orderDialog.close());
  orderDialog.addEventListener('click', event => { if (event.target === orderDialog) orderDialog.close(); });
  orderDialog.addEventListener('close', () => { document.body.classList.remove('ay-modal-open'); orderTrigger?.focus(); });
  const productForm = document.querySelector('#ay-form-product');
  const tailoringForm = document.querySelector('#ay-form-tailoring');
  const giftForm = document.querySelector('#ay-form-gift');
  const toggleCustom = () => { productForm.querySelector('[data-custom-size]').hidden = productForm.elements.size.value !== 'Індивідуальний'; };
  const toggleMattress = () => { tailoringForm.querySelector('[data-mattress]').hidden = tailoringForm.elements.product.value !== 'Простирадло на резинці'; };
  const toggleDelivery = () => { giftForm.querySelector('[data-delivery]').hidden = giftForm.elements.format.value !== 'Фізичний'; };
  productForm.elements.size.addEventListener('change', toggleCustom);
  tailoringForm.elements.product.addEventListener('change', toggleMattress);
  giftForm.elements.format.addEventListener('change', toggleDelivery);
  const labels = {name:'Ім’я',country:'Країна',contactMethod:'Спосіб зв’язку',contact:'Контакт',product:'Виріб',fabric:'Тканина',color:'Колір',size:'Розмір',quantity:'Кількість',customSize:'Індивідуальний розмір',dimensions:'Розміри виробу',mattressLength:'Довжина матраца (см)',mattressWidth:'Ширина матраца (см)',mattressHeight:'Висота матраца (см)',amount:'Номінал',format:'Формат',delivery:'Доставка',comment:'Коментар'};
  const kinds = {product:'Замовлення товару',tailoring:'Індивідуальне пошиття',gift:'Подарунковий сертифікат'};
  forms.forEach(form => form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (form.dataset.kind === 'product' && data.size !== 'Індивідуальний') delete data.customSize;
    if (form.dataset.kind === 'tailoring' && data.product !== 'Простирадло на резинці') { delete data.mattressLength; delete data.mattressWidth; delete data.mattressHeight; }
    if (form.dataset.kind === 'gift' && data.format !== 'Фізичний') delete data.delivery;
    const lines = [`🧺 AY Bedding & Home Textile`, `Нова заявка: ${kinds[form.dataset.kind]}`, ''];
    Object.entries(data).forEach(([key,value]) => { if (String(value).trim()) lines.push(`${labels[key] || key}: ${String(value).trim()}`); });
    currentMessage = lines.join('\n');
    preview.textContent = currentMessage;
    share.href = 'https://t.me/share/url?url=' + encodeURIComponent(location.origin.startsWith('http') ? location.origin + location.pathname : 'https://t.me/VlasenkoY') + '&text=' + encodeURIComponent(currentMessage);
    status.textContent = 'Заявку підготовлено. Скопіюйте її або відкрийте Telegram, оберіть чат отримувача й підтвердьте надсилання. Автоматичне надсилання поки не налаштоване.';
    orderDialog.close();
    modal.showModal();
    if (AY_ORDER_ENDPOINT) {
      status.textContent = 'Надсилаємо заявку…';
      try {
        const response = await fetch(AY_ORDER_ENDPOINT, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:form.dataset.kind,fields:data})});
        if (!response.ok) throw new Error('HTTP '+response.status);
        const result = await response.json();
        if (result.ok !== true) throw new Error('Не підтверджено доставку');
        status.textContent = 'Заявку успішно передано в чат-бот. Ми зв’яжемося з вами.';
        form.reset();
        toggleCustom();toggleMattress();toggleDelivery();
      } catch(error) { status.textContent = 'Автоматичне надсилання не вдалося. Скопіюйте заявку або надішліть її вручну через Telegram.'; }
    }
  }));
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(currentMessage); copy.textContent = 'Скопійовано ✓'; }
    catch { const selection = document.createRange();selection.selectNodeContents(preview);window.getSelection().removeAllRanges();window.getSelection().addRange(selection);copy.textContent='Виділіть і скопіюйте текст'; }
  });
  modal.querySelector('[data-confirm-close]').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',event=>{if(event.target===modal)modal.close();});
  modal.addEventListener('close',()=>{copy.textContent='Скопіювати заявку';});
})();

// Founder: story is collapsed by default and expands only on request.
(() => {
  const toggle = document.querySelector('.founder__read');
  const story = document.querySelector('#founder-full-story');
  if (!toggle || !story) return;
  story.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    story.hidden = expanded;
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('.founder__read-label').textContent = expanded
      ? 'Прочитати нашу історію повністю' : 'Згорнути історію';
  });
})();

// Gift certificates: show only supplementary information in a separate dialog.
(() => {
  const dialog = document.querySelector('#gift-info-dialog');
  const open = document.querySelector('[data-gift-info-open]');
  if (!dialog || !open) return;
  open.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-gift-info-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => open.focus());
})();


// Fabrics carousel: 3 desktop / 2 tablet / 1 mobile, catalog-matched arrows.
(() => {
  const track = document.querySelector('#fabrics-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.fabric-card')];
  const prev = document.querySelector('.fabrics__arrow--prev');
  const next = document.querySelector('.fabrics__arrow--next');
  const counter = document.querySelector('.fabrics__counter');
  const progress = document.querySelector('.fabrics__progress-fill');
  if (!cards.length || !prev || !next) return;
  const positions = () => cards.map(card => card.offsetLeft - cards[0].offsetLeft);
  const current = () => {
    const offsets = positions();
    return offsets.reduce((best, left, index) => Math.abs(left - track.scrollLeft) < Math.abs(offsets[best] - track.scrollLeft) ? index : best, 0);
  };
  const update = () => {
    const index = current();
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    if (progress) progress.style.width = `${(index + 1) / cards.length * 100}%`;
  };
  const move = step => {
    const index = Math.max(0, Math.min(cards.length - 1, current() + step));
    track.scrollTo({left: positions()[index], behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  // Fabric navigation jumps to its corresponding slide without affecting comparison.
  document.querySelectorAll('#fabrics .fabrics__nav a[href^="#fabric-"]').forEach(link => {
    link.addEventListener('click', event => {
      const card = document.querySelector(link.getAttribute('href'));
      if (!card || !track.contains(card)) return;
      event.preventDefault();
      track.scrollTo({left: card.offsetLeft - cards[0].offsetLeft, behavior:'smooth'});
    });
  });
  update();
})();
