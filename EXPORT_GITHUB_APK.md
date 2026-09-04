# Guía para Exportar a GitHub y Obtener el APK de Master Movie

Esta aplicación ya viene completamente configurada con **Capacitor** y un flujo automatizado de **GitHub Actions** (`.github/workflows/build-apk.yml`) para compilar tu archivo **APK instalable para teléfonos Android** automáticamente.

---

## Método 1: Compilación Automática en GitHub (Recomendado y sin instalar nada)

1. **Exportar a GitHub**:
   - En Google AI Studio, abre el menú de configuración (arriba a la derecha) y selecciona **Export to GitHub** (o descarga el ZIP y súbelo a un repositorio de tu cuenta de GitHub).
2. **Compilación automática**:
   - Al subir los archivos a la rama `main` o `master`, el archivo `.github/workflows/build-apk.yml` se ejecutará automáticamente en los servidores de GitHub.
3. **Descargar tu APK**:
   - Ve a la pestaña **Actions** en tu repositorio de GitHub.
   - Haz clic en la última ejecución de "Compilar APK Master Movie".
   - En la sección **Artifacts** (Artefactos), descarga el archivo `Master-Movie-Android.apk`.
   - ¡Transfiérelo a tu teléfono Android e instálalo!

---

## Método 2: Compilación Local en tu Computadora (Android Studio)

Si prefieres compilarlo en tu propia computadora:

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar la aplicación web
npm run build

# 3. Instalar Capacitor Android
npm install @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android

# 4. Abrir en Android Studio
npx cap open android
```

En Android Studio:
- Ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- El archivo `.apk` se generará en `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Configuración de Red para zonacero.lat:8080 en Android

Dado que `http://zonacero.lat:8080` usa HTTP, el archivo `AndroidManifest.xml` ya está configurado con:
```xml
<application
    android:usesCleartextTraffic="true"
    ... >
```
Esto permite que Android reproduzca las películas y series sin bloqueos de seguridad de red.
