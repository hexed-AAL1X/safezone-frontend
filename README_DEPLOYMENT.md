# 🎯 RESUMEN RÁPIDO - PUBLICAR EN PLAY STORE

## ⚡ COMANDOS PARA EJECUTAR (EN ORDEN)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login en Expo (crea cuenta gratis en expo.dev si no tienes)
eas login

# 3. Ir a tu proyecto
cd /home/aal1x/repo/safezone-frontend

# 4. Construir APK para testing (opcional - para probar en tu teléfono)
eas build --platform android --profile preview

# 5. Construir AAB para Play Store (ESTE ES EL IMPORTANTE)
eas build --platform android --profile production
```

⏱️ **Tiempo**: 15-20 minutos por build

📥 **Resultado**: Recibirás un enlace para descargar el archivo `.aab`

---

## 📋 LO QUE NECESITAS HACER EN PLAY CONSOLE

### 1. Crear cuenta ($25 USD)
- Ve a: https://play.google.com/console
- Paga la tarifa única
- Completa perfil

### 2. Crear aplicación
- Nombre: **SafeZone**
- Idioma: **Español (Latinoamérica)**
- Gratis

### 3. Copiar descripciones
Abre el archivo `PLAY_STORE_DESCRIPTION.md` y copia:
- ✅ Título
- ✅ Descripción corta
- ✅ Descripción completa
- ✅ Notas de versión

### 4. Capturas de pantalla (MÍNIMO 2)
- Instala el APK en tu teléfono
- Toma screenshots de:
  1. Pantalla de inicio con botón SOS
  2. Mapa con ubicaciones
- Tamaño: 1080x1920px

### 5. Política de privacidad
**Opción más fácil - GitHub Pages**:
1. Crea repo público en GitHub
2. Sube `PRIVACY_POLICY.md`
3. Activa GitHub Pages
4. Copia la URL y pégala en Play Console

### 6. Subir AAB
- Producción → Crear nueva versión
- Sube el `.aab` descargado
- Pega notas de versión

### 7. Enviar
- Completa clasificación de contenido
- Click "Enviar para revisión"
- ✅ ¡Listo!

---

## 📁 ARCHIVOS QUE CREÉ PARA TI

| Archivo | Para qué sirve |
|---------|----------------|
| `eas.json` | Configuración de build (ya está listo) |
| `PRIVACY_POLICY.md` | Política de privacidad completa |
| `PLAY_STORE_DESCRIPTION.md` | Todas las descripciones para copiar/pegar |
| `DEPLOYMENT_GUIDE.md` | Guía detallada paso a paso |
| `README_DEPLOYMENT.md` | Este resumen rápido |

---

## ⚠️ IMPORTANTE

1. **Necesitas un teléfono Android** para tomar screenshots
2. **La revisión toma 1-7 días** (primera vez puede ser más)
3. **Guarda el archivo `.aab`** por si necesitas subirlo de nuevo
4. **Incrementa `versionCode`** en `app.json` para cada actualización

---

## 🆘 SI ALGO FALLA

### Build falla:
```bash
npm cache clean --force
rm -rf node_modules
npm install
eas build --platform android --profile production
```

### No tienes keystore:
```bash
eas credentials
# Selecciona: Android → production → Set up new keystore
```

---

## ✅ CHECKLIST ANTES DE ENVIAR

- [ ] Ejecuté `eas build --platform android --profile production`
- [ ] Descargué el archivo `.aab`
- [ ] Creé cuenta en Play Console ($25)
- [ ] Copié descripciones de `PLAY_STORE_DESCRIPTION.md`
- [ ] Tomé mínimo 2 screenshots
- [ ] Publiqué política de privacidad (GitHub Pages)
- [ ] Subí el `.aab` a Play Console
- [ ] Completé clasificación de contenido
- [ ] Envié para revisión

---

## 🎉 DESPUÉS DE APROBAR

Tu app estará en:
```
https://play.google.com/store/apps/details?id=com.safezone.app
```

---

**¿Dudas? Lee `DEPLOYMENT_GUIDE.md` para más detalles**

**¡Éxito con tu lanzamiento! 🚀**
