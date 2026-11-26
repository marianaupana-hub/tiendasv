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

## Datos
Se guardan en el navegador de cada dispositivo. Respalda con los botones CSV del Historial.
