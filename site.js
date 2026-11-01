document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".nav-toggle");
const menu = document.querySelector(".primary-nav");

const closeMenu = ({ restoreFocus = false } = {}) => {
  if (!menuButton || !menu) return;
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuButton.focus();
};

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const willOpen = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", willOpen);
    menuButton.setAttribute("aria-expanded", String(willOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (
      menu.classList.contains("is-open") &&
      event.target instanceof Node &&
      !menu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealElements = [...document.querySelectorAll(".reveal")];
for (const element of revealElements) {
  const delay = Number(element.dataset.delay || 0);
  element.style.setProperty("--reveal-delay", `${delay}ms`);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

document.querySelectorAll(".faq-list details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

const canvas = document.querySelector(".flow-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const productStage = document.querySelector(".product-stage");

if (
  productStage instanceof HTMLElement &&
  !reduceMotion &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
  productStage.addEventListener("pointermove", (event) => {
    const bounds = productStage.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    productStage.style.setProperty("--stage-tilt-x", `${horizontal * 3.4}deg`);
    productStage.style.setProperty("--stage-tilt-y", `${vertical * -2.2}deg`);
    productStage.style.setProperty("--stage-tilt-y-reverse", `${vertical * 2.2}deg`);
  });

  productStage.addEventListener("pointerleave", () => {
    productStage.style.setProperty("--stage-tilt-x", "0deg");
    productStage.style.setProperty("--stage-tilt-y", "0deg");
    productStage.style.setProperty("--stage-tilt-y-reverse", "0deg");
  });
}

if (canvas instanceof HTMLCanvasElement && !reduceMotion) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let animationFrame = 0;

  const createParticle = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.35 + 0.35,
    speedX: (Math.random() - 0.5) * 0.12,
    speedY: Math.random() * -0.12 - 0.035,
    alpha: Math.random() * 0.28 + 0.06,
  });

  const resizeCanvas = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.min(70, Math.max(28, Math.floor(width / 22)));
    particles = Array.from({ length: count }, createParticle);
  };

  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      if (particle.y < -8) {
        particle.y = height + 8;
        particle.x = Math.random() * width;
      }
      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;
      context.beginPath();
      context.fillStyle = `rgba(93, 229, 179, ${particle.alpha})`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }
    animationFrame = window.requestAnimationFrame(draw);
  };

  resizeCanvas();
  draw();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationFrame));
}
