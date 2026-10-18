import { captureAttribution } from "./utm.js";
import { initLeadForm } from "./form.js";

function initSectionStages() {
  const stages = [...document.querySelectorAll("main > section")];
  if (!stages.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stages.forEach((stage) => {
      stage.classList.add("is-on");
      stage.style.transform = "none";
    });
    return;
  }

  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const focusY = scrollY + vh * 0.42;
    const docBottom = document.documentElement.scrollHeight;
    const nearBottom = scrollY + vh >= docBottom - 24;

    let best = null;
    let bestScore = -1;

    stages.forEach((stage) => {
      const rect = stage.getBoundingClientRect();
      const top = scrollY + rect.top;
      const height = Math.max(rect.height, 1);
      const center = top + height * 0.45;
      const distance = Math.abs(focusY - center);
      const t = Math.min(1, distance / (vh * 0.85));
      const score = 1 - t;

      if (score > bestScore) {
        bestScore = score;
        best = stage;
      }
    });

    // Внизу страницы «Как получить» всегда в фокусе
    if (nearBottom) {
      best = stages[stages.length - 1];
    }

    stages.forEach((stage) => {
      const isActive = stage === best;
      stage.classList.toggle("is-on", isActive);

      // Активный блок — без transform, чёткий текст
      if (isActive) {
        stage.style.removeProperty("filter");
        stage.style.opacity = "1";
        stage.style.removeProperty("transform");
        return;
      }

      const rect = stage.getBoundingClientRect();
      const top = scrollY + rect.top;
      const height = Math.max(rect.height, 1);
      const center = top + height * 0.45;
      const distance = Math.abs(focusY - center);
      const t = Math.min(1, distance / (vh * 0.85));
      const shift = t * 22;
      const scale = 1 - t * 0.014;

      stage.style.filter = "none";
      stage.style.opacity = "1";
      stage.style.transform = `translateY(${shift.toFixed(1)}px) scale(${scale.toFixed(4)})`;
    });
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

captureAttribution();
initSectionStages();
initLeadForm();
