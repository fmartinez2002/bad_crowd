/* Bad Crowd — datos de la tienda.
   Todo lo editable vive aquí: precios, WhatsApp, productos, roles del pack y el test. */

window.BC_CONFIG = {
  // Número de WhatsApp con código de país, sin "+" ni espacios (ej: '56912345678').
  // Si queda vacío, WhatsApp pregunta a qué contacto enviar el pedido.
  whatsapp: '',
  // Link a Instagram (ej: 'https://instagram.com/tu_cuenta'). Vacío = no se muestra.
  instagram: '',
  // Precios en pesos chilenos. Cámbialos antes de publicar.
  prices: { polera: 24990, poleron: 35990, pack: 90990, stickers: 4990 },
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
};

/* Los cinco del Pack Bad Crowd. La frase se imprime tachada: es el rol que nadie cumple. */
window.BC_ROLES = [
  { n: 1, phrase: 'el que avisa', desc: 'Dices «voy en camino» desde la ducha. Nadie sabe si vienes, pero siempre llegas.' },
  { n: 2, phrase: 'el que pone la casa', desc: 'Tu casa siempre está «complicada». Igual conoces el sillón de cada uno de la junta.' },
  { n: 3, phrase: 'el que paga', desc: 'Tu frase favorita es «después te transfiero». Hay un Excel con tu nombre.' },
  { n: 4, phrase: 'el que organiza', desc: 'Contestas «vean ustedes» y apareces igual. Cero planes, asistencia perfecta.' },
  { n: 5, phrase: 'el responsable', desc: '«Una y nos vamos» fue hace seis horas. Eres la razón del chat de las 4 AM.' },
];

/* Test «¿Qué NO eres en la junta?». Cada respuesta suma un punto al rol (n) que delata. */
window.BC_QUIZ = [
  {
    q: 'Viernes, 22:00. El grupo está muerto. Tú…',
    a: [
      { n: 1, t: 'Escribes «ya estoy llegando». Sigues en la ducha.' },
      { n: 2, t: 'Preguntas «¿y si vamos donde otro?»' },
      { n: 3, t: 'Dices «voy, pero ando corto de plata».' },
      { n: 4, t: 'Mandas «avísenme qué onda» y te quedas dormido.' },
      { n: 5, t: 'Propones «una y nos vamos». Nunca es una.' },
    ],
  },
  {
    q: 'Llega la cuenta. Tú…',
    a: [
      { n: 1, t: 'Ya te fuiste sin despedirte hace una hora.' },
      { n: 2, t: 'Explicas por qué en tu casa no se puede.' },
      { n: 3, t: 'Juras que mañana transfieres.' },
      { n: 4, t: 'Preguntas quién dividió esto, si tú no pediste papas.' },
      { n: 5, t: 'Pides otra ronda para toda la mesa.' },
    ],
  },
  {
    q: 'Tu frase más repetida:',
    a: [
      { n: 1, t: '«Voy en camino».' },
      { n: 2, t: '«Mi casa es muy chica».' },
      { n: 3, t: '«Después te paso».' },
      { n: 4, t: '«Vean ustedes».' },
      { n: 5, t: '«Mañana no tengo nada».' },
    ],
  },
  {
    q: '¿Cómo termina tu noche?',
    a: [
      { n: 1, t: 'Desaparecido. Apareces el lunes.' },
      { n: 2, t: 'Durmiendo en el sillón de alguien.' },
      { n: 3, t: 'Pidiendo prestado para el Uber.' },
      { n: 4, t: 'Preguntando «¿y ahora dónde vamos?»' },
      { n: 5, t: 'Viendo el amanecer con 2% de batería.' },
    ],
  },
];

/* Pendientes por defecto de la Polera Pendientes. */
window.BC_PENDIENTES = ['estudiar', 'dormir temprano', 'contestar mensajes'];

/* Catálogo.
   type: 'tee' (polera), 'hoodie' (polerón), 'pack', 'stickers'.
   front / back: lista de estampados [tipo, ...argumentos] que dibuja js/mockups.js.
   hidden: no aparece en la grilla de la colección (se vende desde otra sección). */
