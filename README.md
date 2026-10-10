# BAD CROWD.

~~buena junta~~ · Ropa para la junta que nunca fue buena influencia. Hecho en Chile, est. 2026.

Sitio estático de la marca, construido a partir de la lámina de identidad (`Logos de marca`): paleta, tipografías, logos, poleras, polerones, pack, stickers, credencial y la oveja negra.

## Qué tiene

| Sección | Qué hace |
| --- | --- |
| **Hero** | Logo principal con la frase tachada que va cambiando (*buena junta*, *me porto bien*, *llego temprano*…). |
| **Manifiesto** | Qué es Bad Crowd y las reglas de la junta. |
| **Colección** | 19 productos con mockups vectoriales de frente y espalda, filtros por tipo y color, y vista rápida con talla y cantidad. |
| **La serie tachada** | Las 6 poleras de frases + generador «Tacha tu propia frase» (polera o polerón, crudo, gris o negro). |
| **Pack Bad Crowd** | Las 5 poleras numeradas (N° 01 al N° 05) + test «¿Qué no eres en la junta?». |
| **Pendientes** | Lista interactiva: lo que agregas se tacha y aparece en la espalda de la polera. |
| **La oveja negra** | Rebaño de 12 ovejas: tócalas y se vuelven negras. |
| **Credencial** | Generador de credencial de miembro (nombre, número, encabezado), descargable en PNG o estampada en polera. |
| **Stickers** | Mesa con los 9 stickers arrastrables (mouse, touch o flechas del teclado). |
| **La marca** | Los 6 logos, paleta (clic para copiar), tipografía y reglas de uso. |
| **Tallas y pedidos** | Cómo comprar, guía de tallas y cuidados. |
| **Preguntas** | FAQ. |
| **Bolsa** | Carrito guardado en el navegador; el pedido se envía por WhatsApp o se copia como texto. |

## Estructura

```
index.html        Página
css/styles.css    Estilos (tokens de marca al inicio)
js/data.js        Precios, WhatsApp, productos, roles del pack y test
js/mockups.js     Dibujo SVG de poleras, polerones, sello, stickers y credencial
js/main.js        Interacción (colección, bolsa, generadores, juegos)
```

No usa frameworks ni build: solo HTML, CSS y JavaScript.

## Antes de publicar

Todo se edita en `js/data.js`:

- **`whatsapp`**: número con código de país, sin `+` ni espacios (ej. `56912345678`). Si queda vacío, WhatsApp pregunta a qué contacto enviar el pedido.
- **`instagram`**: link a la cuenta. Si queda vacío, no aparece en el footer.
- **`prices`**: los precios actuales son de ejemplo. Ajústalos (polera, polerón, pack y stickers).
- **Productos**: cada producto define su color y sus estampados de frente y espalda (`front` / `back`).

La guía de tallas (`index.html`, sección *Tallas y pedidos*) también tiene medidas de referencia: cámbialas por las de tu proveedor.

## Verlo en local

Abre `index.html` en el navegador, o levanta un servidor:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Publicarlo

Al ser un sitio estático funciona en GitHub Pages, Netlify o Vercel sin configuración: en GitHub, *Settings → Pages → Deploy from a branch* y elige la rama y la carpeta raíz.

## Identidad

| Token | Color | Uso |
| --- | --- | --- |
| Crudo | `#F4F2EE` | Fondos y prendas claras |
| Rosa | `#E0245E` | El punto y el tachado |
| Negro | `#111111` | Logo, texto y prendas |

Tipografías: **Archivo Black** (logo, titulares, precios) y **Space Grotesk** (textos y frases tachadas), más Space Mono para etiquetas.
