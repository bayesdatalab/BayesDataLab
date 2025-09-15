// ===== Menú móvil =====
const menuBtn = document.getElementById('menuBtn');
const drawer  = document.getElementById('drawer');

function setDrawer(open){
  drawer.classList.toggle('open', open);
  menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('no-scroll', open);
}

menuBtn?.addEventListener('click', () => {
  const willOpen = !drawer.classList.contains('open');
  setDrawer(willOpen);
});

drawer?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => setDrawer(false));
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) setDrawer(false);
});

// ===== Aparición suave =====
const reveal = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); reveal.unobserve(e.target); } });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// ===== Carrusel =====
function setupCarousel(root){
  const viewport = root.querySelector('.car-viewport');
  const track = root.querySelector('.car-track');
  const prev = root.querySelector('.car-btn.prev');
  const next = root.querySelector('.car-btn.next');
  const dots = root.querySelector('.car-dots');
  const gap = parseInt(root.dataset.gap || '16', 10);
  root.style.setProperty('--gap', gap + 'px');

  function cardsPerView(){
    return window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 700 ? 2 : 1);
  }
  let cpv = cardsPerView();
  root.style.setProperty('--cpv', cpv);

  const items = [...track.children];
  let index = 0;

  function itemWidth(){
    const first = items[0];
    if(!first) return viewport.clientWidth;
    const rect = first.getBoundingClientRect();
    return Math.round(rect.width + gap);
  }
  function maxIndex(){ return Math.max(0, items.length - cpv); }
  function clamp(i){ return Math.max(0, Math.min(i, maxIndex())); }

  function goTo(i, smooth=true){
    index = clamp(i);
    viewport.scrollTo({ left: index * itemWidth(), behavior: smooth ? 'smooth' : 'auto' });
    updateDots(); updateArrows();
  }

  function buildDots(){
    dots.innerHTML = '';
    for(let i=0;i<=maxIndex();i++){
      const b = document.createElement('button');
      if(i===index) b.classList.add('is-active');
      b.setAttribute('aria-label', `Ir a página ${i+1}`);
      b.addEventListener('click', ()=>goTo(i));
      dots.appendChild(b);
    }
  }
  function updateDots(){ [...dots.children].forEach((d,i)=>d.classList.toggle('is-active', i===index)); }
  function updateArrows(){
    prev.disabled = index === 0;
    next.disabled = index === maxIndex();
    prev.style.opacity = prev.disabled ? .35 : 1;
    next.style.opacity = next.disabled ? .35 : 1;
    prev.style.pointerEvents = prev.disabled ? 'none' : 'auto';
    next.style.pointerEvents = next.disabled ? 'none' : 'auto';
  }

  function onResize(){
    const newCpv = cardsPerView();
    if(newCpv !== cpv){
      cpv = newCpv; root.style.setProperty('--cpv', cpv);
      goTo(Math.min(index, maxIndex()), false);
      buildDots(); updateDots(); updateArrows();
    }
  }

  let scrollTimeout;
  viewport.addEventListener('scroll', ()=>{
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(()=>{
      const i = Math.round(viewport.scrollLeft / itemWidth());
      index = clamp(i); updateDots(); updateArrows();
    }, 60);
  });

  prev.addEventListener('click', ()=>goTo(index-1));
  next.addEventListener('click', ()=>goTo(index+1));
  viewport.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') goTo(index-1);
    if(e.key === 'ArrowRight') goTo(index+1);
  });

  buildDots(); updateDots(); updateArrows();
  window.addEventListener('resize', onResize);
}
document.querySelectorAll('.carousel').forEach(setupCarousel);

// ===== Formulario (placeholder) =====
const FORMSPREE_ENDPOINT = ''; // añade tu endpoint si luego usas Formspree
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
if (form && FORMSPREE_ENDPOINT) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Enviando…';
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, { method:'POST', headers:{'Accept':'application/json'}, body:new FormData(form) });
      if (res.ok) { statusEl.textContent = '¡Gracias! Te responderé pronto.'; form.reset(); }
      else { statusEl.textContent = 'Error al enviar. Usa el correo directo, por favor.'; }
    } catch { statusEl.textContent = 'No se pudo enviar. Usa el correo directo.'; }
  });
}
