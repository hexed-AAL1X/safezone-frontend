# 🚀 GUÍA DE DESPLIEGUE - SAFEZONE

## ✅ TODO ESTÁ CONFIGURADO

Ya he preparado todo para ti. Solo sigue estos pasos:

---

## PASO 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

---

## PASO 2: Iniciar sesión en Expo

```bash
eas login
```

Si no tienes cuenta:
1. Ve a https://expo.dev
2. Crea una cuenta gratis
3. Vuelve a ejecutar `eas login`

---

## PASO 3: Construir la aplicación

### Para testing (APK - puedes instalarlo en tu teléfono):
```bash
cd /home/aal1x/repo/safezone-frontend
eas build --platform android --profile preview
```

### Para Play Store (AAB - archivo oficial):
```bash
cd /home/aal1x/repo/safezone-frontend
eas build --platform android --profile production
```

⏱️ **Tiempo estimado**: 15-20 minutos

📥 Al terminar, recibirás un enlace para descargar el archivo.

---

## PASO 4: Crear cuenta en Google Play Console

1. Ve a: https://play.google.com/console
2. Paga la tarifa única de **$25 USD**
3. Completa tu perfil de desarrollador

---

## PASO 5: Crear la aplicación

1. Click en **"Crear aplicación"**
2. Completa:
   - **Nombre**: SafeZone
   - **Idioma**: Español (Latinoamérica)
   - **Tipo**: Aplicación
   - **Gratis o de pago**: Gratis

---

## PASO 6: Completar información de la app

### 6.1 Ficha de Play Store

Copia y pega desde el archivo `PLAY_STORE_DESCRIPTION.md`:

- **Título**: SafeZone - Seguridad Personal
- **Descripción corta**: (80 caracteres)
- **Descripción completa**: (toda la descripción del archivo)

### 6.2 Capturas de pantalla

**NECESITAS MÍNIMO 2 CAPTURAS** (puedes tomar desde tu teléfono):

1. Pantalla de inicio con botón SOS
2. Mapa con ubicaciones
3. Lista de contactos (opcional)
4. Comunidad (opcional)

**Tamaño**: 1080x1920px (vertical)

**Cómo tomarlas**:
1. Instala el APK en tu teléfono
2. Toma screenshots
3. Súbelas a Play Console

### 6.3 Ícono de la aplicación

**Necesitas**: 512x512px PNG

Usa el archivo `assets/images/icon.png` (redimensiónalo a 512x512)

### 6.4 Gráfico de funciones (Feature Graphic)

**Necesitas**: 1024x500px

Puedes crear uno simple con:
- Fondo negro
- Logo de SafeZone
- Texto: "Tu seguridad personal 24/7"

---

## PASO 7: Política de privacidad

**Opción 1 - GitHub Pages (GRATIS)**:

1. Crea un repositorio público en GitHub
2. Sube el archivo `PRIVACY_POLICY.md`
3. Activa GitHub Pages en Settings
4. Usa la URL generada

**Opción 2 - Google Sites (GRATIS)**:

1. Ve a https://sites.google.com
2. Crea un sitio nuevo
3. Copia y pega el contenido de `PRIVACY_POLICY.md`
4. Publica y copia la URL

**Pega esta URL en Play Console** → Política de privacidad

---

## PASO 8: Clasificación de contenido

1. Ve a **"Clasificación de contenido"**
2. Completa el cuestionario:
   - ¿Violencia? **No**
   - ¿Contenido sexual? **No**
   - ¿Lenguaje ofensivo? **No**
   - ¿Drogas? **No**
   - ¿Servicios de ubicación? **Sí** (para emergencias)
   - ¿Comunicación entre usuarios? **Sí** (chat)

Resultado esperado: **PEGI 3 / Everyone**

---

## PASO 9: Público objetivo

- **Edad mínima**: 18 años
- **No dirigida a niños**: Sí

---

## PASO 10: Subir el AAB

1. Ve a **"Producción"** → **"Crear nueva versión"**
2. Sube el archivo `.aab` que descargaste de EAS
3. Copia las notas de versión de `PLAY_STORE_DESCRIPTION.md`
4. Click en **"Guardar"**

---

## PASO 11: Revisar y enviar

1. Completa todos los elementos marcados en rojo
2. Click en **"Enviar para revisión"**
3. ✅ ¡Listo!

**Tiempo de revisión**: 1-7 días

---

## 📋 CHECKLIST FINAL

Antes de enviar, verifica:

- [ ] AAB construido con EAS
- [ ] Cuenta de Play Console creada ($25 pagados)
- [ ] Descripción completa copiada
- [ ] Mínimo 2 capturas de pantalla
- [ ] Ícono 512x512 subido
- [ ] Política de privacidad publicada (URL)
- [ ] Clasificación de contenido completada
- [ ] Público objetivo configurado
- [ ] Categoría seleccionada (Herramientas)

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "No se puede construir"
```bash
# Limpia caché y vuelve a intentar
npm cache clean --force
rm -rf node_modules
npm install
eas build --platform android --profile production
```

### Error: "Keystore no encontrado"
```bash
# Genera credenciales
eas credentials
# Selecciona: Android → production → Set up new keystore
```

### Error: "Versión duplicada"
Incrementa `versionCode` en `app.json`:
```json
"android": {
  "versionCode": 2  // Cambia de 1 a 2, 3, 4...
}
```

---

## 📞 SOPORTE

Si tienes problemas:

1. **Expo**: https://docs.expo.dev
2. **Play Console**: https://support.google.com/googleplay
3. **Comunidad**: https://forums.expo.dev

---

## 🎉 DESPUÉS DE LA APROBACIÓN

Cuando Google apruebe tu app:

1. Recibirás un email
2. La app estará en Play Store
3. Comparte el enlace: `https://play.google.com/store/apps/details?id=com.safezone.app`

---

## 🔄 PARA ACTUALIZAR EN EL FUTURO

```bash
# 1. Incrementa versionCode en app.json
# 2. Construye nueva versión
eas build --platform android --profile production

# 3. Sube el nuevo AAB en Play Console
# Producción → Crear nueva versión
```

---

## ✨ ARCHIVOS IMPORTANTES CREADOS

- ✅ `eas.json` - Configuración de build
- ✅ `PRIVACY_POLICY.md` - Política de privacidad
- ✅ `PLAY_STORE_DESCRIPTION.md` - Descripciones para Play Store
- ✅ `DEPLOYMENT_GUIDE.md` - Esta guía

---

**¡Todo listo! Solo ejecuta los comandos y sigue los pasos. Éxito con tu lanzamiento! 🚀**
