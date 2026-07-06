# Overlay de alarma nuclear para TikTok

Este proyecto contiene un overlay transparente para OBS, TikTok Live Studio o cualquier software que acepte una fuente de navegador.

## Archivo principal

Usa:

```text
nuclear-alarm-overlay.html
```

Como TikTok Studio no respeta transparencia, usa el modo chroma:

```text
nuclear-alarm-overlay.html?demo=1&chroma=1
```

En TikTok Studio anadelo como fuente de navegador local o captura de ventana, usa resolucion 1920x1080 y aplica Chroma Key al color verde.

Consejo para TikTok Studio: si aparecen bordes verdosos, baja el suavizado/spill removal del Chroma Key. Este overlay usa rojo puro sobre verde puro en modo `chroma=1`; demasiado suavizado puede contaminar los bordes rojos.

## Parametros

- `min=500`: monedas minimas para disparar la alarma.
- `duration=9000`: duracion de la alarma en milisegundos.
- `demo=1`: muestra un boton de prueba y dispara la alarma al abrir.
- `chroma=1`: pone fondo verde puro y usa un patron rojo preparado para chroma key.

Ejemplo:

```text
nuclear-alarm-overlay.html?min=500&duration=10000&demo=1
```

Ejemplo recomendado para TikTok Studio:

```text
nuclear-alarm-overlay.html?min=500&duration=9000&chroma=1
```

## Como dispararla desde otra herramienta

El overlay expone esta funcion:

```js
window.triggerNuclearAlarm({ user: "Usuario", coins: 500 });
```

Tambien escucha mensajes tipo `postMessage`:

```js
window.postMessage({
  type: "gift",
  user: "Usuario",
  coins: 500
}, "*");
```

Y eventos personalizados:

```js
window.dispatchEvent(new CustomEvent("gift", {
  detail: { user: "Usuario", coins: 500 }
}));
```

Cuando me digas que herramienta usas para leer regalos de TikTok (TikFinity, Streamer.bot, TikTok Live Studio, OBS plugin, etc.), puedo conectarlo directamente al evento real de regalos de 500 monedas o mas.

## Subirlo a GitHub y Render

Como TikTok Studio no abre archivos locales, sube estos archivos a un repo de GitHub:

```text
index.html
nuclear-alarm-overlay.html
OVERLAY-TIKTOK-STUDIO.html
PROBAR-OVERLAY-CROMA.html
render.yaml
README.md
```

En Render:

1. Crea un servicio nuevo.
2. Elige Static Site.
3. Conecta el repo de GitHub.
4. Build Command: dejalo vacio.
5. Publish Directory: `.`
6. Despliega.

La URL principal de Render abrira automaticamente el overlay en modo TikTok Studio:

```text
https://tu-servicio.onrender.com/
```

Para probar con boton y disparo automatico:

```text
https://tu-servicio.onrender.com/nuclear-alarm-overlay.html?demo=1&chroma=1
```
