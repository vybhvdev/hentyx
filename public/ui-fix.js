document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu") || document.querySelector("#menu");
  const drawer = document.querySelector(".drawer");

  if (!btn || !drawer) return;

  drawer.style.position = "fixed";
  drawer.style.top = "0";
  drawer.style.left = "-260px";
  drawer.style.width = "260px";
  drawer.style.height = "100%";
  drawer.style.background = "#111";
  drawer.style.transition = "left 0.25s ease";
  drawer.style.zIndex = "9999";

  btn.addEventListener("click", () => {
    if (drawer.style.left === "0px") {
      drawer.style.left = "-260px";
    } else {
      drawer.style.left = "0px";
    }
  });

  // click outside closes drawer
  document.addEventListener("click", (e) => {
    if (!drawer.contains(e.target) && !btn.contains(e.target)) {
      drawer.style.left = "-260px";
    }
  });
});
