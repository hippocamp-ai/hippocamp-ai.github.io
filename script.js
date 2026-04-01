const atlasData = {
  preferences: {
    title: "Preferences",
    image: "./assets/figures/10_preferences.png",
    pdf: "../figs/10_Preferences.pdf",
    caption:
      "Inferring stable photo-editing preferences from an email thread with annotated visual feedback and user confirmation.",
    copy:
      "Preferences profiling captures stable, trait-like choices that generalize across situations. This case evaluates whether an agent can aggregate multimodal conversational evidence and distill a stable preference model while keeping each inferred trait traceable to concrete file-grounded cues."
  },
  behavioral: {
    title: "Behavioral Patterns",
    image: "./assets/figures/11_behaviour_patterns.png",
    pdf: "../figs/11_behaviour_patterns.pdf",
    caption:
      "Inferring a stable stress-regulation routine by aligning a training plan, logs, messages, diary notes, and multimodal evidence over time.",
    copy:
      "Behavioral patterns profiling targets persistent, temporally structured habits rather than isolated events. This case evaluates whether an agent can integrate cross-file temporal cues, identify periodicity with exceptions, and derive a stable behavioral pattern that remains traceable to verifiable evidence."
  },
  scheduling: {
    title: "Scheduling",
    image: "./assets/figures/12_scheduling.png",
    pdf: "../figs/12_Scheduling.pdf",
    caption:
      "Conditional planning under conflicting commitments, grounded in calendars/emails and historical conflict-resolution evidence.",
    copy:
      "Scheduling information profiling targets forward-looking, constraint-aware planning under a user's established decision policy. This case evaluates whether an agent can recover a user-specific decision model from longitudinal evidence and generate an executable plan that is both constraint-consistent and evidence-traceable."
  },
  retrospection: {
    title: "Retrospection",
    image: "./assets/figures/13_retrospections.png",
    pdf: "../figs/13_Retrospections.pdf",
    caption:
      "The agent reconstructs a graduation-day itinerary by aligning calendar events, photo metadata, and personal notes into a coherent timeline.",
    copy:
      "Retrospective reflections profile event-bounded user history. This case evaluates whether an agent can align timestamps, locations, and participants across modalities to produce a logically consistent itinerary while keeping each inferred step traceable to concrete file-grounded evidence."
  },
  workflow: {
    title: "Workflows",
    image: "./assets/figures/14_workflows.png",
    pdf: "../figs/14_Workflows.pdf",
    caption:
      "Reconstructing a recurring collaborative-learning loop by aligning calendar events, logs, consultation audio, messages, and document updates.",
    copy:
      "Workflows profiling targets procedure-level user modeling across repeated task executions. This case evaluates whether an agent can integrate multimodal procedural traces into a coherent, reusable workflow representation while keeping each step traceable to concrete file-grounded evidence."
  }
};

const atlasTabs = document.querySelectorAll(".atlas-tab");
const atlasTitle = document.getElementById("atlas-title");
const atlasImage = document.getElementById("atlas-image");
const atlasCaption = document.getElementById("atlas-caption");
const atlasCopy = document.getElementById("atlas-copy");
const atlasPdf = document.getElementById("atlas-pdf");
const atlasOpen = document.getElementById("atlas-open");
const atlasOpenButton = document.getElementById("atlas-open-button");

function setAtlasFigure(key) {
  const next = atlasData[key];
  if (!next) return;

  atlasTitle.textContent = next.title;
  atlasImage.src = next.image;
  atlasImage.alt = `${next.title} case study figure.`;
  atlasCaption.textContent = next.caption;
  atlasCopy.textContent = next.copy;
  atlasPdf.href = next.image;
  atlasPdf.textContent = "Open Figure";

  [atlasOpen, atlasOpenButton].forEach((node) => {
    node.dataset.image = next.image;
    node.dataset.title = next.title;
    node.dataset.caption = next.caption;
    node.dataset.pdf = next.image;
  });
}

