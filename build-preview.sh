#!/bin/bash

echo "🚀 Construyendo SafeZone APK para testing..."
echo ""

# Limpiar caché
echo "🧹 Limpiando caché..."
npm cache clean --force

# Build para preview (APK)
echo ""
echo "📦 Construyendo APK para testing..."
eas build --platform android --profile preview --clear-cache

echo ""
echo "✅ Build iniciado!"
echo "📱 Recibirás un enlace para descargar el .apk cuando termine"
echo "⏱️  Tiempo estimado: 15-20 minutos"
echo "💡 Instala el APK en tu teléfono para tomar screenshots"
