# Seven Roses
Punto de venta, inventario y tickets para tienda (celular y computadora).

## Ejecutar en tu computadora
`node server.js` y abre http://localhost:3000 (la página está en la carpeta `docs`).

## Publicar en GitHub Pages (HTTPS, necesario para la cámara del iPhone)
Desde la carpeta del proyecto, sube el código al repositorio:

```sh
git init
git branch -M main
git remote add origin https://github.com/marianaupana-hub/tiendasv.git
git add .
git commit -m "Publicar Seven Roses"
git push -u origin main
```

En GitHub, abre Settings > Pages y selecciona la rama `main` y la carpeta `/docs`.
La página estará en https://marianaupana-hub.github.io/tiendasv/

## Firebase
La app inicia sesión con Google y valida el rol en `admins/{uid}`. En Firebase
Console, habilita Google en Authentication > Sign-in method y agrega
`marianaupana-hub.github.io` en Authentication > Settings > Authorized domains.

Los datos compartidos de Seven Roses se guardan en
`facturasUsers/CebhzopoNTX70krUuVqv7aELAew2/records/sevenroses_v1_*`; la app conserva
los demás registros. Las reglas permiten al propietario acceder a sus registros y
al UID autorizado `bl2RfPTMp5h7opLSoPQh5MgdpM72` compartirlos con rol `manager`.

## Datos
Se guardan en el navegador y se sincronizan con Firebase al iniciar sesión. Respalda
con los botones CSV del Historial.