atlasTabs.forEach((button) => {
  button.addEventListener("click", () => {
    atlasTabs.forEach((tab) => tab.classList.remove("is-active"));
    button.classList.add("is-active");
    setAtlasFigure(button.dataset.atlasKey);
  });
});

setAtlasFigure("preferences");

/* Example category tabs (Profiling / Factual Retention) */
document.querySelectorAll(".example-tab").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var key = btn.dataset.exampleKey;
    document.querySelectorAll(".example-tab").forEach(function (t) { t.classList.remove("is-active"); });
    document.querySelectorAll(".example-panel").forEach(function (p) {
      if (p.dataset.examplePanel === key) { p.classList.add("is-active"); } else { p.classList.remove("is-active"); }
    });
    btn.classList.add("is-active");
  });
});

const leaderboardTabs = document.querySelectorAll(".leaderboard-tab");
const leaderboardPanels = document.querySelectorAll(".leaderboard-panel");
const leaderboardTables = document.querySelectorAll(".leaderboard-table");

leaderboardTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const { leaderboardKey } = button.dataset;
    leaderboardTabs.forEach((tab) => tab.classList.remove("is-active"));
    leaderboardPanels.forEach((panel) => {
      panel.classList.toggle(
        "is-active",
        panel.dataset.leaderboardPanel === leaderboardKey
      );
    });
    button.classList.add("is-active");
  });
});

const leaderboardCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});

function getSortPayload(cell) {
  const text = (cell?.textContent || "").trim().replace(/\s+/g, " ");
  const numbers = [...text.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) =>
    Number.parseFloat(match[0])
  );

  return {
    text,
    textKey: text.toLowerCase(),
    numbers
  };
}

function isNumericLeaderboardColumn(rows, columnIndex) {
  return rows.some((row) => {
    const payload = getSortPayload(row.children[columnIndex]);
    return payload.numbers.length > 0;
  });
}

function getInitialSortDirection(header, rows, columnIndex) {
  const label = header.textContent.trim().toLowerCase();
  if (label === "rank") return "asc";
  return isNumericLeaderboardColumn(rows, columnIndex) ? "desc" : "asc";
}

function compareLeaderboardRows(aRow, bRow, columnIndex, direction) {
  const multiplier = direction === "asc" ? 1 : -1;
  const aPayload = getSortPayload(aRow.children[columnIndex]);
  const bPayload = getSortPayload(bRow.children[columnIndex]);

  if (aPayload.numbers.length && bPayload.numbers.length) {
    const length = Math.max(aPayload.numbers.length, bPayload.numbers.length);
    for (let index = 0; index < length; index += 1) {
      const aValue = aPayload.numbers[index] ?? Number.NEGATIVE_INFINITY;
      const bValue = bPayload.numbers[index] ?? Number.NEGATIVE_INFINITY;
      if (aValue !== bValue) {
        return (aValue - bValue) * multiplier;
      }
    }
  }

  return leaderboardCollator.compare(aPayload.textKey, bPayload.textKey) * multiplier;
}

function setLeaderboardHeaderState(headers, activeHeader, direction) {
  headers.forEach((header) => {
    const isActive = header === activeHeader;
    header.classList.toggle("is-sorted", isActive);
    header.classList.toggle("is-sorted-asc", isActive && direction === "asc");
    header.classList.toggle("is-sorted-desc", isActive && direction === "desc");
    header.setAttribute(
      "aria-sort",
      isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
    );
  });
}

