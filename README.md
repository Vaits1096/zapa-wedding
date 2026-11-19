# Adriana & Pablo — 15 de mayo de 2027

Invitación de boda. Una sola página, sin dependencias ni build: se abre
`index.html` en cualquier navegador y funciona.

## Cómo se usa

Abre `index.html`. Sale un sobre; al hacer clic se abre y da paso a la
invitación. El scroll está bloqueado hasta entonces.

### Enlace personalizado por invitado

Añade `?n=` con el nombre y aparecerá en la pantalla del sobre, además de
rellenarse solo en el formulario de confirmación:

```
index.html?n=Ana%20María%20López
```

## Qué hay que editar

Todo lo configurable está junto, al principio del `<script>` del final de
`index.html`:

| constante    | qué es                                                   |
|--------------|----------------------------------------------------------|
| `FECHA_BODA` | fecha y hora de la boda. De aquí salen la cuenta atrás, la portada y el cierre |
| `CORREO_RSVP` | correo que recibe las confirmaciones (vía FormSend)     |
| `IBAN`       | cuenta para el regalo                                     |
| `CANCION`    | ruta del mp3 de fondo (opcional)                          |
| `RESTRICCIONES`, `TALLAS` | opciones de los desplegables del formulario  |

## Confirmaciones por correo

El formulario manda cada respuesta a `CORREO_RSVP` mediante el modo anónimo
de [FormSend](https://formsend.co/docs). Este modo admite envíos desde el
primero sin crear una cuenta ni activar el buzón. El plan gratuito incluye
250 envíos al mes. FormSend guarda las respuestas y pone los correos en cola,
así que la notificación puede llegar unos minutos después de confirmar en la web.

El formulario espera hasta 5 segundos y solo muestra «Hemos recibido tu
confirmación» cuando FormSend acepta la respuesta y pone el correo en cola. Si falla
o se agota la espera, conserva las respuestas y ofrece abrir un borrador
dirigido a `CORREO_RSVP` o copiar los datos para enviarlos desde el correo web.
El invitado pulsa Enviar en su propio correo. El formulario no reintenta el
envío automáticamente.

Para comprobar las regresiones del envío sin mandar correos reales:

```sh
node --test tests/rsvp.test.cjs
```

## Estructura

```
index.html     la página entera: estructura, estilos y lógica
fotos/              pedida.jpg  muro.jpg  calle.jpg  campo.jpg  sagrada.jpg
                    noche.jpg  rojo.jpg  jardin.jpg  logrono.jpg
assets/             piezas del sobre: lacre, texturas de papel y sombras
musica/             cancion.mp3 (opcional, no versionado)
```

Si no existe `musica/cancion.mp3`, el botón de música no aparece. Si falta
alguna foto, su hueco muestra un marco rayado con el nombre del archivo que
falta en vez de romperse.

## Tipografías

Bodoni Moda para los títulos, Inria Serif para el texto y Allura para la
caligrafía. Las tres se cargan desde Google Fonts.
