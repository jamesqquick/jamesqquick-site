/**
 * Course lesson progress (localStorage) + sidebar checks.
 * Loaded from BaseLayout so it runs on first paint and survives ClientRouter navigations
 * (inline scripts in swapped page fragments may not re-execute).
 */
const checkSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

function getProgress(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem("progress") || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

function setProgress(p: Record<string, boolean>) {
  localStorage.setItem("progress", JSON.stringify(p));
}

function hydrateChecks() {
  const progress = getProgress();
  document.querySelectorAll(".lesson-check").forEach((checkEl) => {
    const lessonId = checkEl.getAttribute("data-lesson-id");
    if (!lessonId) return;
    if (progress[lessonId]) {
      checkEl.classList.add("bg-green-500", "border-green-500");
      checkEl.classList.remove("border-border");
      checkEl.innerHTML = checkSvg;
    } else {
      checkEl.classList.remove("bg-green-500", "border-green-500");
      checkEl.classList.add("border-border");
      checkEl.innerHTML = "";
    }
  });
}

function syncMarkButton() {
  const btn = document.getElementById("mark-complete-btn");
  if (!btn) return;
  const lessonId = btn.getAttribute("data-lesson-id");
  if (!lessonId) return;
  const progress = getProgress();
  const label = progress[lessonId] ? "Completed" : "Mark as Complete";
  const textSpan = btn.querySelector("span");
  if (textSpan) textSpan.textContent = label;
}

function rehydrateLessonUi() {
  hydrateChecks();
  syncMarkButton();
}

export function initCourseLessonUi() {
  if (typeof window === "undefined" || window.__jqCourseLessonUiInit) return;
  window.__jqCourseLessonUiInit = true;

  document.addEventListener("astro:page-load", rehydrateLessonUi);
  document.addEventListener("astro:after-swap", hydrateChecks);
  rehydrateLessonUi();

  if (!window.__jqCourseLessonEscapeBound) {
    window.__jqCourseLessonEscapeBound = true;
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const drawer = document.getElementById("sidebar-drawer");
      if (drawer && !drawer.classList.contains("hidden")) drawer.classList.add("hidden");
    });
  }

  if (!window.__jqCourseLessonClickBound) {
    window.__jqCourseLessonClickBound = true;
    document.addEventListener("click", (e) => {
      const target = e.target as Element | null;
      if (!target) return;

      if (target.closest("#open-sidebar-btn")) {
        document.getElementById("sidebar-drawer")?.classList.remove("hidden");
        return;
      }
      if (target.closest("#close-sidebar-btn") || target.closest("#sidebar-overlay")) {
        document.getElementById("sidebar-drawer")?.classList.add("hidden");
        return;
      }

      const markBtn = target.closest("#mark-complete-btn");
      if (markBtn) {
        e.preventDefault();
        const lessonId = markBtn.getAttribute("data-lesson-id");
        const courseSlug = markBtn.getAttribute("data-course-slug");
        const courseTitle = markBtn.getAttribute("data-course-title");
        const idsRaw = markBtn.getAttribute("data-course-lesson-ids");
        if (!lessonId) return;
        const progress = getProgress();
        progress[lessonId] = !progress[lessonId];
        setProgress(progress);
        hydrateChecks();
        syncMarkButton();

        if (progress[lessonId] && idsRaw && courseSlug && courseTitle) {
          let courseLessonIds: string[] = [];
          try {
            courseLessonIds = JSON.parse(idsRaw) as string[];
          } catch {
            return;
          }
          const p = getProgress();
          const allComplete =
            courseLessonIds.length > 0 &&
            courseLessonIds.every((id) => Boolean(p[id]));
          if (allComplete) {
            const certificates = JSON.parse(localStorage.getItem("certificates") || "{}") as Record<
              string,
              { id: string; courseName: string; completedAt: string }
            >;
            certificates[courseSlug] = certificates[courseSlug] ?? {
              id: `${courseSlug}-${Date.now().toString(36)}`,
              courseName: courseTitle,
              completedAt: new Date().toISOString(),
            };
            localStorage.setItem("certificates", JSON.stringify(certificates));
            window.location.href = `/course/${courseSlug}/complete`;
          }
        }
        return;
      }

      const nextLink = target.closest("#next-lesson-link");
      if (nextLink) {
        const btn = document.getElementById("mark-complete-btn");
        const lessonId = btn?.getAttribute("data-lesson-id");
        if (!lessonId) return;
        const progress = getProgress();
        if (!progress[lessonId]) {
          progress[lessonId] = true;
          setProgress(progress);
          hydrateChecks();
          syncMarkButton();
        }
      }
    });
  }
}

declare global {
  interface Window {
    __jqCourseLessonUiInit?: boolean;
    __jqCourseLessonEscapeBound?: boolean;
    __jqCourseLessonClickBound?: boolean;
  }
}
