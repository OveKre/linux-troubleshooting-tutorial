document.querySelectorAll("button[data-nav-target]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.assign(button.dataset.navTarget);
  });
});
