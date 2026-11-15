# Tareas Firestore

App web CRUD de tareas que usa **Cloud Firestore** (base de datos NoSQL documental) y se despliega
automáticamente en **Firebase Hosting** con **GitHub Actions**.

- App en producción: https://tareas-firestore-37781.web.app
- Base de datos: Cloud Firestore, edición Standard, modo nativo

## Cómo funciona

| Parte | Archivo |
|---|---|
| Interfaz | `public/index.html`, `public/styles.css` |
| Lógica CRUD y lectura en tiempo real | `public/app.js` |
| Configuración del proyecto Firebase | `public/firebase-config.js` |
| Reglas de seguridad de Firestore | `firestore.rules` |
| Configuración de Hosting | `firebase.json`, `.firebaserc` |
| Despliegue automático | `.github/workflows/deploy.yml` |

Cada tarea es un documento de la colección `tareas`:

```json
{ "titulo": "Estudiar NoSQL", "completada": false, "creadaEn": "<timestamp del servidor>" }
```

La app no tiene servidor propio: el navegador habla directo con Firestore mediante el SDK web,
y `onSnapshot` mantiene la lista sincronizada en tiempo real entre todos los clientes.

## Despliegue automático

Cada `push` a `main` ejecuta el workflow `deploy.yml`, que publica la carpeta `public/` en
Firebase Hosting usando la cuenta de servicio guardada en el secreto `FIREBASE_SERVICE_ACCOUNT`.

## Ejecutar en local

```bash
npx serve public
```

## Seguridad

Es una app de demostración sin inicio de sesión: cualquiera puede leer y escribir en la colección
`tareas`. Las reglas solo validan la forma de cada documento. Para un uso real habría que agregar
Firebase Authentication y limitar cada tarea a su dueño.
