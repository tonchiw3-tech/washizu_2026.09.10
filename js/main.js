(() => {
  const initScrollAnimations = () => {
    const sections = document.querySelectorAll('main > .fade-in-section:not(.hero)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!sections.length || !('IntersectionObserver' in window) || reducedMotion.matches) return;

    const reveal = (section) => {
      section.classList.add('is-visible');
      observer.unobserve(section);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Intersection also fires on entry: do not require 15% of a tall or
        // horizontally clipped section to fit inside a small viewport.
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { threshold: 0.15 });

    document.documentElement.classList.add('scroll-animations-enabled');

    sections.forEach((section) => {
      observer.observe(section);
      section.addEventListener('focusin', () => reveal(section), { once: true });
    });

    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) sections.forEach(reveal);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations, { once: true });
  } else {
    initScrollAnimations();
  }
})();

// Native scrolling keeps touch swipes available independently of pagination.
(() => {
  const initPlansCarousel = () => {
    const track = document.querySelector('#plans-carousel');
    const pagination = document.querySelector('.plans-pagination');
    if (!track || !pagination) return;
    const cards = [...track.querySelectorAll('.plan-card')];
    if (!cards.length) return;
    const mobile = window.matchMedia('(max-width: 480px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let frame = 0;
    const position = (card) => card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    const setActive = (index) => {
      activeIndex = index;
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    };
    const dots = cards.map((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'plans-dot';
      dot.setAttribute('aria-label', `${index + 1} / ${cards.length}：${card.textContent.trim()}`);
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => {
        if (!mobile.matches) return;
        track.scrollTo({ left: position(card), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      });
      pagination.append(dot);
      return dot;
    });
    const update = () => {
      frame = 0;
      if (!mobile.matches) return;
      let nearest = 0;
      cards.forEach((card, index) => {
        if (Math.abs(position(card) - track.scrollLeft) < Math.abs(position(cards[nearest]) - track.scrollLeft)) nearest = index;
      });
      setActive(nearest);
    };
    track.addEventListener('scroll', () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    }, { passive: true });
    const syncLayout = () => {
      pagination.hidden = !mobile.matches;
      track.tabIndex = mobile.matches ? 0 : -1;
      track.scrollTo({ left: mobile.matches ? position(cards[activeIndex]) : 0, behavior: 'instant' });
      setActive(activeIndex);
    };
    mobile.addEventListener('change', syncLayout);
    window.addEventListener('resize', syncLayout);
    syncLayout();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlansCarousel, { once: true });
  } else {
    initPlansCarousel();
  }
})();

// Native scrolling keeps touch swipes available independently of pagination.
(() => {
  const initExperienceCarousel = () => {
    const track = document.querySelector('#experience-carousel');
    const pagination = document.querySelector('.experience-pagination');
    const previous = document.querySelector('.experience-arrow-prev');
    const next = document.querySelector('.experience-arrow-next');
    if (!track || !pagination) return;
    const cards = [...track.querySelectorAll('.step-card')];
    if (!cards.length) return;
    const mobile = window.matchMedia('(max-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let frame = 0;
    // The last card cannot always reach the start edge: use its reachable
    // scroll offset for both dot navigation and the active-dot calculation.
    const position = (card) => Math.max(0, Math.min(
      card.getBoundingClientRect().left - cards[0].getBoundingClientRect().left,
      track.scrollWidth - track.clientWidth
    ));
    const setActive = (index) => {
      activeIndex = index;
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    };
    const dots = cards.map((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'experience-dot';
      dot.setAttribute('aria-label', `${index + 1} / ${cards.length}：${card.querySelector('h3').textContent.trim()}`);
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => {
        if (!mobile.matches) return;
        track.scrollTo({ left: position(card), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      });
      pagination.append(dot);
      return dot;
    });
    const goTo = (index) => {
      if (!mobile.matches) return;
      const target = Math.max(0, Math.min(index, cards.length - 1));
      track.scrollTo({ left: position(cards[target]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      setActive(target);
    };
    previous?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    const update = () => {
      frame = 0;
      if (!mobile.matches) return;
      let nearest = 0;
      cards.forEach((card, index) => {
        if (Math.abs(position(card) - track.scrollLeft) < Math.abs(position(cards[nearest]) - track.scrollLeft)) nearest = index;
      });
      setActive(nearest);
      if (previous) previous.disabled = !mobile.matches || nearest === 0;
      if (next) next.disabled = !mobile.matches || nearest === cards.length - 1;
    };
    track.addEventListener('scroll', () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    }, { passive: true });
    let layoutWidth;
    let mobileLayout;
    const syncLayout = () => {
      // Mobile browser chrome changes height during gestures; do not interrupt
      // native scrolling unless the track width or breakpoint actually changes.
      if (layoutWidth === track.clientWidth && mobileLayout === mobile.matches) return;
      layoutWidth = track.clientWidth;
      mobileLayout = mobile.matches;
      pagination.hidden = !mobile.matches;
      track.tabIndex = mobile.matches ? 0 : -1;
      track.scrollTo({ left: mobile.matches ? position(cards[activeIndex]) : 0, behavior: 'instant' });
      setActive(activeIndex);
      if (previous) previous.disabled = !mobile.matches || activeIndex === 0;
      if (next) next.disabled = !mobile.matches || activeIndex === cards.length - 1;
    };
    mobile.addEventListener('change', syncLayout);
    window.addEventListener('resize', syncLayout);
    syncLayout();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperienceCarousel, { once: true });
  } else {
    initExperienceCarousel();
  }
})();
