function reveal_init() {
  text_split_nodes_to_delayed_spans();
  reveal(0);
}
function reveal_scroll() {
  reveal(80);
}
function reveal(offset) {
  var windowHeight = window.innerHeight;
  var reveals = document.querySelectorAll("[class*=reveal]");
  reveals.forEach(reveal => {
    var elementTop = reveal.getBoundingClientRect().top;
    if (elementTop < windowHeight - offset) {
      if (![...reveal.classList].includes('hidden')) {
        reveal.classList.add('active');
      }
    }
  });
}

function split_node_to_delayed_spans(n, interval) {
  chars = n.textContent.replace(/ +/g, " ").trim().split("");
  chars_map = { '\n': '<br>',
                ' ' : '&nbsp' }
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

window.addEventListener("scroll", reveal_scroll);
window.onload = reveal_init;
