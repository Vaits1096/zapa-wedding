# Pablo & Adri — 15 de mayo de 2026

Invitación de boda. Una sola página, sin dependencias ni build: se abre
`invitacion.html` en cualquier navegador y funciona.

## Cómo se usa

Abre `invitacion.html`. Sale un sobre; al hacer clic se abre y da paso a la
invitación. El scroll está bloqueado hasta entonces.

### Enlace personalizado por invitado

Añade `?n=` con el nombre y aparecerá en la pantalla del sobre, además de
rellenarse solo en el formulario de confirmación:

```
invitacion.html?n=Ana%20María%20López
```

## Qué hay que editar

Todo lo configurable está junto, al principio del `<script>` del final de
`invitacion.html`:

| constante    | qué es                                                   |
|--------------|----------------------------------------------------------|
| `FECHA_BODA` | fecha y hora de la boda. De aquí salen la cuenta atrás, la portada y el cierre |
| `TEL_PABLO`  | móvil que recibe las confirmaciones por WhatsApp          |
| `IBAN`       | cuenta para el regalo                                     |
| `CANCION`    | ruta del mp3 de fondo (opcional)                          |

## Estructura

```
invitacion.html     la página entera: estructura, estilos y lógica
fotos/              pedida.jpg  campo.jpg  muro.jpg  noche.jpg
assets/             piezas del sobre: lacre, texturas de papel y sombras
musica/             cancion.mp3 (opcional, no versionado)
```

Si no existe `musica/cancion.mp3`, el botón de música no aparece. Si falta
alguna foto, su hueco muestra un marco rayado con el nombre del archivo que
falta en vez de romperse.

## Tipografías

Bodoni Moda para los títulos, Inria Serif para el texto y Allura para la
caligrafía. Las tres se cargan desde Google Fonts.
