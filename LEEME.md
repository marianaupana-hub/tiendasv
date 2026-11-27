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
Las reglas de Firestore se mantienen en `firestore.rules` y se publican junto con
`firebase.json`.

La propietaria y Angie pueden administrar por separado los permisos de cada cuenta
desde **Equipo y permisos**. Las secciones se mantienen visibles para el personal;
las que no tengan permiso aparecen deshabilitadas. Se pueden autorizar Dashboard,
Punto de Venta, pedidos propios, entradas de stock, Reportes, Finanzas, Productos,
Categorías, Clientes y Sucursales. **Equipo y permisos**, exportaciones, retiros,
cierre de caja y cobro de deudas siguen reservados para administración.
El historial muestra y permite filtrar las ventas por quien inició sesión al
registrarlas; solo la propietaria y Angie pueden borrar ventas, no el personal.

Los permisos de Productos y Reportes incluyen acceso a los costos de compra; Finanzas
incluye datos de ventas y caja; Dashboard muestra resumen de ventas y caja; Clientes
incluye sus nombres y teléfonos. Habilítalos solo para cuentas de confianza. Punto
de Venta y Entradas de stock usan un catálogo sin costo de compra. Las reglas de
Firestore aplican los permisos también a los datos, no solo al menú.

### Avisos de ventas por correo
Las ventas nuevas se envían a Angie desde una función privada de Firebase. El aviso
incluye número, fecha, sucursal, forma de pago, total y productos; no incluye nombre
ni teléfono del cliente. No se envían avisos retroactivos de ventas anteriores.

Para activar el envío, habilita el plan Blaze de Firebase y configura un proveedor
SMTP (por ejemplo, Gmail con contraseña de aplicación o un proveedor de correo).
No uses la contraseña normal de Gmail ni guardes secretos en Git. Desde la carpeta
del proyecto, crea estos secretos; Firebase CLI solicitará cada valor:

```sh
firebase functions:secrets:set SMTP_HOST --project tienda-3d54d
firebase functions:secrets:set SMTP_PORT --project tienda-3d54d
firebase functions:secrets:set SMTP_USER --project tienda-3d54d
firebase functions:secrets:set SMTP_PASSWORD --project tienda-3d54d
firebase functions:secrets:set SALES_NOTIFICATION_TO --project tienda-3d54d
```

Para Gmail normalmente se usa `smtp.gmail.com`, puerto `465` o `587`, el correo
emisor y una contraseña de aplicación. Para el último secreto, usa el correo de Angie
que recibirá los avisos. Después publica las reglas y la función:

```sh
firebase deploy --only firestore:rules,functions --project tienda-3d54d
```

## Datos
Se guardan en el navegador y se sincronizan con Firebase al iniciar sesión. Respalda
con los botones CSV del Historial.

En Reportes puedes consultar las unidades y ventas de hoy, los últimos 7 días o 30
días, además del valor estimado del inventario actual a costo y a precio de venta.
El costo se calcula con el costo registrado por producto y las existencias actuales;
no representa un historial de los pagos reales de cada compra.

En Punto de Venta puedes cobrar una venta con un solo método o elegir **Pago mixto**
y repartir el total entre efectivo, transferencia, tarjeta y/o crédito. El sistema
valida que la suma coincida con el total, registra en caja solo la parte en efectivo
y deja como deuda únicamente la parte a crédito. Los métodos y sus importes aparecen
en tickets, facturas, WhatsApp, historial y reportes. Está disponible para toda cuenta
con permiso de Punto de Venta, incluido el personal de Interfer.
