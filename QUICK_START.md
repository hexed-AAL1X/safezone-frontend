# 🚀 GUÍA RÁPIDA - SAFEZONE

## ✅ TODO ESTÁ LISTO

Ya arreglé todos los problemas:
- ✅ Removí `expo-font` (causaba errores)
- ✅ Removí `expo-splash-screen` (no necesario)
- ✅ Limpié configuración de `app.json`
- ✅ Eliminé `versionCode` (usamos remote versioning)
- ✅ Simplifiqué plugins
- ✅ Limpiado caché de npm

---

## 🎯 CONSTRUIR LA APP

### Opción 1: APK para testing (RECOMENDADO PRIMERO)
```bash
./build-preview.sh
```
O manualmente:
```bash
eas build --platform android --profile preview --clear-cache
```

**Úsalo para**:
- Instalar en tu teléfono
- Tomar screenshots para Play Store
- Probar la app

---

### Opción 2: AAB para Play Store (PRODUCCIÓN)
```bash
./build-production.sh
```
O manualmente:
```bash
eas build --platform android --profile production --clear-cache
```

**Este es el archivo que subes a Play Store**

---

## ⚠️ IMPORTANTE

**Tienes builds en cola** porque hay límite de concurrencia.

### Ver tus builds:
https://expo.dev/accounts/hexed_aal1x/projects/safezone/builds

### Cancelar builds anteriores:
1. Ve al link de arriba
2. Cancela los builds fallidos o en cola
3. Ejecuta de nuevo el script

---

## 📱 DESPUÉS DEL BUILD

### 1. Descargar el archivo
Recibirás un enlace cuando termine (15-20 min)

### 2. Para APK (testing):
- Descarga el `.apk`
- Instala en tu teléfono Android
- Toma screenshots (mínimo 2)

### 3. Para AAB (producción):
- Descarga el `.aab`
- Sube a Google Play Console
- Sigue la guía en `DEPLOYMENT_GUIDE.md`

---

## 🔧 SI SIGUE FALLANDO

### Verificar que no hay builds en cola:
```bash
eas build:list
```

### Cancelar todos los builds:
```bash
eas build:cancel
```

### Reintentar:
```bash
npm cache clean --force
eas build --platform android --profile production --clear-cache
```

---

## 📋 ARCHIVOS IMPORTANTES

- `DEPLOYMENT_GUIDE.md` - Guía completa de publicación
- `PLAY_STORE_DESCRIPTION.md` - Descripciones para copiar
- `PRIVACY_POLICY.md` - Política de privacidad
- `README_DEPLOYMENT.md` - Resumen rápido

---

## 🎉 PRÓXIMOS PASOS

1. **Espera el build** (15-20 min)
2. **Descarga el archivo**
3. **Toma screenshots** (si es APK)
4. **Sube a Play Console** (si es AAB)
5. **Completa la ficha** (usa PLAY_STORE_DESCRIPTION.md)
6. **Publica** 🚀

---

## 💡 TIPS

- **Primera vez**: Construye APK primero para probar
- **Screenshots**: Necesitas mínimo 2 (1080x1920px)
- **Política**: Publica PRIVACY_POLICY.md en GitHub Pages
- **Cuenta**: Necesitas $25 USD para Play Console

---

**¡Todo está configurado! Solo ejecuta el script y espera. 🎊**
