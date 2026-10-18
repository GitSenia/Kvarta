export function initCustomSelects(root = document) {
  root.querySelectorAll("[data-select]").forEach((wrap) => setupSelect(wrap));
}

function setupSelect(wrap) {
  const native = wrap.querySelector(".select__native");
  const trigger = wrap.querySelector(".select__trigger");
  const valueEl = wrap.querySelector(".select__value");
  const menu = wrap.querySelector(".select__menu");
  const options = [...wrap.querySelectorAll(".select__option")];

  if (!(native instanceof HTMLSelectElement) || !trigger || !valueEl || !menu) {
    return;
  }

  const syncFromNative = () => {
    const current = native.value;
    const match = options.find((opt) => opt.dataset.value === current);
    valueEl.textContent = match?.textContent?.trim() || current;
    options.forEach((opt) => {
      const selected = opt.dataset.value === current;
      opt.classList.toggle("is-selected", selected);
      opt.setAttribute("aria-selected", selected ? "true" : "false");
    });
  };

  const close = () => {
    wrap.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const open = () => {
    wrap.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  };

  const choose = (value) => {
    native.value = value;
    native.dispatchEvent(new Event("change", { bubbles: true }));
    syncFromNative();
    close();
    trigger.focus();
  };

  trigger.addEventListener("click", () => {
    if (wrap.classList.contains("is-open")) {
      close();
    } else {
      open();
    }
  });

  options.forEach((opt) => {
    opt.addEventListener("click", () => choose(opt.dataset.value));
  });

  document.addEventListener("click", (event) => {
    if (!wrap.contains(event.target)) {
      close();
    }
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (wrap.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open();
      options[0]?.focus();
    }
  });

  // API для внешних CTA (подписка)
  wrap.setValue = (value) => {
    if (![...native.options].some((opt) => opt.value === value)) return;
    choose(value);
  };

  syncFromNative();
}

export function setSelectValue(form, name, value) {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLSelectElement)) return;
  const wrap = field.closest("[data-select]");
  if (wrap && typeof wrap.setValue === "function") {
    wrap.setValue(value);
  } else {
    field.value = value;
  }
}
