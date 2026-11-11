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
