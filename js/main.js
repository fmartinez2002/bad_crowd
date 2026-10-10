/* Bad Crowd — interacción de la página: colección, bolsa, generadores y juegos. */
(function () {
  'use strict';

  const CFG = window.BC_CONFIG;
  const PRODUCTS = window.BC_PRODUCTS;
  const ROLES = window.BC_ROLES;
  const QUIZ = window.BC_QUIZ;
  const M = window.BCMock;
  const esc = M.esc;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = (v) => '$' + Math.round(v).toLocaleString('es-CL');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const CAT = { polera: 'Polera', poleron: 'Polerón', pack: 'Pack', sticker: 'Stickers' };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento disponible */ } },
  };

  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ---------- Productos personalizados ---------- */
  function resolve(id, custom) {
    const base = byId[id];
    if (!base || !custom) return base;
    const p = Object.assign({}, base);
    if (id === 'tu-frase') {
      const tee = custom.garment !== 'hoodie';
      p.type = tee ? 'tee' : 'hoodie';
      p.cat = tee ? 'polera' : 'poleron';
      p.color = custom.color;
      p.price = tee ? CFG.prices.polera : CFG.prices.poleron;
      p.name = (tee ? 'Polera' : 'Polerón') + ' «' + custom.phrase + '»';
      p.front = [['line', custom.phrase]];
      p.back = tee ? [['mono', 'nape']] : [['hood']];
    } else if (id === 'polera-credencial') {
      p.back = [['credential', custom.name || '', custom.num, custom.head]];
      p.name = base.name + ' N° ' + custom.num;
    } else if (id === 'polera-pendientes') {
      p.back = [['checklist', custom.items]];
    }
    return p;
  }

  function customNote(id, custom) {
    if (!custom) return '';
    if (id === 'polera-credencial') return 'Nombre: ' + (custom.name || 'sin nombre') + ' · encabezado ' + (custom.head === 'negro' ? 'negro' : 'rosa');
    if (id === 'polera-pendientes') return 'Pendientes: ' + (custom.items.length ? custom.items.join(', ') : 'ninguno');
    return '';
  }

  /* ---------- Toast y copiar ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  function copy(text, ok, fail) {
    try {
      navigator.clipboard.writeText(text).then(ok, fail);
    } catch (e) {
      fail();
    }
  }

  /* ---------- Hero ---------- */
  const HERO_PHRASES = ['buena junta', 'me porto bien', 'buena influencia', 'llego temprano', 'vuelvo antes de las 12', 'hijo modelo', 'tranqui', 'me quedo en la casa'];
  function renderHero() {
    $('#hero-stage').innerHTML = M.garmentSVG(byId['polera-buena-junta-negra'], 'front');
    $('#fact-designs').textContent = PRODUCTS.filter((p) => !p.hidden && (p.type === 'tee' || p.type === 'hoodie')).length;
  }
  function startHeroCycle() {
    if (reduceMotion) return;
    const el = $('#hero-phrase');
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      el.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % HERO_PHRASES.length;
        el.textContent = HERO_PHRASES[i];
        el.classList.remove('is-out');
      }, 320);
    }, 2800);
  }

  function renderSeals() {
    $$('[data-seal]').forEach((el) => { el.innerHTML = M.sealSVG('#F4F2EE', '#111111'); });
  }

  /* ---------- Colección ---------- */
  const filt = { cat: 'all', color: 'all' };

  function cardHTML(p) {
    const two = p.type === 'tee' || p.type === 'hoodie';
    const c = p.color ? M.COLORS[p.color] : null;
    return `<article class="pcard" data-id="${p.id}">
      <div class="pcard-media">
        <button class="pcard-open" type="button" data-act="open" aria-label="Ver ${esc(p.name)}">
          ${two ? M.garmentSVG(p, 'front', 'mock mock--front') + M.garmentSVG(p, 'back', 'mock mock--back') : M.garmentSVG(p, 'front', 'mock')}
        </button>
        <span class="tag">${esc(p.line)}</span>
        ${two ? `<button class="flip" type="button" data-act="flip" aria-pressed="false" aria-label="Ver espalda de ${esc(p.name)}"><svg aria-hidden="true"><use href="#i-flip"/></svg></button><span class="view-label" aria-hidden="true"><span>Frente</span></span>` : ''}
      </div>
      <div class="pcard-body">
        <div class="pcard-top"><h3 class="pcard-name">${esc(p.name)}</h3><span class="pcard-price">${money(p.price)}</span></div>
        <p class="pcard-meta">${c ? `<span class="sw" style="--sw:${c.swatch}"></span>${c.name} · ` : ''}${CAT[p.cat]}</p>
        <button class="btn btn--line btn--block" type="button" data-act="open">${p.sizes === false ? 'Ver detalle' : 'Elegir talla'}</button>
      </div>
    </article>`;
  }

  function renderCatalog() {
    const items = PRODUCTS.filter((p) => !p.hidden &&
      (filt.cat === 'all' || p.cat === filt.cat) &&
      (filt.color === 'all' || p.color === filt.color));
    $('#catalog-count').textContent = items.length + (items.length === 1 ? ' producto' : ' productos');
    $('#catalog').innerHTML = items.length
      ? items.map(cardHTML).join('')
      : '<p class="empty">No hay nada de eso en ese color. Todavía.</p>';
  }

  function bindFilter(rowSel, key) {
    $(rowSel).addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      filt[key] = b.dataset[key];
      $$('.chip', $(rowSel)).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      renderCatalog();
    });
  }

  function bindCatalog() {
    bindFilter('#filter-cat', 'cat');
    bindFilter('#filter-color', 'color');
    $('#catalog').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const card = btn.closest('.pcard');
      if (btn.dataset.act === 'flip') {
        const back = card.classList.toggle('is-back');
        const name = byId[card.dataset.id].name;
        btn.setAttribute('aria-pressed', String(back));
        btn.setAttribute('aria-label', (back ? 'Ver frente de ' : 'Ver espalda de ') + name);
        const lbl = $('.view-label span', card);
        if (lbl) lbl.textContent = back ? 'Espalda' : 'Frente';
        return;
      }
      openQV(card.dataset.id, null, card.classList.contains('is-back') ? 'back' : null);
    });
  }

  /* ---------- Vista rápida ---------- */
  const qv = { id: null, custom: null, view: 'front', qty: 1 };
  const dlg = $('#qv');

  function openQV(id, custom, view) {
    const p = resolve(id, custom);
    if (!p) return;
    qv.id = id;
    qv.custom = custom || null;
    qv.qty = 1;
    qv.view = view || p.thumb || 'front';
    const two = p.type === 'tee' || p.type === 'hoodie';
    $('#qv-views').hidden = !two;
    if (!two) qv.view = 'front';
    $('#qv-line').textContent = [p.line, CAT[p.cat]].join(' · ');
    $('#qv-title').textContent = p.name;
    $('#qv-price').textContent = money(p.price);
    $('#qv-desc').textContent = p.desc;
    const note = customNote(id, custom);
    $('#qv-custom').hidden = !note;
    $('#qv-custom').textContent = note;
    const c = p.color && M.COLORS[p.color];
    $('#qv-color').hidden = !c;
    $('#qv-color').innerHTML = c ? `<span class="sw" style="--sw:${c.swatch}"></span>Color: ${c.name}` : '';
    const hasSizes = p.sizes !== false;
    $('#qv-sizes-wrap').hidden = !hasSizes;
    $('#qv-sizes').innerHTML = hasSizes
      ? CFG.sizes.map((s) => `<input type="radio" name="qv-size" id="qv-size-${s}" value="${s}"${s === 'M' ? ' checked' : ''}><label for="qv-size-${s}">${s}</label>`).join('')
      : '';
    $('#qv-qty').textContent = '1';
    paintQV();
    if (!dlg.open) dlg.showModal();
  }

  function paintQV() {
    const p = resolve(qv.id, qv.custom);
    $('#qv-stage').innerHTML = M.garmentSVG(p, qv.view);
    $$('#qv-views button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === qv.view)));
  }

  function bindQV() {
    $('#qv-views').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-view]');
      if (!b) return;
      qv.view = b.dataset.view;
      paintQV();
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
      const q = e.target.closest('[data-qty]');
      if (q) {
        qv.qty = clamp(qv.qty + Number(q.dataset.qty), 1, 20);
        $('#qv-qty').textContent = qv.qty;
      }
    });
    $('#qv-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const p = resolve(qv.id, qv.custom);
      const checked = $('input[name="qv-size"]:checked');
      const size = p.sizes === false ? null : (checked ? checked.value : 'M');
      addToBag(qv.id, size, qv.qty, qv.custom);
      dlg.close();
    });
    // Cualquier botón con data-open abre la vista rápida de ese producto.
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open]');
      if (b) openQV(b.dataset.open);
    });
  }

  /* ---------- Bolsa ---------- */
  let bag = store.get('bc-bag-v1', []).filter((i) => i && byId[i.id] && i.qty > 0);
  const bagEl = $('#bag');
  const scrim = $('#scrim');
  let lastFocus = null;

  const saveBag = () => store.set('bc-bag-v1', bag);
  const bagTotal = () => bag.reduce((s, i) => s + resolve(i.id, i.custom).price * i.qty, 0);

  function addToBag(id, size, qty, custom) {
    const key = [id, size || '', custom ? JSON.stringify(custom) : ''].join('|');
    const found = bag.find((i) => i.key === key);
    if (found) found.qty += qty;
    else bag.push({ key, id, size, qty, custom: custom || null });
    saveBag();
    renderBag();
    const p = resolve(id, custom);
    toast('Agregado: ' + p.name + (size ? ' · talla ' + size : ''));
    restart($('#bag-open'), 'bump');
  }

  function orderText() {
    const lines = bag.map((i) => {
      const p = resolve(i.id, i.custom);
      const c = p.color && M.COLORS[p.color];
      const det = [c && c.name.toLowerCase(), i.size && 'talla ' + i.size, customNote(i.id, i.custom)].filter(Boolean).join(', ');
      return `• ${i.qty} × ${p.name}${det ? ' (' + det + ')' : ''}: ${money(p.price * i.qty)}`;
    });
    return `Hola, Bad Crowd. Quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: ${money(bagTotal())}\n\nNombre:\nComuna:`;
  }

  function renderBag() {
    const count = bag.reduce((s, i) => s + i.qty, 0);
    $$('[data-bag-count]').forEach((el) => {
      el.textContent = count;
      el.classList.toggle('is-zero', !count);
    });
    $('#bag-open').setAttribute('aria-label', 'Bolsa, ' + count + (count === 1 ? ' producto' : ' productos'));
    const list = $('#bag-items');
    if (!bag.length) {
      list.innerHTML = `<li class="bag-empty"><svg viewBox="0 0 170 142" aria-hidden="true"><use href="#sheep"/></svg><b>Tu bolsa está vacía</b><span>Raro, considerando la junta.</span><a class="btn btn--ink" href="#coleccion" data-bag-close>Ver la colección</a></li>`;
      $('#bag-foot').hidden = true;
      return;
    }
    list.innerHTML = bag.map((i) => {
      const p = resolve(i.id, i.custom);
      const c = p.color && M.COLORS[p.color];
      const meta = [c && c.name, i.size && 'Talla ' + i.size, customNote(i.id, i.custom)].filter(Boolean).join(' · ');
      return `<li class="bag-item" data-key="${esc(i.key)}">
        <div class="bag-thumb">${M.garmentSVG(p, p.thumb || 'front')}</div>
        <div class="bag-info">
          <p class="bag-name">${esc(p.name)}</p>
          <p class="bag-meta">${esc(meta)}</p>
          <div class="bag-row">
            <div class="qty qty--sm" role="group" aria-label="Cantidad de ${esc(p.name)}"><button type="button" data-act="dec" aria-label="Quitar uno">−</button><span>${i.qty}</span><button type="button" data-act="inc" aria-label="Agregar uno">+</button></div>
            <span class="bag-price">${money(p.price * i.qty)}</span>
          </div>
          <button class="link-btn" type="button" data-act="rm">Quitar</button>
        </div>
      </li>`;
    }).join('');
    $('#bag-foot').hidden = false;
    $('#bag-total').textContent = money(bagTotal());
    const text = orderText();
    $('#bag-wa').href = 'https://wa.me/' + (CFG.whatsapp || '') + '?text=' + encodeURIComponent(text);
    $('#bag-text').value = text;
    $('#bag-text').hidden = true;
  }

  function openBag() {
    lastFocus = document.activeElement;
    bagEl.classList.add('is-open');
    bagEl.removeAttribute('inert');
    bagEl.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    $('#bag-open').setAttribute('aria-expanded', 'true');
    setTimeout(() => $('#bag-close').focus(), 60);
  }

  function closeBag() {
    if (!bagEl.classList.contains('is-open')) return;
    bagEl.classList.remove('is-open');
    bagEl.setAttribute('inert', '');
    bagEl.setAttribute('aria-hidden', 'true');
    scrim.hidden = true;
    $('#bag-open').setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function bindBag() {
    $('#bag-open').addEventListener('click', openBag);
    $('#bag-close').addEventListener('click', closeBag);
    scrim.addEventListener('click', closeBag);
    $('#bag-items').addEventListener('click', (e) => {
      if (e.target.closest('[data-bag-close]')) { closeBag(); return; }
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const key = b.closest('.bag-item').dataset.key;
      const it = bag.find((i) => i.key === key);
      if (!it) return;
      if (b.dataset.act === 'inc') it.qty = Math.min(20, it.qty + 1);
      if (b.dataset.act === 'dec') it.qty -= 1;
      if (b.dataset.act === 'rm' || it.qty < 1) bag = bag.filter((i) => i !== it);
      saveBag();
      renderBag();
      if (!bag.length) $('#bag-close').focus();
    });
    $('#bag-copy').addEventListener('click', () => {
      const text = orderText();
      copy(text, () => toast('Pedido copiado'), () => {
        const ta = $('#bag-text');
        ta.hidden = false;
        ta.value = text;
        ta.focus();
        ta.select();
        toast('Selecciona el texto y cópialo');
      });
    });
  }

  /* ---------- Serie tachada y generador ---------- */
  const SERIE = PRODUCTS.filter((p) => p.serie);
  function renderSeries() {
    $('#series').innerHTML = SERIE.map((p) => {
      const c = M.COLORS[p.color];
      return `<button class="serie" type="button" data-open="${p.id}" aria-label="${esc(p.name)}, ${c.name.toLowerCase()}">${M.garmentSVG(p, 'front', '', true)}<span class="serie-label">${p.serie} — ${c.name}</span></button>`;
    }).join('');
  }

  const mk = { phrase: 'mañana empiezo', garment: 'tee', color: 'negro' };
  const mkClean = (s) => s.replace(/\s+/g, ' ').trim();

  function renderMaker() {
    const custom = { phrase: mkClean(mk.phrase) || 'tu frase', garment: mk.garment, color: mk.color };
    $('#maker-stage').innerHTML = M.garmentSVG(resolve('tu-frase', custom), 'front');
    $('#maker-price').textContent = money(mk.garment === 'tee' ? CFG.prices.polera : CFG.prices.poleron);
    $('#maker-left').textContent = 28 - mk.phrase.length;
  }

  function bindMaker() {
    const input = $('#maker-phrase');
    mk.phrase = input.value;
    input.addEventListener('input', () => {
      mk.phrase = input.value;
      $('#maker-error').hidden = true;
      renderMaker();
    });
    $$('.preset').forEach((b) => b.addEventListener('click', () => {
      input.value = b.textContent;
      mk.phrase = input.value;
      $('#maker-error').hidden = true;
      renderMaker();
    }));
    $$('input[name="garment"]').forEach((r) => r.addEventListener('change', () => { mk.garment = r.value; renderMaker(); }));
    $$('input[name="mcolor"]').forEach((r) => r.addEventListener('change', () => { mk.color = r.value; renderMaker(); }));
    $('#maker-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const phrase = mkClean(mk.phrase);
      if (phrase.length < 2) {
        $('#maker-error').hidden = false;
        input.focus();
        return;
      }
      openQV('tu-frase', { phrase, garment: mk.garment, color: mk.color });
    });
  }

  /* ---------- Pack y test ---------- */
  function renderPack() {
    $('#pack-row').innerHTML = ROLES.map((r) => {
      const p = byId['polera-pack-0' + r.n];
      return `<button class="pack-tee" type="button" data-open="${p.id}" aria-label="Polera N° 0${r.n}, ${esc(r.phrase)} tachado">${M.garmentSVG(p, 'front', '', true)}<span class="pack-num">N° 0${r.n}</span><span class="pack-role"><span class="x">${esc(r.phrase)}</span></span></button>`;
    }).join('');
    const full = CFG.prices.polera * ROLES.length;
    const save = full - CFG.prices.pack;
    $('#pack-price').textContent = money(CFG.prices.pack);
    $('#pack-was').textContent = money(full);
    $('#pack-was').hidden = save <= 0;
    $('#pack-save').textContent = save > 0 ? 'Ahorras ' + money(save) + ' versus comprarlas sueltas' : '';
  }

  const quiz = { i: 0, score: [], order: [], result: null };
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function startQuiz() {
    quiz.i = 0;
    quiz.score = ROLES.map(() => 0);
    quiz.order = QUIZ.map((q) => shuffle(q.a));
    quiz.result = null;
    renderQuiz();
  }
  function renderQuiz() {
    const body = $('#quiz-body');
    $('#quiz-bar').style.width = (quiz.i / QUIZ.length) * 100 + '%';
    if (quiz.i < QUIZ.length) {
      const q = QUIZ[quiz.i];
      body.innerHTML = `<p class="quiz-step">Pregunta ${quiz.i + 1} de ${QUIZ.length}</p>
        <p class="quiz-q">${esc(q.q)}</p>
        <div class="quiz-opts">${quiz.order[quiz.i].map((a) => `<button class="quiz-opt" type="button" data-n="${a.n}">${esc(a.t)}</button>`).join('')}</div>`;
      return;
    }
    if (quiz.result === null) {
      const max = Math.max.apply(null, quiz.score);
      const tied = quiz.score.map((s, k) => (s === max ? k : -1)).filter((k) => k >= 0);
      quiz.result = tied[Math.floor(Math.random() * tied.length)];
    }
    const r = ROLES[quiz.result];
    const p = byId['polera-pack-0' + r.n];
    body.innerHTML = `<div class="quiz-result">
      <div class="quiz-result-media">${M.garmentSVG(p, 'front')}</div>
      <div class="quiz-result-copy">
        <p class="quiz-step">Tu polera del pack</p>
        <p class="quiz-result-num">N° 0${r.n}</p>
        <p class="quiz-result-role"><span class="x">${esc(r.phrase)}</span></p>
        <p class="muted">${esc(r.desc)}</p>
        <div class="quiz-actions">
          <button class="btn btn--ink" type="button" data-open="${p.id}">Quiero la N° 0${r.n}</button>
          <button class="btn btn--line" type="button" data-quiz-again>Repetir el test</button>
        </div>
      </div>
    </div>`;
  }
  function bindQuiz() {
    $('#quiz-body').addEventListener('click', (e) => {
      const o = e.target.closest('.quiz-opt');
      const again = e.target.closest('[data-quiz-again]');
      if (o) {
        quiz.score[Number(o.dataset.n) - 1] += 1;
        quiz.i += 1;
        renderQuiz();
      } else if (again) {
        startQuiz();
      } else {
        return;
      }
      if (e.detail === 0) {
        const next = $('#quiz-body .quiz-opt, #quiz-body .btn');
        if (next) next.focus();
      }
    });
  }

  /* ---------- Pendientes ---------- */
  const DEFAULT_TODOS = window.BC_PENDIENTES.map((t) => ({ t, x: true }));
  let todos = store.get('bc-todos-v1', null);
  if (!Array.isArray(todos)) todos = DEFAULT_TODOS.map((o) => Object.assign({}, o));
  const MAX_TODOS = 5;
  const todoItems = () => todos.map((o) => o.t);
  const saveTodos = () => store.set('bc-todos-v1', todos);

  function todoStatus() {
    const open = todos.filter((o) => !o.x);
    $('#todo-status').textContent = !todos.length
      ? 'Sin pendientes. Solo queda salir.'
      : open.length ? 'Ojo: te queda «' + open[0].t + '» sin tachar.' : 'Todo tachado. Prioridades claras.';
  }
  function renderTodoTee() {
    $('#todo-stage').innerHTML = M.garmentSVG(resolve('polera-pendientes', { items: todoItems() }), 'back');
  }
  function renderTodos() {
    $('#todo-list').innerHTML = todos.map((o, k) => `<li>
      <button class="todo" type="button" data-k="${k}" aria-pressed="${o.x}"><span class="todo-t">${esc(o.t)}</span></button>
      <button class="todo-rm" type="button" data-rm="${k}" aria-label="Eliminar «${esc(o.t)}»"><svg aria-hidden="true"><use href="#i-close"/></svg></button>
    </li>`).join('');
    renderTodoTee();
    todoStatus();
  }
  function bindTodos() {
    $('#todo-list').addEventListener('click', (e) => {
      const t = e.target.closest('.todo');
      const rm = e.target.closest('.todo-rm');
      if (t) {
        const o = todos[Number(t.dataset.k)];
        o.x = !o.x;
        t.setAttribute('aria-pressed', String(o.x));
        saveTodos();
        todoStatus();
      } else if (rm) {
        todos.splice(Number(rm.dataset.rm), 1);
        saveTodos();
        renderTodos();
      }
    });
    $('#todo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#todo-input');
      const t = input.value.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!t) { input.focus(); return; }
      if (todos.length >= MAX_TODOS) { toast('Máximo ' + MAX_TODOS + ' pendientes. Ya es harto.'); return; }
      todos.push({ t, x: false });
      input.value = '';
      renderTodos();
      const k = todos.length - 1;
      setTimeout(() => {
        todos[k].x = true;
        const b = $(`.todo[data-k="${k}"]`);
        if (b) b.setAttribute('aria-pressed', 'true');
        saveTodos();
        todoStatus();
      }, 120);
    });
    $('#todo-buy').addEventListener('click', () => {
      const items = todoItems();
      const isDefault = JSON.stringify(items) === JSON.stringify(window.BC_PENDIENTES);
      openQV('polera-pendientes', isDefault ? null : { items }, 'back');
    });
  }

  /* ---------- Oveja negra ---------- */
  const START_FLOCK = () => Array.from({ length: 12 }, (_, k) => k === 6);
  let flock = START_FLOCK();
  function flockStatus() {
    const n = flock.filter(Boolean).length;
    $('#sheep-n').textContent = n;
    $('#sheep-msg').textContent = n === 1 ? 'Una oveja negra. Como en toda junta.'
      : n < 6 ? 'Se está contagiando.'
        : n < 12 ? 'Las negras ya son mayoría.'
          : 'Listo: la junta entera es Bad Crowd.';
  }
  function renderFlock() {
    $('#flock').innerHTML = flock.map((b, k) => `<button class="sheep-btn" type="button" data-k="${k}" aria-pressed="${b}" aria-label="Oveja ${k + 1}, ${b ? 'negra' : 'blanca'}"><svg viewBox="0 0 170 142" aria-hidden="true"><use href="#sheep"/></svg></button>`).join('');
    flockStatus();
  }
  function bindFlock() {
    $('#flock').addEventListener('click', (e) => {
      const b = e.target.closest('.sheep-btn');
      if (!b) return;
      const k = Number(b.dataset.k);
      if (flock[k]) { restart(b, 'nope'); return; }
      flock[k] = true;
      b.setAttribute('aria-pressed', 'true');
      b.setAttribute('aria-label', 'Oveja ' + (k + 1) + ', negra');
      restart(b, 'pop');
      flockStatus();
    });
    $('#sheep-reset').addEventListener('click', () => { flock = START_FLOCK(); renderFlock(); });
  }

  /* ---------- Credencial ---------- */
  const randNum = () => String(Math.floor(Math.random() * 9998) + 2).padStart(4, '0');
  let cred = store.get('bc-cred-v1', null);
  if (!cred || typeof cred.num !== 'string') cred = { name: '', num: randNum(), head: 'rosa' };
  const saveCred = () => store.set('bc-cred-v1', cred);

  function renderCred() {
    $('#cred-card').innerHTML = M.credSVG(cred.name, cred.num, cred.head);
    $('#cred-tee').innerHTML = M.garmentSVG(resolve('polera-credencial', cred), 'back');
  }

  function bindCred() {
    const name = $('#cred-name');
    const num = $('#cred-num');
    name.value = cred.name;
    num.value = cred.num;
    const head = $('#ch-' + (cred.head === 'negro' ? 'negro' : 'rosa'));
    if (head) head.checked = true;

    name.addEventListener('input', () => { cred.name = name.value.replace(/\s+/g, ' ').trim(); saveCred(); renderCred(); });
    num.addEventListener('input', () => {
      const digits = num.value.replace(/\D/g, '').slice(0, 4);
      if (num.value !== digits) num.value = digits;
      cred.num = (digits || '0').padStart(4, '0');
      saveCred();
      renderCred();
    });
    num.addEventListener('blur', () => { num.value = cred.num; });
    $('#cred-dice').addEventListener('click', () => { cred.num = randNum(); num.value = cred.num; saveCred(); renderCred(); });
    $$('input[name="chead"]').forEach((r) => r.addEventListener('change', () => { cred.head = r.value; saveCred(); renderCred(); }));
    $('#cred-shirt').addEventListener('click', () => openQV('polera-credencial', Object.assign({}, cred), 'back'));
    $('#cred-download').addEventListener('click', downloadCred);
  }

  function downloadCred() {
    const S = 3, W = 400, H = 250;
    const cv = document.createElement('canvas');
    cv.width = W * S;
    cv.height = H * S;
    const g = cv.getContext('2d');
    g.scale(S, S);
    const dark = cred.head === 'negro';
    const FD = "'Archivo Black','Arial Black',sans-serif";
    const FB = "'Space Grotesk',Arial,sans-serif";
    const FM = "'Space Mono',monospace";
    const rr = (x, y, w, h, r) => {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    };
    const txt = (t, x, y, font, color, align, ls) => {
      g.font = font;
      g.fillStyle = color;
      g.textAlign = align || 'left';
      if ('letterSpacing' in g) g.letterSpacing = (ls || 0) + 'px';
      g.fillText(t, x, y);
      return g.measureText(t).width;
    };
    const draw = (img) => {
      rr(0, 0, W, H, 18);
      g.fillStyle = '#F4F2EE';
      g.fill();
      g.save();
      rr(0, 0, W, H, 18);
      g.clip();
      g.fillStyle = dark ? '#111111' : '#F04A7E';
      g.fillRect(0, 0, W, 56);
      g.restore();
      const hInk = dark ? '#F4F2EE' : '#111111';
      const w = txt('BAD CROWD', 22, 38, '21px ' + FD, hInk);
      txt('.', 22 + w, 38, '21px ' + FD, dark ? '#F04A7E' : '#111111');
      txt('CREDENCIAL OFICIAL', 378, 32, '700 8.5px ' + FB, hInk, 'right', 2.2);
      rr(22, 72, 100, 122, 8);
      g.fillStyle = '#E2DED6';
      g.fill();
      if (img) g.drawImage(img, 32, 99.6, 80, 66.8);
      const label = (t, x, y, align) => txt(t, x, y, '700 8px ' + FB, '#3D3B37', align, 2);
      label('NOMBRE', 140, 82);
      if (cred.name) {
        g.font = '17px ' + FD;
        if ('letterSpacing' in g) g.letterSpacing = '0px';
        const nw = g.measureText(cred.name).width;
        const fs = nw > 236 ? 17 * 236 / nw : 17;
        txt(cred.name, 140, 103, fs + 'px ' + FD, '#111111');
      }
      g.fillStyle = '#55524D';
      g.fillRect(140, 108.4, 238, 1.2);
      label('MIEMBRO N°', 140, 128);
      txt(cred.num, 140, 149, '17px ' + FD, '#111111');
      label('VÁLIDO HASTA', 140, 170);
      txt('NUNCA.', 140, 191, '17px ' + FD, '#111111');
      label('HECHO EN CHILE', 22, 232);
      txt('BC.', 378, 232, '700 9px ' + FM, '#111111', 'right');
      cv.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'credencial-bad-crowd-' + cred.num + '.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        toast('Credencial N° ' + cred.num + ' lista');
      }, 'image/png');
    };
    const img = new Image();
    img.onload = () => draw(img);
    img.onerror = () => draw(null);
    img.src = M.sheepDataURL('black');
  }

  /* ---------- Stickers ---------- */
  const STICKERS = [
    { k: 'seal', label: 'sello', x: 0.03, y: 0.06, r: -8 },
    { k: 'bc', label: 'monograma BC', x: 0.37, y: 0.08, r: 9 },
    { k: 'logo', label: 'logo principal', x: 0.9, y: 0.04, r: -4 },
    { k: 'oval', label: 'oveja negra', x: 0.03, y: 0.62, r: -5 },
    { k: 'capsule', label: 'cápsula Bad Crowd', x: 0.42, y: 0.44, r: -6 },
    { k: 'pill', label: 'buena junta tachado', x: 0.36, y: 0.8, r: 5 },
    { k: 'member', label: 'miembro oficial', x: 0.95, y: 0.5, r: 4 },
    { k: 'chile', label: 'hecho en Chile', x: 0.08, y: 0.98, r: -4 },
    { k: 'pinkdot', label: 'oveja en círculo rosa', x: 0.76, y: 0.97, r: 8 },
  ];
  const STK_HTML = {
    seal: () => M.sealSVG('#F4F2EE', '#111111'),
    bc: () => '<span>BC<i>.</i></span>',
    logo: () => '<div class="logo-stack"><span class="x">buena junta</span><b>BAD<br>CROWD<i>.</i></b></div>',
    oval: () => '<svg viewBox="0 0 170 142" aria-hidden="true"><use href="#sheep"/></svg>',
    capsule: () => '<span>BAD CROWD<i>.</i></span>',
    pill: () => '<s>buena junta</s>',
    member: () => '<div><small>MIEMBRO OFICIAL</small><b>BAD CROWD<i>.</i></b><span class="num">N° 0001</span></div>',
    chile: () => '<span>HECHO EN CHILE</span>',
    pinkdot: () => '<svg viewBox="0 0 170 142" aria-hidden="true"><use href="#sheep"/></svg>',
  };
  const board = $('#board');
  let stks = STICKERS.map((s) => Object.assign({}, s));
  let zTop = STICKERS.length;
  let drag = null;

  function renderBoard() {
    board.innerHTML = stks.map((s, k) => `<div class="stk stk--${s.k}" data-k="${k}" tabindex="0" role="button" aria-roledescription="sticker" aria-label="Sticker ${esc(s.label)}. Arrástralo o muévelo con las flechas." style="--r:${s.r}deg;z-index:${k + 1}">${STK_HTML[s.k]()}</div>`).join('');
    placeAll();
  }
  function placeOne(el) {
    const s = stks[Number(el.dataset.k)];
    const maxX = Math.max(0, board.clientWidth - el.offsetWidth);
    const maxY = Math.max(0, board.clientHeight - el.offsetHeight);
    el.style.left = s.x * maxX + 'px';
    el.style.top = s.y * maxY + 'px';
    el.style.setProperty('--r', s.r + 'deg');
  }
  function placeAll(animate) {
    $$('.stk', board).forEach((el) => {
      if (animate && !reduceMotion) {
        restart(el, 'is-moving');
        setTimeout(() => el.classList.remove('is-moving'), 650);
      }
      placeOne(el);
    });
  }
  function bindBoard() {
    board.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.stk');
      if (!el || e.button > 0) return;
      e.preventDefault();
      el.focus({ preventScroll: true });
      el.setPointerCapture(e.pointerId);
      el.classList.remove('is-moving');
      el.classList.add('is-drag');
      el.style.zIndex = ++zTop;
      const r = board.getBoundingClientRect();
      drag = { el, id: e.pointerId, dx: e.clientX - r.left - el.offsetLeft, dy: e.clientY - r.top - el.offsetTop };
    });
    board.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const r = board.getBoundingClientRect();
      const el = drag.el;
      const maxX = Math.max(0, board.clientWidth - el.offsetWidth);
      const maxY = Math.max(0, board.clientHeight - el.offsetHeight);
      const x = clamp(e.clientX - r.left - drag.dx, 0, maxX);
      const y = clamp(e.clientY - r.top - drag.dy, 0, maxY);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const s = stks[Number(el.dataset.k)];
      s.x = maxX ? x / maxX : 0;
      s.y = maxY ? y / maxY : 0;
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.el.classList.remove('is-drag');
      drag = null;
    };
    board.addEventListener('pointerup', end);
    board.addEventListener('pointercancel', end);
    board.addEventListener('keydown', (e) => {
      const el = e.target.closest('.stk');
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!el || !step) return;
      e.preventDefault();
      const s = stks[Number(el.dataset.k)];
      s.x = clamp(s.x + step[0] * 0.04, 0, 1);
      s.y = clamp(s.y + step[1] * 0.04, 0, 1);
      el.style.zIndex = ++zTop;
      placeOne(el);
    });
    $('#board-mess').addEventListener('click', () => {
      stks.forEach((s) => { s.x = Math.random(); s.y = Math.random(); s.r = Math.round(Math.random() * 36 - 18); });
      placeAll(true);
    });
    $('#board-tidy').addEventListener('click', () => {
      stks = STICKERS.map((s) => Object.assign({}, s));
      placeAll(true);
    });
    $('#stickers-price').textContent = money(CFG.prices.stickers);
    $('#stickers-add').addEventListener('click', () => addToBag('pack-stickers', null, 1, null));
    let raf;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => placeAll(false));
    });
  }

  /* ---------- Marca, tallas, menú ---------- */
  function bindBrand() {
    $$('.swatch').forEach((b) => b.addEventListener('click', () => {
      const hex = b.dataset.hex;
      copy(hex, () => toast('Copiado ' + hex), () => toast('Código: ' + hex));
    }));
  }

  function bindTabs() {
    const tabs = $$('.tab');
    const select = (t) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
      t.focus();
    };
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(tabs[(k + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]);
        }
      });
    });
  }

  function bindMenu() {
    const nav = $('#nav');
    const btn = $('#menu-btn');
    const set = (open) => {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    btn.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      set(false);
      closeBag();
    });
    if (CFG.instagram) {
      $('#ig-link').href = CFG.instagram;
      $('#ig-item').hidden = false;
    }
  }

  /* ---------- Arranque ---------- */
  // Todo lo que mide texto se vuelve a dibujar cuando cargan las fuentes.
  function renderType() {
    renderHero();
    renderCatalog();
    renderSeries();
    renderMaker();
    renderPack();
    renderQuiz();
    renderTodoTee();
    renderCred();
    placeAll(false);
  }

  renderSeals();
  bindCatalog();
  bindQV();
  bindBag();
  bindMaker();
  bindQuiz();
  bindTodos();
  bindFlock();
  bindCred();
  bindBoard();
  bindBrand();
  bindTabs();
  bindMenu();

  startQuiz();
  renderTodos();
  renderFlock();
  renderBoard();
  renderBag();
  renderType();
  startHeroCycle();

  if (document.fonts && document.fonts.load) {
    Promise.allSettled([
      document.fonts.load("400 20px 'Archivo Black'"),
      document.fonts.load("400 16px 'Space Grotesk'"),
      document.fonts.load("500 16px 'Space Grotesk'"),
      document.fonts.load("700 16px 'Space Grotesk'"),
      document.fonts.load("700 12px 'Space Mono'"),
    ]).then(() => document.fonts.ready).then(renderType);
  }
})();
