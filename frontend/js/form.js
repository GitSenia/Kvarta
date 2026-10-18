import { captureAttribution } from "./utm.js";
import { normalizeByPhone, PHONE_HINT } from "./phone.js";
import { initCustomSelects, setSelectValue } from "./select.js";

const API_URL = (window.KVARTA_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`) + "/api/lead";

function shake(el) {
  if (!(el instanceof HTMLElement)) return;
  el.classList.remove("is-invalid");
  // перезапуск анимации дрожания при повторной ошибке
  void el.offsetWidth;
  el.classList.add("is-invalid");
}

function setFieldError(form, name, message) {
  const input = form.elements.namedItem(name);
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);
  if (input instanceof HTMLElement) {
    if (message) {
      shake(input);
    } else {
      input.classList.remove("is-invalid");
    }
  }
  if (errorEl) {
    errorEl.hidden = !message;
    errorEl.textContent = message || "";
  }
}

function clearErrors(form) {
  setFieldError(form, "name", "");
  setFieldError(form, "phone", "");
}

function showStatus(el, type, message) {
  el.hidden = !message;
  el.className = `form-status${type ? ` is-${type}` : ""}`;
  el.textContent = message || "";
}

function validate(form) {
  clearErrors(form);
  let ok = true;

  const name = String(form.name.value || "").trim();
  if (!name) {
    setFieldError(form, "name", "Укажите имя");
    ok = false;
  }

  const phone = normalizeByPhone(form.phone.value);
  if (!phone) {
    setFieldError(form, "phone", PHONE_HINT);
    ok = false;
  }

  return ok
    ? {
        name,
        phone,
        interest: form.interest.value,
        comment: String(form.comment.value || "").trim() || null,
      }
    : null;
}

async function parseError(response) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      return data.detail.map((item) => item.msg).join(". ");
    }
    if (data.message) return data.message;
  } catch {
    /* ignore */
  }
  return null;
}

export function initLeadForm() {
  const form = document.getElementById("lead-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  if (!form || !statusEl || !submitBtn) return;

  initCustomSelects(form);

  // CTA «Оформить подписку» заранее выбирает interest
  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.getAttribute("data-interest");
      if (value) {
        setSelectValue(form, "interest", value);
      }
    });
  });

  form.phone.addEventListener("blur", () => {
    const normalized = normalizeByPhone(form.phone.value);
    if (normalized) {
      form.phone.value = normalized;
      setFieldError(form, "phone", "");
    }
  });

  let submitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;

    const payloadBase = validate(form);
    if (!payloadBase) {
      showStatus(statusEl, "error", "Проверьте поля формы");
      shake(statusEl);
      return;
    }

    const body = {
      ...payloadBase,
      ...captureAttribution(),
    };

    submitting = true;
    submitBtn.disabled = true;
    showStatus(statusEl, "info", "Отправляем заявку…");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 201) {
        showStatus(
          statusEl,
          "success",
          "Заявка принята. В течение 10 минут менеджер перезвонит, чтобы подтвердить заказ."
        );
        form.reset();
        setSelectValue(form, "interest", "one_time");
        clearErrors(form);
        return;
      }

      if (response.status === 409) {
        const detail =
          (await parseError(response)) ||
          "Заявка с этим номером уже принята. Подождите 10 минут или дождитесь звонка.";
        showStatus(statusEl, "info", detail);
        return;
      }

      if (response.status === 422) {
        const detail = (await parseError(response)) || PHONE_HINT;
        if (/телефон|phone|375/i.test(detail)) {
          setFieldError(form, "phone", detail);
        }
        showStatus(statusEl, "error", detail);
        return;
      }

      const detail = await parseError(response);
      showStatus(
        statusEl,
        "error",
        detail ||
          "Не удалось отправить заявку. Попробуйте ещё раз чуть позже или напишите нам через соцсети мастерской."
      );
    } catch {
      showStatus(
        statusEl,
        "error",
        "Нет связи с сервером. Проверьте интернет и попробуйте снова — или зайдите позже."
      );
    } finally {
      submitting = false;
      submitBtn.disabled = false;
    }
  });
}
