document.addEventListener("DOMContentLoaded", function () {

  function reveal_init() {
    text_split_nodes_to_delayed_spans();
    revealxy(0);
  }
  function reveal_scroll() {
    revealxy(80);
  }
  function revealxy(offset) {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const reveals = document.querySelectorAll("[class*='revealy'], [class*='revealx']");

    reveals.forEach(reveal => {
      const rect = reveal.getBoundingClientRect();

      // Check for vertical reveal classes (e.g., "revealy_*")
      if (Array.from(reveal.classList).some(cls => cls.startsWith("revealy")) && rect.top < windowHeight - offset) {
        reveal.classList.add("active");
      }

      // Check for horizontal reveal classes (e.g., "revealx_*")
      if (Array.from(reveal.classList).some(cls => cls.startsWith("revealx")) && rect.left < windowWidth - offset) {
        reveal.classList.add("active");
      }
    });
  }

  function split_node_to_delayed_spans(n, interval) {
    chars = n.textContent.replace(/ +/g, " ").trim().split("");
    chars_map = {
      '\n': '<br>',
      ' ': '&nbsp'
    }
    spans = chars.map(s => `<span>${chars_map[s] ?? s}</span>`);
    spans = spans.map((s, i) => add_delay_style(s, i, interval));
    return spans;
  }
  function add_delay_style(span, sequence, interval) {
    if (span.match(/<span>/g)) {
      var ds = sequence * interval;
      o = 0 === ds ? "" : ` style="transition-delay: ${ds}ms;"`;
      span = span.replace(/<span>/, `<span${o}>`);
    }
    return span;
  }
  function text_split_nodes_to_delayed_spans() {
    let to_be_split = document.querySelectorAll('.reveal_fadein_letter');
    [...to_be_split].forEach(ts_node => {
      interval = 'delay_interval_ms' in ts_node.attributes ? parseFloat(ts_node.attributes.delay_interval_ms.value) : 30;
      spanned = split_node_to_delayed_spans(ts_node, interval);
      ts_node.innerHTML = "".concat(...spanned);
    });
  }

  const scrollElement = document.querySelector(".horizontal-scroll-area");

  let isTouching = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastScrollLeft = 0;
  let isVerticalSwipe = false;

  let velocity = 0;
  let isAnimating = false;

  const deceleration = 0.97;   // Deceleration factor
  const minVelocity = 0.1;    // Minimum velocity to stop animation

  function isElementFullyInView(element) {
    const rect = element.getBoundingClientRect();
    var in_view = (
      rect.top >= 0
       &&
      rect.bottom <= window.innerHeight
    );
    return in_view;
  }

  function handleSwipe(e) {
    if (!('ontouchstart' in window)) return;
    if (!isElementFullyInView(scrollElement)) return; // Wait until fully in view

    switch (e.type) {
      case "touchstart":
        isTouching = true;
        isVerticalSwipe = false; // Reset direction detection
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        lastScrollLeft = scrollElement.scrollLeft;
        velocity = 0; // Reset velocity
        isAnimating = false; // Stop any ongoing momentum
        break;

      case "touchmove":
        if (!isTouching) return;

        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;

        const deltaX = touchStartX - touchCurrentX;
        const deltaY = touchStartY - touchCurrentY;

        // Detect the dominant swipe direction on the first move
        if (!isVerticalSwipe && Math.abs(deltaY) > Math.abs(deltaX)) {
          isVerticalSwipe = true;
        }

        if (isVerticalSwipe) {
          const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;
          // Vertical scroll converted to horizontal scroll
          if (
            (scrollElement.scrollLeft <= 0 && deltaY < 0) ||
            (scrollElement.scrollLeft >= maxScrollLeft && deltaY > 0)
          ) {
            // Allow vertical scrolling beyond the horizontal-scroll-area boundaries
            isTouching = false; // Reset touch handling
            return; // Stop preventing default to allow the page to scroll vertically
          }
          e.preventDefault(); // Prevent vertical scrolling within the area
          scrollElement.scrollLeft = lastScrollLeft + deltaY;
          velocity = deltaY * 0.1; // Track velocity for momentum
        }
        break;

      case "touchend":
        if (isVerticalSwipe) {
          applyMomentum();
        }
        isTouching = false;
        break;
    }
  }

  // Apply momentum after touchend
  function applyMomentum() {
    if (isAnimating) return; // Prevent multiple momentum animations
    isAnimating = true;

    function momentumStep() {
      velocity *= deceleration; // Reduce velocity
      scrollElement.scrollLeft += velocity; // Apply velocity

      // Stop if velocity is minimal
      if (Math.abs(velocity) > minVelocity) {
        requestAnimationFrame(momentumStep);
      } else {
        isAnimating = false; // Stop animation
      }
    }
    requestAnimationFrame(momentumStep);
  }

  function handleScroll(e) {
    if (!isElementFullyInView(scrollElement)) return; // Wait until fully in view
    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;
    if (e.type === "wheel") {
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if ((scrollElement.scrollLeft <= 0 && deltaX < 0) || (scrollElement.scrollLeft >= maxScrollLeft && deltaX > 0)) {
          return;
        }
        e.preventDefault();
        scrollElement.scrollLeft += deltaX;
      } else {
        if ((scrollElement.scrollLeft <= 0 && deltaY < 0) || (scrollElement.scrollLeft >= maxScrollLeft && deltaY > 0)) {
          return;
        }
        e.preventDefault();
        scrollElement.scrollLeft += deltaY;
      }
    }
  }

  // Register touch events to the unified handler
  scrollElement.addEventListener("touchstart", handleSwipe);
  scrollElement.addEventListener("touchmove", handleSwipe);
  scrollElement.addEventListener("touchend", handleSwipe);

  // Scroll event listener
  scrollElement.addEventListener("wheel", handleScroll);
  scrollElement.addEventListener("scroll", handleScroll);
  scrollElement.addEventListener("scroll", reveal_scroll);

  window.addEventListener("scroll", reveal_scroll);
  reveal_init();
});