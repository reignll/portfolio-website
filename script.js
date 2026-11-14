"use strict";

// Keep the footer year current.
document.getElementById("current-year").textContent = new Date().getFullYear();

// 1) Mobile navigation with accessible expanded/collapsed state.
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.getElementById("primary-navigation");

function setMenuOpen(isOpen) {
  navigation.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1050) setMenuOpen(false);
});

// 2) Project category filters, including announcements for screen readers.
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");
const filterAnnouncement = document.getElementById("filter-announcement");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    projectCards.forEach((card) => {
      const visible = category === "all" || card.dataset.category.split(/\s+/).includes(category);
      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    filterAnnouncement.textContent = `${visibleCount} ${visibleCount === 1 ? "project" : "projects"} shown.`;
  });
});

// 3) Accessible image previews using the native <dialog> element.
const dialog = document.getElementById("preview-dialog");
const previewImage = document.getElementById("preview-image");
const previewTitle = document.getElementById("preview-title");
const previewDescription = document.getElementById("preview-description");

Array.from(document.querySelectorAll("[data-preview]")).forEach((button) => {
  button.addEventListener("click", () => {
    previewImage.src = button.dataset.preview;
    previewImage.alt = button.querySelector("img").alt;
    previewTitle.textContent = button.dataset.title;
    previewDescription.textContent = button.dataset.description;
    dialog.showModal();
  });
});

document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

// 4) Contact form: real-time validation and a local, copyable message preview.
// There is no backend; submitting this demo does NOT send or store any information.
const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");
const messagePreview = document.getElementById("message-preview");
const messageOutput = document.getElementById("message-output");
const copyButton = document.getElementById("copy-message");
const fields = [
  { element: document.getElementById("contact-name"), error: document.getElementById("name-error") },
  { element: document.getElementById("contact-email"), error: document.getElementById("email-error") },
  { element: document.getElementById("contact-message"), error: document.getElementById("message-error") }
];

function validateField(field) {
  const input = field.element;
  const value = input.value.trim();
  let message = "";

  if (!value) {
    message = "This field is required.";
  } else if (input.type === "email" && !input.validity.valid) {
    message = "Enter a valid email address.";
  } else if (value.length < input.minLength) {
    message = `Enter at least ${input.minLength} characters.`;
  }

  field.error.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  return message === "";
}

fields.forEach((field) => {
  field.element.addEventListener("blur", () => validateField(field));
  field.element.addEventListener("input", () => {
    if (field.element.getAttribute("aria-invalid") === "true") validateField(field);
    formFeedback.textContent = "";
    messagePreview.hidden = true;
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const isValid = fields.map(validateField).every(Boolean);

  if (!isValid) {
    formFeedback.textContent = "Please correct the highlighted fields.";
    fields.find((field) => field.element.getAttribute("aria-invalid") === "true").element.focus();
    messagePreview.hidden = true;
    return;
  }

  const name = fields[0].element.value.trim();
  const email = fields[1].element.value.trim();
  const message = fields[2].element.value.trim();
  messageOutput.textContent = `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  messagePreview.hidden = false;
  formFeedback.textContent = "Your message is ready. Copy it below and send it using your preferred email app.";
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messageOutput.textContent);
    formFeedback.textContent = "Message copied to clipboard.";
  } catch (error) {
    formFeedback.textContent = "Copy is unavailable here. You can select and copy the preview text manually.";
  }
});
