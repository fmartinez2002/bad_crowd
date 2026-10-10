/* Bad Crowd — mockups vectoriales.
   Dibuja poleras, polerones, sellos, stickers y la credencial como SVG,
   siguiendo las láminas del PDF de marca. */
(function () {
  'use strict';

  const FD = "'Archivo Black','Arial Black',Impact,sans-serif";
  const FB = "'Space Grotesk','Helvetica Neue',Arial,sans-serif";
  const FM = "'Space Mono',ui-monospace,Menlo,monospace";
  const PINK = '#E0245E';
  const PINK_L = '#F04A7E';
  const INK = '#111111';
  const CREAM = '#F4F2EE';

  const COLORS = {
    crudo: { name: 'Crudo', fill: '#EFECE4', line: '#A9A69F', detail: '#CFCBC2', shade: '#DCD8CF', strings: '#A9A69F', ink: INK, muted: '#5E5B55', pink: PINK, swatch: '#EFECE4' },
    gris: { name: 'Gris', fill: '#C4C2BC', line: '#8E8C86', detail: '#A6A49E', shade: '#ABA9A3', strings: '#8E8C86', ink: INK, muted: '#3D3B37', pink: '#D81E57', swatch: '#C4C2BC' },
    negro: { name: 'Negro', fill: '#1B1B1B', line: '#1B1B1B', detail: '#3A3A3A', shade: '#2C2C2C', strings: '#4A4A4A', ink: CREAM, muted: '#A29F99', pink: PINK_L, swatch: '#1B1B1B' },
  };

  /* Ubicación de cada estampado en el dibujo de la prenda (medido sobre el PDF). */
  const POS = {
    tee: {
      chest: { x: 262, y: 98, fs: 20 },
      nape: { x: 200, y: 46, fs: 14 },
      back: { x: 135, y: 74, fs: 28 },
      frontBig: { x: 143, y: 80, fs: 24 },
      line: { x: 200, y: 92, fs: 21, max: 210 },
      check: { x: 140, y: 68 },
      sheep: { x: 257, y: 94, w: 36 },
      grid: { x: 202, y: 78, w: 30, dx: 39.5, dy: 32, text: 184, fs: 16 },
      seal: { x: 200, y: 130, d: 124 },
      stickers: { x: 117, y: 64 },
      cred: { x: 122, y: 62, w: 158 },
    },
    hoodie: {
      chest: { x: 260, y: 130, fs: 20 },
      back: { x: 129, y: 172, fs: 32 },
      line: { x: 202, y: 186, fs: 18, max: 200 },
      sheep: { x: 205, y: 200, w: 50 },
      grid: { x: 206, y: 182, w: 33, dx: 46.5, dy: 37.5, text: 302, fs: 18 },
      stickers: { x: 119, y: 158 },
      hood: { x: 203, y: 66, fs: 12 },
      sleeve: { x: 343, y: 214, fs: 12.5, rot: 78 },
    },
  };

  /* Oveja negra: una sola geometría para el <symbol> y para el canvas de descarga. */
  const WOOL = [[38, 60, 30], [72, 40, 34], [106, 54, 27], [55, 82, 25], [94, 82, 25]];
  const LEGS = [[44, 86], [62, 90], [82, 90], [100, 86]];
  function sheepInner(c) {
    const circles = WOOL.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    return `<g style="fill:${c.line}">${LEGS.map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="52" rx="5"/>`).join('')}</g>` +
      `<g style="fill:${c.line};stroke:${c.line}" stroke-width="10">${circles}</g>` +
      `<g style="fill:${c.wool}">${circles}</g>` +
      `<ellipse cx="136" cy="62" rx="25" ry="28" style="fill:${c.head}"/>` +
      `<ellipse cx="147" cy="35" rx="12" ry="7" transform="rotate(-25 147 35)" style="fill:${c.head}"/>` +
      `<circle cx="146" cy="57" r="5.5" style="fill:${c.eye}"/>`;
  }
  const SHEEP_VARS = {
    line: 'var(--sheep-line,#111111)', wool: 'var(--sheep-wool,#2B2B2B)',
    head: 'var(--sheep-head,#161616)', eye: 'var(--sheep-eye,#E0245E)',
  };
  const SHEEP_STYLE = {
    black: '--sheep-wool:#2B2B2B;--sheep-line:#111111;--sheep-head:#161616;--sheep-eye:#E0245E',
    white: '--sheep-wool:#FFFFFF;--sheep-line:#111111;--sheep-head:#111111;--sheep-eye:#FFFFFF',
    pink: '--sheep-wool:#2B2B2B;--sheep-line:#111111;--sheep-head:#161616;--sheep-eye:#FFFFFF',
  };

  // Registra el símbolo en el sprite del documento.
  const sprite = document.getElementById('sprite');
  if (sprite && !document.getElementById('sheep')) {
    sprite.insertAdjacentHTML('beforeend', `<symbol id="sheep" viewBox="0 0 170 142">${sheepInner(SHEEP_VARS)}</symbol>`);
  }

  /* Utilidades */
  const n = (v) => Math.round(v * 100) / 100;
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  let mctx;
  function measure(text, font) {
    mctx = mctx || document.createElement('canvas').getContext('2d');
    mctx.font = font;
    return mctx.measureText(text).width;
  }
  function T(x, y, fs, fill, family, content, extra) {
    return `<text x="${n(x)}" y="${n(y)}" font-family="${family}" font-size="${n(fs)}" fill="${fill}" ${extra || ''}>${content}</text>`;
  }
  const dotted = (txt, pink) => `${txt}<tspan fill="${pink}">.</tspan>`;

  /* Texto tachado con la raya rosa levemente chueca. y = línea base. */
  function struck(x, y, fs, text, color, pink, anchor, weight, maxW) {
    weight = weight || 400;
    let w = measure(text, `${weight} ${fs}px ${FB}`);
    if (maxW && w > maxW) { fs = fs * maxW / w; w = maxW; }
    const left = anchor === 'middle' ? x - w / 2 : x;
    const x1 = left - fs * 0.3, x2 = left + w + fs * 0.3;
    const y1 = y - fs * 0.22, y2 = y - fs * 0.44;
    return T(x, y, fs, color, FB, esc(text), `text-anchor="${anchor || 'start'}" font-weight="${weight}"`) +
      `<path d="M${n(x1)},${n(y1)} L${n(x2)},${n(y2)}" stroke="${pink}" stroke-width="${n(Math.max(1.1, fs * 0.15))}" stroke-linecap="round" fill="none"/>`;
  }

  function sheep(cx, cy, w, v) {
    const h = w * 142 / 170;
    return `<use href="#sheep" x="${n(cx - w / 2)}" y="${n(cy - h / 2)}" width="${n(w)}" height="${n(h)}" style="${SHEEP_STYLE[v || 'black']}"/>`;
  }

  /* Sello circular (coordenadas 220×220). */
  function sealG(bg, ink) {
    return `<circle cx="110" cy="110" r="104" fill="${bg}" stroke="${ink}" stroke-width="5"/>` +
      `<circle cx="110" cy="110" r="68" fill="none" stroke="${ink}" stroke-width="2.5"/>` +
      `<text font-family="${FD}" font-size="16" fill="${ink}" letter-spacing="0.5"><textPath href="#seal-path" xlink:href="#seal-path" textLength="470" lengthAdjust="spacing">BAD CROWD ✦ HECHO EN CHILE ✦ EST. 2026 ✦</textPath></text>` +
      sheep(110, 112, 92, 'black');
  }
  function sealSVG(bg, ink, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 220 220" role="img" aria-label="Sello Bad Crowd, hecho en Chile, est. 2026" xmlns="http://www.w3.org/2000/svg">${sealG(bg || CREAM, ink || INK)}</svg>`;
  }

  /* Credencial (coordenadas 400×250). */
  function credG(name, num, head) {
    const dark = head === 'negro';
    const hFill = dark ? INK : PINK_L;
    const hInk = dark ? CREAM : INK;
    let nm = '';
    if (name) {
      let fs = 17;
      const w = measure(name, `400 ${fs}px ${FD}`);
      if (w > 236) fs = fs * 236 / w;
      nm = T(140, 103, fs, INK, FD, esc(name));
    }
    const label = (x, y, t, anchor) => T(x, y, 8, '#3D3B37', FB, t, `font-weight="700" letter-spacing="2" ${anchor ? `text-anchor="${anchor}"` : ''}`);
    return `<rect x="0" y="0" width="400" height="250" rx="18" fill="${CREAM}"/>` +
      `<path d="M0,18 Q0,0 18,0 H382 Q400,0 400,18 V56 H0 Z" fill="${hFill}"/>` +
      T(22, 38, 21, hInk, FD, dotted('BAD CROWD', dark ? PINK_L : hInk)) +
      T(378, 32, 8.5, hInk, FB, 'CREDENCIAL OFICIAL', 'text-anchor="end" font-weight="700" letter-spacing="2.2"') +
      `<rect x="22" y="72" width="100" height="122" rx="8" fill="#E2DED6"/>` +
      sheep(72, 133, 80, 'black') +
      label(140, 82, 'NOMBRE') + nm +
      `<path d="M140,109 H378" stroke="#55524D" stroke-width="1.2"/>` +
      label(140, 128, 'MIEMBRO N°') +
      T(140, 149, 17, INK, FD, esc(num || '0001')) +
      label(140, 170, 'VÁLIDO HASTA') +
      T(140, 191, 17, INK, FD, 'NUNCA.') +
      label(22, 232, 'HECHO EN CHILE') +
      T(378, 232, 9, INK, FM, 'BC.', 'text-anchor="end" font-weight="700"') +
      (dark ? `<rect x="0.75" y="0.75" width="398.5" height="248.5" rx="17.4" fill="none" stroke="#5A5A5A" stroke-width="1.5"/>` : '');
  }
  function credSVG(name, num, head, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 400 250" role="img" aria-label="Credencial oficial Bad Crowd, miembro número ${esc(num)}" xmlns="http://www.w3.org/2000/svg">${credG(name, num, head)}</svg>`;
  }

  /* Siluetas */
  function tee(c, view) {
    const front = view === 'front';
    const neck = front ? 'C179,27 221,27 243,2' : 'C183,12 217,12 243,2';
    let s = `<path d="M157,2 ${neck} L323,23 L400,110 L358,155 L328,135 L328,428 L72,428 L72,135 L42,155 L0,110 L77,23 Z" fill="${c.fill}" stroke="${c.line}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (front) s += `<path d="M157,2 C183,12 217,12 243,2 C221,27 179,27 157,2 Z" fill="${c.shade}"/>`;
    s += `<path d="M157,2 ${neck}" fill="none" stroke="${c.detail}" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M9,101 L50,146 M391,101 L350,146 M72,414 H328" fill="none" stroke="${c.detail}" stroke-width="2"/>`;
    return s;
  }

  function hoodie(c, view) {
    const st = `fill="${c.fill}" stroke="${c.line}" stroke-width="2.5" stroke-linejoin="round"`;
    const sleeves = `<path d="M75,67 L0,430 L40,441 L73,192 Z" ${st}/><path d="M330,67 L405,430 L365,441 L332,192 Z" ${st}/>`;
    const body = `<path d="M75,67 L142,45 L264,45 L330,67 L332,458 L73,458 Z" ${st}/>`;
    const lines = `<path d="M3,417 L42,428 M402,417 L363,428 M73,437 H332" fill="none" stroke="${c.detail}" stroke-width="2"/>`;
    if (view === 'front') {
      return `<path d="M140,50 C136,-4 270,-4 266,50 Z" ${st}/>` + sleeves + body +
        `<path d="M150,46 Q203,26 256,46 Q256,94 203,94 Q150,94 150,46 Z" fill="${c.shade}"/>` +
        `<path d="M188,90 L184,146 M218,90 L222,146" fill="none" stroke="${c.strings}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M127,331 H278 L307,425 H98 Z" fill="none" stroke="${c.detail}" stroke-width="2" stroke-linejoin="round"/>` + lines;
    }
    return sleeves + body +
      `<path d="M150,50 C138,-2 268,-2 256,50 L251,104 C231,126 175,126 155,104 Z" ${st}/>` +
      `<path d="M203,10 V118" stroke="${c.detail}" stroke-width="2"/>` + lines;
  }

  /* Estampados */
  const mono = (p, c) => T(p.x, p.y, p.fs, c.ink, FD, dotted('BC', c.pink), 'text-anchor="middle"');

  function stack(p, c, phrase) {
    const pf = p.fs * 0.42;
    return struck(p.x + 1, p.y, pf, phrase || 'buena junta', c.muted, c.pink, 'start') +
      T(p.x, p.y + p.fs * 0.98, p.fs, c.ink, FD, 'BAD') +
      T(p.x, p.y + p.fs * 1.86, p.fs, c.ink, FD, dotted('CROWD', c.pink));
  }

  function line(p, c, phrase, color) {
    return struck(p.x, p.y, p.fs * 0.7, phrase, color || c.ink, c.pink, 'middle', 500, p.max) +
      T(p.x, p.y + p.fs * 1.14, p.fs, c.ink, FD, dotted('BAD CROWD', c.pink), 'text-anchor="middle"');
  }

  function pack(p, c, phrase, num) {
    return line(p, c, phrase, c.muted) +
      T(p.x + 1.2, p.y + p.fs * 1.95, p.fs * 0.44, c.ink, FM, 'N° 0' + num, 'text-anchor="middle" letter-spacing="2.4" font-weight="700"');
  }

  function checklist(p, c, items) {
    let s = T(p.x, p.y, 7.5, c.ink, FB, 'PENDIENTES:', 'font-weight="700" letter-spacing="2.4"');
    let y = p.y + 20;
    (items || []).slice(0, 5).forEach((t) => { s += struck(p.x, y, 10.5, t, c.ink, c.pink, 'start', 500, 150); y += 19; });
    y += 9;
    s += `<path d="M${p.x + 2},${y - 7} l5.5,6 l10,-12" fill="none" stroke="${c.pink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += T(p.x + 25, y - 2, 12.5, c.ink, FD, 'salir con') + T(p.x + 25, y + 12.5, 12.5, c.ink, FD, dotted('la bad crowd', c.pink));
    return s;
  }

  function grid(p, c) {
    let s = '';
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 4; k++) {
        s += sheep(p.x + (k - 1.5) * p.dx, p.y + r * p.dy, p.w, r === 1 && k === 2 ? 'black' : 'white');
      }
    }
    return s + T(p.x, p.text, p.fs, c.ink, FD, dotted('BAD CROWD', c.pink), 'text-anchor="middle"');
  }

  function seal(p, c) {
    const d = p.d;
    return `<svg x="${p.x - d / 2}" y="${p.y - d / 2}" width="${d}" height="${d}" viewBox="0 0 220 220">${sealG(c.fill, INK)}</svg>`;
  }

  /* Collage de stickers para espaldas (origen arriba a la izquierda, ~172×210). */
  function stickers(p) {
    const W = '#FFFFFF';
    return `<g transform="translate(${p.x},${p.y})">` +
      `<circle cx="37" cy="37" r="37" fill="${W}"/>` +
      `<svg x="3" y="3" width="68" height="68" viewBox="0 0 220 220">${sealG(CREAM, INK)}</svg>` +
      `<circle cx="126" cy="33" r="28" fill="${W}"/><circle cx="126" cy="33" r="24.5" fill="${INK}"/>` +
      T(126, 39, 16, CREAM, FD, dotted('BC', PINK_L), 'text-anchor="middle"') +
      `<g transform="rotate(-3 80 100)"><rect x="21" y="83" width="118" height="34" rx="17" fill="${W}"/><rect x="24.5" y="86.5" width="111" height="27" rx="13.5" fill="${INK}"/>` +
      T(80, 104.5, 12, CREAM, FD, dotted('BAD CROWD', PINK_L), 'text-anchor="middle"') + `</g>` +
      `<ellipse cx="36" cy="152" rx="37" ry="29" fill="${W}"/>` + sheep(37, 152, 50, 'black') +
      `<g transform="rotate(4 121 139)"><rect x="79" y="125" width="84" height="28" rx="14" fill="${W}"/><rect x="82" y="128" width="78" height="22" rx="11" fill="${PINK_L}"/>` +
      struck(121, 143, 10, 'buena junta', INK, INK, 'middle', 500) + `</g>` +
      `<g transform="rotate(-3 127 182)"><rect x="83" y="156" width="88" height="52" rx="5" fill="${W}"/><rect x="86.5" y="159.5" width="81" height="45" rx="3" fill="${CREAM}" stroke="${INK}" stroke-width="1.4"/>` +
      T(127, 172, 5.2, INK, FB, 'MIEMBRO OFICIAL', 'text-anchor="middle" font-weight="700" letter-spacing="1"') +
      T(127, 186, 10.5, INK, FD, dotted('BAD CROWD', PINK), 'text-anchor="middle"') +
      T(127, 197, 5.5, INK, FM, 'N° 0001', 'text-anchor="middle" letter-spacing="1.2"') + `</g>` +
      `</g>`;
  }

  const hood = (p, c) => T(p.x, p.y, p.fs, c.ink, FD, dotted('BAD CROWD', c.pink), 'text-anchor="middle"');
  const sleeve = (p, c) => `<text transform="translate(${p.x},${p.y}) rotate(${p.rot})" font-family="${FD}" font-size="${p.fs}" letter-spacing="1.6" fill="${c.ink}">${dotted('BAD CROWD', c.pink)}</text>`;

  function print(spec, pos, c) {
    const [kind, a, b, d] = spec;
    switch (kind) {
      case 'mono': return mono(pos[a || 'chest'], c);
      case 'stack': return stack(pos[a || 'back'], c);
      case 'line': return line(pos.line, c, a);
      case 'pack': return pack(pos.line, c, a, b);
      case 'checklist': return checklist(pos.check, c, a);
      case 'sheep': return sheep(pos.sheep.x, pos.sheep.y, pos.sheep.w, 'black');
      case 'grid': return grid(pos.grid, c);
      case 'seal': return seal(pos.seal, c);
      case 'stickers': return stickers(pos.stickers);
      case 'credential': return `<g transform="translate(${pos.cred.x},${pos.cred.y}) scale(${pos.cred.w / 400})">${credG(a, b, d)}</g>`;
      case 'hood': return hood(pos.hood, c);
      case 'sleeve': return sleeve(pos.sleeve, c);
      default: return '';
    }
  }

  /* Pack: tres poleras superpuestas (N° 01, N° 03 al frente, N° 05). */
  function packSVG(cls, label) {
    const c = Object.assign({}, COLORS.negro, { line: '#EAE8E3' });
    const roles = window.BC_ROLES || [];
    const one = (k, tx, ty, s) => `<g transform="translate(${tx},${ty}) scale(${s})">${tee(c, 'front')}${roles[k - 1] ? pack(POS.tee.line, c, roles[k - 1].phrase, k) : ''}</g>`;
    return `<svg class="${cls || ''}" viewBox="-6 -6 588 420" role="img" aria-label="${esc(label || 'Pack Bad Crowd')}" xmlns="http://www.w3.org/2000/svg">${one(1, 0, 40, 0.76)}${one(5, 264, 40, 0.76)}${one(3, 118, 0, 0.86)}</svg>`;
  }

  function stickersSVG(cls, label) {
    return `<svg class="${cls || ''}" viewBox="0 0 400 400" role="img" aria-label="${esc(label || 'Pack de stickers')}" xmlns="http://www.w3.org/2000/svg">` +
      `<g transform="translate(62,26) scale(1.6)">${stickers({ x: 0, y: 0 })}</g></svg>`;
  }

  /* crop: encuadre del pecho (solo poleras), para grillas compactas. */
  function garmentSVG(prod, view, cls, crop) {
    view = view || 'front';
    if (prod.type === 'pack') return packSVG(cls, prod.name);
    if (prod.type === 'stickers') return stickersSVG(cls, prod.name);
    const c = COLORS[prod.color] || COLORS.crudo;
    const pos = POS[prod.type];
    const base = prod.type === 'hoodie' ? hoodie(c, view) : tee(c, view);
    const specs = (view === 'back' ? prod.back : prod.front) || [];
    const vb = prod.type === 'hoodie' ? '-8 -8 421 476' : crop ? '-8 -8 416 300' : '-8 -8 416 446';
    const label = `${prod.name}, ${c.name.toLowerCase()}, ${view === 'back' ? 'espalda' : 'frente'}`;
    return `<svg class="${cls || ''}" viewBox="${vb}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${base}${specs.map((s) => print(s, pos, c)).join('')}</svg>`;
  }

  /* Oveja suelta como imagen (para dibujar en canvas). */
  function sheepDataURL(v) {
    const c = v === 'white'
      ? { line: INK, wool: '#FFFFFF', head: INK, eye: '#FFFFFF' }
      : { line: INK, wool: '#2B2B2B', head: '#161616', eye: PINK };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 142" width="340" height="284">${sheepInner(c)}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  window.BCMock = { COLORS, PINK, PINK_L, garmentSVG, credSVG, sealSVG, sheepDataURL, sheepStyle: SHEEP_STYLE, esc, measure };
})();
