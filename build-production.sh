#!/bin/bash

echo "🚀 Construyendo SafeZone para Play Store..."
echo ""

# Limpiar caché
echo "🧹 Limpiando caché..."
npm cache clean --force

# Build para producción (AAB)
echo ""
echo "📦 Construyendo AAB para Play Store..."
eas build --platform android --profile production --clear-cache

echo ""
echo "✅ Build iniciado!"
echo "📱 Recibirás un enlace para descargar el .aab cuando termine"
echo "⏱️  Tiempo estimado: 15-20 minutos"
