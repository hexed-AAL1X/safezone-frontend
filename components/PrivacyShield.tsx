import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PrivacyShield() {
  const [isFaceDown, setIsFaceDown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let subscription: any;

    const startListening = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        console.log('DeviceMotion disponible:', available);
        
        if (!available) {
          console.log('DeviceMotion no está disponible en este dispositivo');
          return;
        }

        // Actualizar más frecuentemente para mejor detección
        await DeviceMotion.setUpdateInterval(300);
        
        subscription = DeviceMotion.addListener((data) => {
          // Usar orientation si está disponible, sino rotation
          const { orientation, rotation, acceleration } = data;
          
          let faceDown = false;
          
          // Método 1: Usar orientation (más confiable)
          if (orientation) {
            // orientation es un número de 0 a 3
            // 0 = portrait, 1 = landscape right, 2 = portrait upside down, 3 = landscape left
            // Pero esto no detecta boca abajo, así que usamos acceleration
          }
          
          // Método 2: Usar acceleration (más universal)
          if (acceleration) {
            const { z } = acceleration;
            // Si z es negativo y fuerte, el teléfono está boca abajo
            // Valores típicos: boca arriba z ≈ 9.8, boca abajo z ≈ -9.8
            faceDown = z < -7;
            console.log('Acceleration Z:', z.toFixed(2), 'Face down:', faceDown);
          }
          // Método 3: Usar rotation como fallback
          else if (rotation) {
            const { beta, gamma } = rotation;
            const betaDegrees = (beta * 180) / Math.PI;
            const gammaDegrees = (gamma * 180) / Math.PI;
            
            const isBetaFaceDown = (betaDegrees > 120 && betaDegrees < 240) || 
                                    (betaDegrees < -120 && betaDegrees > -240);
            const isGammaFlat = Math.abs(gammaDegrees) < 60;
            
            faceDown = isBetaFaceDown && isGammaFlat;
            console.log('Beta:', betaDegrees.toFixed(0), 'Gamma:', gammaDegrees.toFixed(0), 'Face down:', faceDown);
          }
          
          if (faceDown !== isFaceDown) {
            console.log('Cambiando estado a:', faceDown ? 'BOCA ABAJO' : 'BOCA ARRIBA');
            setIsFaceDown(faceDown);
            Animated.timing(fadeAnim, {
              toValue: faceDown ? 1 : 0,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }
        });
        
        console.log('Listener de DeviceMotion iniciado');
      } catch (error) {
        console.error('Error iniciando sensor de movimiento:', error);
      }
    };

    startListening();

    return () => {
      if (subscription) {
        console.log('Removiendo listener de DeviceMotion');
        subscription.remove();
      }
    };
  }, [isFaceDown, fadeAnim]);

  if (!isFaceDown) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="none">
      <View style={styles.content}>
        <Ionicons name="shield-outline" size={80} color="rgba(0,255,209,0.3)" />
        <Text style={styles.logoText}>SAFEZONE</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoText: {
    color: 'rgba(0,255,209,0.3)',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
