(() => {
  const sections = document.querySelectorAll('.fade-in-section');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!('IntersectionObserver' in window) || reducedMotion.matches) return;

  const reveal = (section) => {
    section.classList.add('is-visible');
    observer.unobserve(section);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.15) reveal(entry.target);
    });
  }, { threshold: 0.15 });

  document.documentElement.classList.add('scroll-animations-enabled');

  sections.forEach((section) => {
    observer.observe(section);
    // Keyboard navigation must also reveal a section permanently.
    section.addEventListener('focusin', () => reveal(section), { once: true });
  });

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) sections.forEach(reveal);
  });
})();
