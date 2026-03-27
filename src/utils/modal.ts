export interface ModalControllerOptions {
  modal: HTMLElement;
  content: HTMLElement;
  closeButton?: HTMLElement | null;
  onOpen?: () => void;
  onClose?: () => void;
  /** Append the modal node to `document.body` when opening so it escapes ancestor stacking contexts. */
  moveToBodyOnOpen?: boolean;
  lockBodyScroll?: boolean;
  trapFocus?: boolean;
}

export interface ModalController {
  open: (trigger?: HTMLElement | null) => void;
  close: () => void;
  isOpen: () => boolean;
}

export const createModalController = ({
  modal,
  content,
  closeButton = null,
  onOpen,
  onClose,
  moveToBodyOnOpen = false,
  lockBodyScroll = true,
  trapFocus = true,
}: ModalControllerOptions): ModalController => {
  const ANIMATION_MS = 220;
  let lastFocusedEl: HTMLElement | null = null;
  let savedBodyOverflow: string | null = null;
  let closeTimer: number | null = null;

  const isOpen = () => modal.classList.contains("flex") && !modal.classList.contains("hidden");

  const getFocusable = (): HTMLElement[] =>
    Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute("disabled"));

  const close = () => {
    if (!isOpen()) return;
    modal.setAttribute("data-modal-state", "closing");

    if (lockBodyScroll) {
      if (savedBodyOverflow !== null) {
        document.body.style.overflow = savedBodyOverflow;
        savedBodyOverflow = null;
      } else {
        document.body.style.overflow = "";
      }
    }

    if (closeTimer !== null) window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      modal.setAttribute("data-modal-state", "closed");
      onClose?.();
      if (lastFocusedEl instanceof HTMLElement) lastFocusedEl.focus();
      closeTimer = null;
    }, ANIMATION_MS);
  };

  const open = (trigger?: HTMLElement | null) => {
    if (closeTimer !== null) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    lastFocusedEl =
      trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("data-modal-state", "opening");

    if (lockBodyScroll) {
      if (savedBodyOverflow === null) savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    if (moveToBodyOnOpen && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    onOpen?.();
    requestAnimationFrame(() => {
      modal.setAttribute("data-modal-state", "open");
    });
    if (closeButton instanceof HTMLElement) closeButton.focus();
  };

  closeButton?.addEventListener("click", close);

  // Close when clicking the overlay: backdrop, root, or any area not inside the main content
  // (PopupModal uses pointer-events on content so transparent regions pass through to backdrop).
  modal.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (!content.contains(target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (!trapFocus || e.key !== "Tab") return;

    const focusables = getFocusable();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  });

  return { open, close, isOpen };
};

/** Wire a [data-gallery-grid] + PopupModal image viewer (shared by About + Speaking galleries). */
export function initImageGalleryModal(
  grid: Element,
  modalId: string,
  options?: { moveToBodyOnOpen?: boolean },
): void {
  const section = grid.closest("section") ?? document;
  const modal = section.querySelector<HTMLElement>(`[data-modal-id="${modalId}"]`);
  if (!modal) return;

  const modalImage = modal.querySelector("[data-gallery-modal-image]");
  const modalCloseBtn = modal.querySelector<HTMLElement>("[data-modal-close]");
  const modalContent = modal.querySelector<HTMLElement>("[data-modal-content]");
  const openButtons = grid.querySelectorAll<HTMLElement>("[data-gallery-open]");

  if (!(modalImage instanceof HTMLImageElement) || !(modalContent instanceof HTMLElement)) return;

  const moveToBodyOnOpen = options?.moveToBodyOnOpen ?? true;

  const modalCtrl = createModalController({
    modal,
    content: modalContent,
    closeButton: modalCloseBtn,
    moveToBodyOnOpen,
    onClose: () => {
      modalImage.src = "";
      modalImage.alt = "";
    },
  });

  const openModal = (src: string, alt: string, trigger: HTMLElement) => {
    modalImage.src = src;
    modalImage.alt = alt || "Expanded gallery image";
    modalCtrl.open(trigger);
  };

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const image = btn.querySelector("img");
      if (!(image instanceof HTMLImageElement)) return;
      openModal(image.currentSrc || image.src, image.alt, btn);
    });
  });
}
