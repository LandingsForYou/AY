"use strict";
const mainPhoto = document.querySelector("#product-main-photo");
document.querySelectorAll(".product-page__thumb").forEach(button => {
  button.addEventListener("click", () => {
    if (!mainPhoto) return;
    mainPhoto.src = button.dataset.photo;
    mainPhoto.alt = button.dataset.alt;
    document.querySelectorAll(".product-page__thumb").forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  });
});

// Main-site mobile navigation on product pages.
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
if (menuToggle && navigation) {
  const closeMenu = () => {
    navigation.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Відкрити меню");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    navigation.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
  });
  navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
}
