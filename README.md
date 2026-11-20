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
| `CORREO_RSVP` | correo que recibe las confirmaciones                   |
| `ID_FORMULARIO_RSVP` | ID público de Web3Forms tras verificar la entrega |
| `IBAN`       | cuenta para el regalo                                     |
| `CANCION`    | ruta del mp3 de fondo (opcional)                          |
| `RESTRICCIONES`, `TALLAS` | opciones de los desplegables del formulario  |

## Confirmaciones por correo

Con `ID_FORMULARIO_RSVP` vacío, el formulario prepara un borrador para `CORREO_RSVP`.
Los invitados también pueden copiar las respuestas y enviarlas desde su correo web.
En ambos casos deben pulsar Enviar desde su correo.

Para habilitar el envío automático, crea un formulario en
[Web3Forms](https://app.web3forms.com/) con `CORREO_RSVP` como destinatario.
Comprueba con datos de prueba que el correo llega a ese buzón antes de publicar
el ID público del formulario en `ID_FORMULARIO_RSVP`. La web muestra el
agradecimiento cuando el servicio confirma la respuesta. Si la solicitud falla
o tarda más de 5 segundos, el invitado puede enviar sus respuestas desde su correo.

Para recuperar confirmaciones anteriores, [FormSend](https://formsend.co/anonymous)
indica que se pueden consultar en su panel al registrarse con `CORREO_RSVP`.

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