leaderboardTables.forEach((table) => {
  const headers = [...table.querySelectorAll("thead th")];
  const tbody = table.querySelector("tbody");
  if (!headers.length || !tbody) return;

  headers.forEach((header, columnIndex) => {
    header.classList.add("is-sortable");
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-sort", "none");

    const handleSort = () => {
      const rows = [...tbody.querySelectorAll("tr")];
      const nextDirection = header.dataset.sortDirection
        ? header.dataset.sortDirection === "asc"
          ? "desc"
          : "asc"
        : getInitialSortDirection(header, rows, columnIndex);

      rows
        .sort((aRow, bRow) =>
          compareLeaderboardRows(aRow, bRow, columnIndex, nextDirection)
        )
        .forEach((row) => tbody.appendChild(row));

      headers.forEach((item) => {
        if (item !== header) {
          delete item.dataset.sortDirection;
        }
      });
      header.dataset.sortDirection = nextDirection;
      setLeaderboardHeaderState(headers, header, nextDirection);
    };

    header.addEventListener("click", handleSort);
    header.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      handleSort();
    });
  });
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxPdf = document.getElementById("lightbox-pdf");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox({ image, title, caption, pdf }) {
  if (!lightbox) return;
  lightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
  lightboxImage.src = image;
  lightboxImage.alt = title || "Expanded figure";
  lightboxTitle.textContent = title || "Figure";
  lightboxCaption.textContent = caption || "";
  lightboxPdf.href = image;
  lightboxPdf.textContent = "Open Figure";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove("is-lightbox-open");
  lightboxImage.src = "";
}

document.querySelectorAll(".js-open-figure").forEach((node) => {
  node.dataset.pdf = node.dataset.image;
  node.addEventListener("click", () => {
    openLightbox({
      image: node.dataset.image,
      title: node.dataset.title,
      caption: node.dataset.caption,
      pdf: node.dataset.pdf
    });
  });
});

document.querySelectorAll(".figure-actions").forEach((container) => {
  const trigger = container.querySelector(".js-open-figure");
  const link = container.querySelector("a.button--ghost");
  if (!trigger || !link) return;

  link.href = trigger.dataset.image;
  link.textContent = "Open Figure";
});

lightboxClose?.addEventListener("click", closeLightbox);
document.querySelectorAll("[data-close-lightbox]").forEach((node) => {
  node.addEventListener("click", closeLightbox);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) {
    closeLightbox();
  }
});

const navLinks = [...document.querySelectorAll(".top-nav a")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const siteHeader = document.querySelector(".site-header");

function setActiveNavByHash(hash) {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === hash);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNavByHash(link.getAttribute("href"));
  });
});

function updateActiveNavOnScroll() {
  if (!observedSections.length) return;

  const headerHeight = siteHeader?.offsetHeight || 0;
  const probeY = headerHeight + 24;
  let activeSection = observedSections[0];

  observedSections.forEach((section) => {
    const { top } = section.getBoundingClientRect();
    if (top <= probeY) {
      activeSection = section;
    }
  });

  const nearBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

  if (nearBottom) {
    activeSection = observedSections[observedSections.length - 1];
  }

  setActiveNavByHash(`#${activeSection.id}`);
}

let navTicking = false;

function requestNavUpdate() {
  if (navTicking) return;
  navTicking = true;
  window.requestAnimationFrame(() => {
    updateActiveNavOnScroll();
    navTicking = false;
  });
}

window.addEventListener("scroll", requestNavUpdate, { passive: true });
window.addEventListener("resize", requestNavUpdate);

updateActiveNavOnScroll();

document.querySelectorAll(".full-table").forEach((table) => {
  const rows = [...table.querySelectorAll("tbody tr")];
  if (!rows.length) return;

  const dataCells = rows.map((row) => [...row.querySelectorAll("td")]);
  const columnCount = dataCells[0].length;

  for (let col = 1; col < columnCount; col += 1) {
    const numericCells = dataCells
      .map((cells) => cells[col])
      .filter(Boolean)
      .map((cell) => ({ cell, value: Number.parseFloat(cell.textContent.trim()) }))
      .filter((item) => Number.isFinite(item.value));

    if (!numericCells.length) continue;

    const maxValue = Math.max(...numericCells.map((item) => item.value));
    numericCells.forEach((item) => {
      if (item.value === maxValue) {
        item.cell.classList.add("cell--best");
      }
    });
  }
});
