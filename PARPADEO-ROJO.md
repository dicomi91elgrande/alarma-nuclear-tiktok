# Parpadeo rojo con Interactive

## Render (uso habitual)

Servicio: https://parpadeo-rojo-tiktok.onrender.com

Usa el enlace privado del overlay facilitado en el chat (`/overlay?key=...`) como fuente de navegador de 1080 × 1920. La clave se guarda en `OVERLAY_TOKEN` en Render y nunca en Git. Interactive envía POST a `/interactive/gift?key=...` con `{"coins":"{coins}","countMode":"unit"}`. No necesita enviar nombres ni fotos.

Abre TikTok Studio y conecta Interactive con el perfil donde está la acción. No necesitas iniciar ningún servidor local. La primera carga del plan gratuito puede tardar alrededor de un minuto; después la fuente comprueba el servicio cada 60 segundos mientras permanece abierta. El servicio también reconecta automáticamente si pierde la conexión.

## Alternativa local

1. Abre `INICIAR-PARPADEO.cmd`. Requiere Node.js (ya instalado en este equipo).
2. El panel se abre en http://127.0.0.1:3191 y permite probarlo.
3. Añade una fuente de navegador con http://127.0.0.1:3191/overlay y tamaño **1080 × 1920** encima del resto de fuentes.
4. Si necesitas chroma, usa http://127.0.0.1:3191/overlay?chroma=1 y elimina el verde #00ff00. Este modo alterna rojo sólido y verde; el modo transparente usa rojo al 65%.

## Interactive

Mismo sistema de webhooks que los proyectos «overlay geoguess» y «widget oraculo tren». En el evento Gift añade una acción HTTP:

- Método: POST
- URL: http://127.0.0.1:3191/interactive/gift
- Content-Type: application/json
- Body:

```json
{"username":"{username}","coins":"{coins}","countMode":"unit"}
```

Configura una ejecución por unidad de regalo (repetición por regalo activada, cantidad 1). `{coins}` representa el valor de una unidad, como en la integración anterior. **1000 monedas o más activa el efecto; 999 no.** No acumula regalos pequeños ni suma entre usuarios.

El parpadeo dura 5 segundos, con un pulso cada 1,25 segundos. Otro regalo válido prolonga el efecto hasta 5 segundos después del último evento. Al terminar vuelve a transparente. No lleva sonido ni texto.

Para contar el total de un combo, usa `"countMode":"combo","repeatCount":"{repeatcount}"` en el body y configura Interactive para ejecutar solo al finalizar el combo. No envíes totales acumulados en cada actualización. Opcionalmente se acepta `eventId` para descartar repeticiones del mismo evento durante 10 minutos; sin ID cada webhook se considera una entrega nueva.

El servidor funciona en este ordenador y debe permanecer activo. No necesita Render ni instalar paquetes. Los overlays anteriores conservan sus URLs. Para detenerlo, termina el proceso Node correspondiente a `red-flash-server.mjs`, o reinicia el equipo.

Comprobación automática: `node --test red-flash.test.mjs`.
