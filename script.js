const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
const themeText = document.getElementById("themeText");
const themeIcon = document.getElementById("themeIcon");
const pathGrid = document.getElementById("pathGrid");
const scrollSections = document.getElementById("scrollSections");
const heroIslandNav = document.getElementById("heroIslandNav");
const heroIslandLogo = document.getElementById("heroIslandLogo");

const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
root.setAttribute("data-theme", initialTheme);

function updateThemeToggle() {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  themeText.textContent = next === "dark" ? "Dark mode" : "Light mode";
  themeIcon.textContent = next === "dark" ? "☾" : "☀";
}

updateThemeToggle();

toggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeToggle();
});

document.getElementById("year").textContent = new Date().getFullYear();

function createIslandLink(card) {
  const link = document.createElement("a");
  link.className = "hero-island-link";
  link.href = card.href;
  link.textContent = card.title;
  link.setAttribute("aria-label", card.title);
  return link;
}

function createPathCard(card) {
  const link = document.createElement("a");
  link.className = "path-card";
  link.href = card.href;
  link.setAttribute("aria-label", `${card.title}: ${card.description}`);

  const title = document.createElement("span");
  title.className = "path-card-title";
  title.textContent = card.title;

  const desc = document.createElement("p");
  desc.className = "path-desc";
  desc.textContent = card.description;

  link.append(title, desc);
  return link;
}

function createSection(section) {
  const sectionEl = document.createElement("section");
  sectionEl.className = "reveal-section";

  const container = document.createElement("div");
  container.className = "container";

  const card = document.createElement("div");
  card.className = "section-card";

  const label = document.createElement("p");
  label.className = "section-label";
  label.textContent = section.label;

  const title = document.createElement("h2");
  title.textContent = section.title;

  const body = document.createElement("p");
  body.textContent = section.body;

  card.append(label, title, body);

  if (section.quote) {
    const quote = document.createElement("div");
    quote.className = "quote-block";
    quote.textContent = section.quote;
    card.appendChild(quote);
  }

  if (Array.isArray(section.principles) && section.principles.length) {
    const principles = document.createElement("div");
    principles.className = "principles";

    section.principles.forEach((item) => {
      const principle = document.createElement("div");
      principle.className = "principle";

      const heading = document.createElement("h3");
      heading.textContent = item.title;

      const text = document.createElement("p");
      text.textContent = item.body;

      principle.append(heading, text);
      principles.appendChild(principle);
    });

    card.appendChild(principles);
  }

  container.appendChild(card);
  sectionEl.appendChild(container);
  return sectionEl;
}

function updateSectionVisibility() {
  const sections = document.querySelectorAll(".reveal-section");
  const viewportCenter = window.innerHeight / 2;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(viewportCenter - sectionCenter);
    const maxDistance = window.innerHeight * 0.7;
    const ratio = Math.max(0, 1 - distance / maxDistance);
    const opacity = 0.24 + ratio * 0.76;
    const translate = (1 - ratio) * 18;
    const scale = 0.986 + ratio * 0.014;

    section.style.opacity = opacity.toFixed(3);
    section.style.transform = `translateY(${translate.toFixed(2)}px) scale(${scale.toFixed(3)})`;
  });
}

let scheduled = false;

function requestVisibilityUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    updateSectionVisibility();
    scheduled = false;
  });
}

async function loadContent() {
  const response = await fetch("home.json");
  const content = await response.json();

  document.title = content.meta.title;
  document.querySelector('meta[name="description"]').setAttribute("content", content.meta.description);

  document.getElementById("brandName").textContent = content.site.name;
  document.getElementById("brandRole").textContent = content.site.role;
  document.getElementById("footerName").textContent = content.site.name;
  document.getElementById("footerDomain").textContent = content.site.domain;

  if (heroIslandLogo && content.site.logoText) {
    heroIslandLogo.textContent = content.site.logoText;
  }

  document.getElementById("heroEyebrow").textContent = content.hero.eyebrow;
  document.getElementById("heroTitle").textContent = content.hero.title;
  document.getElementById("heroIntro").textContent = content.hero.intro;

  content.hero.cards.forEach((card) => {
    if (heroIslandNav) {
      heroIslandNav.appendChild(createIslandLink(card));
    }
    pathGrid.appendChild(createPathCard(card));
  });

  content.sections.forEach((section) => {
    scrollSections.appendChild(createSection(section));
  });

  requestVisibilityUpdate();
}

loadContent()
  .then(() => {
    window.addEventListener("scroll", requestVisibilityUpdate, { passive: true });
    window.addEventListener("resize", requestVisibilityUpdate);
  })
  .catch((error) => {
    console.error("Failed to load homepage content:", error);
  });
``
