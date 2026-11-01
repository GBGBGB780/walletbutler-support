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

window.requestAnimationFrame(() => {
  document.querySelectorAll(".hero .reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
});

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
const storySection = document.querySelector(".story-section");
const storyScenes = [...document.querySelectorAll("[data-story-scene]")];
const storyMarkers = [...document.querySelectorAll("[data-story-marker]")];
const storyProgressFill = document.querySelector(".story-progress-track i");
const privacyDeviceWrap = document.querySelector(".privacy-device-wrap");

const activateStoryScene = (scene) => {
  if (!(scene instanceof HTMLElement)) return;
  const activeIndex = scene.dataset.storyScene;
  storyScenes.forEach((item) => {
    item.classList.toggle("is-active", item === scene);
  });
  storyMarkers.forEach((marker) => {
    const isActive = marker.dataset.storyMarker === activeIndex;
    marker.classList.toggle("is-active", isActive);
    if (isActive) marker.setAttribute("aria-current", "step");
    else marker.removeAttribute("aria-current");
  });
};

if (storyScenes.length && "IntersectionObserver" in window) {
  const storyObserver = new IntersectionObserver(
    (entries) => {
      const visibleScenes = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
      if (visibleScenes[0]) activateStoryScene(visibleScenes[0].target);
    },
    {
      rootMargin: "-27% 0px -39% 0px",
      threshold: [0.08, 0.2, 0.4, 0.64],
    },
  );
  storyScenes.forEach((scene) => storyObserver.observe(scene));
}

storyMarkers.forEach((marker) => {
  marker.addEventListener("click", () => {
    const scene = storyScenes.find(
      (item) => item.dataset.storyScene === marker.dataset.storyMarker,
    );
    activateStoryScene(scene);
  });
});

let scrollAnimationFrame = 0;

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

const updateScrollMotion = () => {
  scrollAnimationFrame = 0;

  if (reduceMotion) {
    storyScenes.forEach((scene) => scene.style.removeProperty("--scene-parallax"));
    productStage?.style.removeProperty("--stage-scroll-shift");
    productStage?.style.removeProperty("--stage-scroll-scale");
    privacyDeviceWrap?.style.removeProperty("--privacy-scroll-shift");
    if (storyProgressFill instanceof HTMLElement) {
      storyProgressFill.style.setProperty("--story-progress", "1");
    }
    return;
  }

  if (productStage instanceof HTMLElement) {
    const hero = productStage.closest(".hero");
    const heroRect = hero?.getBoundingClientRect();
    if (heroRect) {
      const heroProgress = clamp(-heroRect.top / Math.max(heroRect.height, 1), 0, 1);
      productStage.style.setProperty(
        "--stage-scroll-shift",
        `${(heroProgress * -44).toFixed(2)}px`,
      );
      productStage.style.setProperty(
        "--stage-scroll-scale",
        `${(1 - heroProgress * 0.035).toFixed(4)}`,
      );
    }
  }

  storyScenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
    const centerOffset =
      (rect.top + rect.height / 2 - window.innerHeight / 2) /
      Math.max(window.innerHeight, 1);
    scene.style.setProperty(
      "--scene-parallax",
      `${(clamp(centerOffset, -1, 1) * -18).toFixed(2)}px`,
    );
  });

  if (storySection instanceof HTMLElement) {
    const rect = storySection.getBoundingClientRect();
    const distance = Math.max(rect.height - window.innerHeight, 1);
    const progress = clamp(-rect.top / distance, 0, 1);
    if (storyProgressFill instanceof HTMLElement) {
      storyProgressFill.style.setProperty("--story-progress", progress.toFixed(4));
    }
  }

  if (privacyDeviceWrap instanceof HTMLElement) {
    const rect = privacyDeviceWrap.getBoundingClientRect();
    if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
      const progress = clamp(
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height),
        0,
        1,
      );
      privacyDeviceWrap.style.setProperty(
        "--privacy-scroll-shift",
        `${((progress - 0.5) * -42).toFixed(2)}px`,
      );
    }
  }
};

const requestScrollMotion = () => {
  if (scrollAnimationFrame) return;
  scrollAnimationFrame = window.requestAnimationFrame(updateScrollMotion);
};

window.addEventListener("scroll", requestScrollMotion, { passive: true });
window.addEventListener("resize", requestScrollMotion, { passive: true });
window.addEventListener("load", requestScrollMotion, { once: true });
requestScrollMotion();

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
