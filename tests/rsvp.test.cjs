const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const { join } = require('node:path');

const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
const source = html.slice(html.indexOf('function avisar('), html.indexOf('async function alPortapapeles('));
const flush = () => new Promise(setImmediate);

// Run the real submit handler with a controlled network and clock: no emails.
function formulario({ delay = 0, bodyDelay = 0, status = 200, response = { success: true }, failure, online = true } = {}) {
  let now = 0;
  let nextTimer = 0;
  let submit;
  const timers = new Map();
  const requests = [];
  const radios = { acompanante: 'Sí', bus_ida: 'Sí', bus_celebracion: 'No', bus_logrono: '22:00', bus_elciego: '01:00' };
  const fields = new Map();
  for (const [selector, value] of Object.entries({
    '#f-nombre': '  María Muñoz  ', '#f-nombre2': 'José García',
    '#f-talla': '38', '#f-talla2': '40', '#rsvp [name=_honey]': '',
    '#dieta-otro': '', '#dieta2-otro': '',
  })) fields.set(selector, { value });
  for (const selector of ['#rsvp', '#enviar', '#aviso-rsvp', '#gracias']) {
    fields.set(selector, {
      hidden: selector === '#gracias', disabled: false, textContent: '', attributes: {},
      focus() { this.focused = true; },
      setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
      addEventListener(event, handler) { if (event === 'submit') submit = handler; },
    });
  }
  const schedule = (callback, ms) => {
    const id = ++nextTimer;
    timers.set(id, { at: now + ms, callback });
    return id;
  };
  const context = {
    $: (selector) => fields.get(selector),
    valorRadio: (name) => radios[name] || '',
    restricciones: (name) => name === 'dieta' ? 'Celiaquía / Gluten' : 'Lactosa',
    navigator: { onLine: online }, CORREO_RSVP: 'test@example.invalid',
    document: { querySelector: () => ({ focus() {} }) },
    URLSearchParams, AbortController,
    setTimeout: schedule, clearTimeout: (id) => timers.delete(id),
    fetch(url, options) {
      requests.push({ url, ...options });
      return new Promise((resolve, reject) => {
        const abort = () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        };
        options.signal.addEventListener('abort', abort, { once: true });
        schedule(() => {
          if (failure === 'network') return reject(new TypeError('Failed to fetch'));
          resolve({
            ok: status >= 200 && status < 300,
            json: () => new Promise((resolveBody, rejectBody) => {
              options.signal.addEventListener('abort', () => {
                const error = new Error('Aborted');
                error.name = 'AbortError';
                rejectBody(error);
              }, { once: true });
              schedule(() => failure === 'json'
                ? rejectBody(new SyntaxError('Invalid JSON')) : resolveBody(response), bodyDelay);
            }),
          });
        }, delay);
      });
    },
  };
  vm.runInNewContext(source, context);
  return {
    fields, radios, requests, timers,
    submit: () => submit({ preventDefault() {} }),
    async advance(ms) {
      const target = now + ms;
      while (true) {
        const pending = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (!pending || pending[1].at > target) break;
        now = pending[1].at;
        timers.delete(pending[0]);
        pending[1].callback();
        await flush();
      }
      now = target;
      await flush();
    },
  };
}

test('a response after the old 20-second deadline still confirms, without resending', async () => {
  const f = formulario({ delay: 45000 });
  const pending = f.submit();
  await f.advance(21000);
  assert.equal(f.fields.get('#enviar').disabled, true);
  assert.equal(f.requests[0].signal.aborted, false);
  await f.submit();
  assert.equal(f.requests.length, 1);
  await f.advance(9000);
  assert.match(f.fields.get('#aviso-rsvp').textContent, /Seguimos esperando/);
  await f.advance(15000);
  await pending;
  assert.equal(f.fields.get('#rsvp').hidden, true);
  assert.equal(f.fields.get('#gracias').hidden, false);
  assert.match(f.fields.get('#gracias').textContent, /¡Gracias, María!/);
  assert.equal(f.fields.get('#gracias').focused, true);
  assert.equal(f.timers.size, 0);
  await f.submit();
  assert.equal(f.requests.length, 1);
});

test('encodes accents, companion, dietary requirements and every bus choice', async () => {
  const f = formulario({ response: { success: 'true' } });
  const pending = f.submit();
  const request = f.requests[0];
  assert.equal(request.method, 'POST');
  assert.equal(Object.keys(request.headers).join(), 'Accept');
  assert.ok(request.body instanceof URLSearchParams);
  const data = Object.fromEntries(new URLSearchParams(request.body.toString()));
  assert.equal(data.Nombre, 'María Muñoz');
  assert.equal(data.Acompañante, 'José García');
  assert.equal(data['Restricciones alimenticias'], 'Celiaquía / Gluten');
  assert.equal(data['Restricciones del acompañante'], 'Lactosa');
  assert.equal(data['Bus Elciego a la ceremonia'], 'Sí');
  assert.equal(data['Bus ceremonia a la celebración'], 'No');
  assert.equal(data['Bus regreso a Logroño'], '22:00');
  assert.equal(data['Bus regreso a Elciego'], '01:00');
  await f.advance(0);
  await pending;
  assert.equal(f.fields.get('#gracias').hidden, false);
});