(function () {
  const P = window.BC_CONFIG.prices;
  const serie = (n, id, phrase, color, desc) => ({
    id, serie: n, name: 'Polera ' + phrase.charAt(0).toUpperCase() + phrase.slice(1),
    cat: 'polera', type: 'tee', color, line: 'Frases tachadas', price: P.polera, desc,
    phrase, front: [['line', phrase]], back: [['mono', 'nape']],
  });

  window.BC_PRODUCTS = [
    {
      id: 'polera-buena-junta', name: 'Polera Buena Junta', cat: 'polera', type: 'tee', color: 'crudo',
      line: 'Logo', price: P.polera,
      desc: 'La original. El monograma BC. en el pecho y la declaración completa en la espalda.',
      front: [['mono', 'chest']], back: [['stack', 'back']],
    },
    {
      id: 'polera-buena-junta-negra', name: 'Polera Buena Junta Negra', cat: 'polera', type: 'tee', color: 'negro',
      line: 'Logo', price: P.polera,
      desc: 'La misma idea dada vuelta: el logo grande adelante y el BC. en la nuca.',
      front: [['stack', 'frontBig']], back: [['mono', 'nape']],
    },
    serie('01', 'polera-me-porto-bien', 'me porto bien', 'crudo', 'Para la mamá que todavía cree. Frase tachada al frente, BC. en la nuca.'),
    serie('02', 'polera-buena-influencia', 'buena influencia', 'gris', 'Lo dijeron en el colegio. Se equivocaron.'),
    serie('03', 'polera-llego-temprano', 'llego temprano', 'negro', 'Temprano es antes de que se acabe el hielo.'),
    serie('04', 'polera-vuelvo-antes-de-las-12', 'vuelvo antes de las 12', 'negro', '¿De qué día? Nunca lo especificaste.'),
    serie('05', 'polera-hijo-modelo', 'hijo modelo', 'crudo', 'Modelo, sí. De lo que no hay que hacer.'),
    serie('06', 'polera-tranqui', 'tranqui', 'gris', 'Dijiste «tranqui» a las 22:00. Son las 5:40.'),
    {
      id: 'polera-pendientes', name: 'Polera Pendientes', cat: 'polera', type: 'tee', color: 'gris',
      line: 'Pendientes', price: P.polera, thumb: 'back',
      desc: 'Prioridades claras: todo tachado menos lo importante. Personaliza la lista en la sección Pendientes.',
      front: [['mono', 'chest']], back: [['checklist', window.BC_PENDIENTES]],
    },
    {
      id: 'polera-oveja-negra', name: 'Polera Oveja Negra', cat: 'polera', type: 'tee', color: 'crudo',
      line: 'Oveja negra', price: P.polera,
      desc: 'La mascota en el pecho. En la espalda, once ovejas blancas y una negra. Ya sabes cuál eres.',
      front: [['sheep']], back: [['grid']],
    },
    {
      id: 'polera-sello', name: 'Polera Sello', cat: 'polera', type: 'tee', color: 'crudo',
      line: 'Sello', price: P.polera,
      desc: 'El sello de la casa al frente: Bad Crowd ✦ Hecho en Chile ✦ Est. 2026.',
      front: [['seal']], back: [['mono', 'nape']],
    },
    {
      id: 'polera-stickers', name: 'Polera Stickers', cat: 'polera', type: 'tee', color: 'negro',
      line: 'Stickers', price: P.polera, thumb: 'back',
      desc: 'Todos los stickers de la junta pegados en la espalda, como el cuaderno del liceo.',
      front: [['mono', 'chest']], back: [['stickers']],
    },
    {
      id: 'polera-credencial', name: 'Polera Credencial', cat: 'polera', type: 'tee', color: 'negro',
      line: 'Credencial', price: P.polera, thumb: 'back',
      desc: 'Credencial oficial de miembro en la espalda. Válida hasta nunca. Ponle tu nombre en la sección Credencial.',
      front: [['mono', 'chest']], back: [['credential', '', '0001']],
    },
    {
      id: 'poleron-buena-junta', name: 'Polerón Buena Junta', cat: 'poleron', type: 'hoodie', color: 'negro',
      line: 'Logo', price: P.poleron,
      desc: 'BC. en el pecho, BAD CROWD. bajando por la manga y el logo completo en la espalda.',
      front: [['mono', 'chest'], ['sleeve']], back: [['stack', 'back']],
    },
    {
      id: 'poleron-oveja-negra', name: 'Polerón Oveja Negra', cat: 'poleron', type: 'hoodie', color: 'crudo',
      line: 'Oveja negra', price: P.poleron,
      desc: 'La oveja negra al centro del pecho y el rebaño completo en la espalda.',
      front: [['sheep']], back: [['grid']],
    },
    {
      id: 'poleron-stickers', name: 'Polerón Stickers', cat: 'poleron', type: 'hoodie', color: 'negro',
      line: 'Stickers', price: P.poleron, thumb: 'back',
      desc: 'Monograma adelante y la colección de stickers en la espalda.',
      front: [['mono', 'chest']], back: [['stickers']],
    },
    {
      id: 'poleron-me-quedo-en-la-casa', name: 'Polerón Me quedo en la casa', cat: 'poleron', type: 'hoodie', color: 'gris',
      line: 'Frases tachadas', price: P.poleron,
      desc: 'La frase tachada al frente y BAD CROWD. estampado en la capucha, para que lo lean cuando te vas.',
      front: [['line', 'me quedo en la casa']], back: [['hood']],
    },
    {
      id: 'pack-bad-crowd', name: 'Pack Bad Crowd', cat: 'pack', type: 'pack', color: 'negro',
      line: 'Pack x5', price: P.pack,
      desc: 'Cinco poleras negras numeradas del N° 01 al N° 05, una para cada personaje de la junta.',
    },
    {
      id: 'pack-stickers', name: 'Pack de Stickers', cat: 'sticker', type: 'stickers', color: null,
      line: '9 stickers', price: P.stickers, sizes: false,
      desc: 'Sello, monograma, cápsula, oveja negra, credencial de miembro y más. Nueve stickers troquelados.',
    },
    // Poleras sueltas del pack (se venden desde la sección Pack).
    ...window.BC_ROLES.map((r) => ({
      id: 'polera-pack-0' + r.n, name: 'Polera N° 0' + r.n, cat: 'pack', type: 'tee', color: 'negro', hidden: true,
      line: 'Pack Bad Crowd', price: P.polera, desc: r.desc, phrase: r.phrase,
      front: [['pack', r.phrase, r.n]], back: [['mono', 'nape']],
    })),
    // Prenda con frase propia (la arma el generador de la serie tachada).
    {
      id: 'tu-frase', name: 'Tu frase tachada', cat: 'polera', type: 'tee', color: 'negro', hidden: true,
      line: 'Personalizada', price: P.polera,
      desc: 'Tu propia frase, tachada en rosa, con BAD CROWD. debajo.',
      front: [['line', 'tu frase']], back: [['mono', 'nape']],
    },
  ];
})();