test('waits for the response body as well as the HTTP headers', async () => {
  const f = formulario({ bodyDelay: 35000 });
  const pending = f.submit();
  await f.advance(21000);
  assert.equal(f.fields.get('#gracias').hidden, true);
  assert.equal(f.requests[0].signal.aborted, false);
  await f.advance(14000);
  await pending;
  assert.equal(f.fields.get('#gracias').hidden, false);
});

test('a hung request stops after two minutes, preserves values and never retries automatically', async () => {
  const f = formulario({ delay: 180000 });
  const pending = f.submit();
  await f.advance(120000);
  await pending;
  assert.equal(f.requests[0].signal.aborted, true);
  assert.equal(f.requests.length, 1);
  assert.equal(f.fields.get('#rsvp').hidden, false);
  assert.equal(f.fields.get('#gracias').hidden, true);
  assert.equal(f.fields.get('#enviar').disabled, false);
  assert.equal(f.fields.get('#enviar').textContent, 'Volver a enviar');
  assert.equal(f.fields.get('#f-nombre2').value, 'José García');
  assert.match(f.fields.get('#aviso-rsvp').textContent, /Antes de reenviarlo, contacta/);
  assert.equal(f.fields.get('#enviar').attributes['aria-busy'], undefined);
  await f.advance(60000);
  assert.equal(f.fields.get('#gracias').hidden, true);
});

test('the deadline also stops a response body that never finishes', async () => {
  const f = formulario({ bodyDelay: 180000 });
  const pending = f.submit();
  await f.advance(120000);
  await pending;
  assert.equal(f.requests[0].signal.aborted, true);
  assert.equal(f.fields.get('#enviar').disabled, false);
  assert.equal(f.fields.get('#gracias').hidden, true);
});

for (const [label, options] of [
  ['network failure', { failure: 'network' }],
  ['invalid JSON', { failure: 'json' }],
  ['HTTP error', { status: 503 }],
  ['service rejection', { response: { success: false } }],
  ['missing acknowledgement', { response: {} }],
  ['null response', { response: null }],
]) {
  test(`${label} never displays a false success and allows an explicit retry`, async () => {
    const f = formulario(options);
    const pending = f.submit();
    await f.advance(0);
    await pending;
    assert.equal(f.fields.get('#gracias').hidden, true);
    assert.equal(f.fields.get('#rsvp').hidden, false);
    assert.equal(f.fields.get('#enviar').disabled, false);
    assert.equal(f.timers.size, 0);
    assert.match(f.fields.get('#aviso-rsvp').textContent, /No hemos podido comprobar/);
    const retry = f.submit();
    assert.equal(f.requests.length, 2);
    await f.advance(0);
    await retry;
  });
}

test('offline submission does not send a request or lock the form', async () => {
  const f = formulario({ online: false });
  await f.submit();
  assert.equal(f.requests.length, 0);
  assert.equal(f.fields.get('#enviar').disabled, false);
  assert.match(f.fields.get('#aviso-rsvp').textContent, /no tienes conexión/);
});

test('required name and companion are validated before a request is sent', async () => {
  const f = formulario();
  f.fields.get('#f-nombre').value = '  ';
  f.fields.get('#f-nombre').focus = () => {};
  await f.submit();
  assert.match(f.fields.get('#aviso-rsvp').textContent, /Escribe tu nombre/);
  f.fields.get('#f-nombre').value = 'María';
  f.fields.get('#f-nombre2').value = '';
  f.fields.get('#f-nombre2').focus = () => {};
  await f.submit();
  assert.match(f.fields.get('#aviso-rsvp').textContent, /cómo se llama tu acompañante/);
  assert.equal(f.requests.length, 0);
});

test('without companion, stale companion fields are excluded and buses remain optional', async () => {
  const f = formulario();
  f.radios.acompanante = 'No';
  f.radios.bus_ida = '';
  const pending = f.submit();
  const data = Object.fromEntries(f.requests[0].body);
  assert.equal(data.Acompañante, '—');
  assert.equal(data['Restricciones del acompañante'], '—');
  assert.equal(data['Talla de calzado del acompañante'], '—');
  assert.equal(data['Bus Elciego a la ceremonia'], 'Sin responder');
  await f.advance(0);
  await pending;
});
