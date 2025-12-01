import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

const { width, height } = Dimensions.get('window');

export default function PrivacyShield() {
  const [isFaceDown, setIsFaceDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFaceDownRef = useRef(false);
  const debugCounterRef = useRef(0);

  useEffect(() => {
    let subscription: any;

    const startListening = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();

        if (!available) {
          return;
        }

        // Actualizar más frecuentemente para mejor detección
        await DeviceMotion.setUpdateInterval(80);

        // Pequeño filtro: requerimos algunas lecturas estables antes de cambiar de estado
        let consecutiveFaceDown = 0;
        let consecutiveFaceUp = 0;
        const REQUIRED_STABLE_SAMPLES = 1;

        subscription = DeviceMotion.addListener((data) => {
          // Usar datos de gravedad para estimar orientación del dispositivo
          const { rotation, acceleration, accelerationIncludingGravity } = data as any;

          let readingFaceDown = false;
          let readingFaceUp = false;

          // Método principal: usar accelerationIncludingGravity y escoger el eje dominante
          if (accelerationIncludingGravity) {
            const { x, y, z } = accelerationIncludingGravity;

            // Normalizar respecto a la gravedad aproximada
            const g = Math.sqrt(x * x + y * y + z * z) || 9.81;
            const normX = x / g;
            const normY = y / g;
            const normZ = z / g; // ~+1 pantalla hacia abajo, ~-1 pantalla hacia arriba

            // Logs de depuración controlados
            debugCounterRef.current += 1;
            if (debugCounterRef.current % 15 === 0) {
            }

            // Elegir el eje dominante entre Z (plano) e Y (vertical)
            if (Math.abs(normZ) >= Math.abs(normY)) {
              // Dispositivo más bien plano: decidir por Z
              if (normZ >= 0.6) {
                // Pantalla apuntando hacia abajo
                readingFaceDown = true;
              } else if (normZ <= -0.6) {
                // Pantalla apuntando hacia arriba
                readingFaceUp = true;
              }
            } else {
              // Dispositivo más bien vertical: decidir por Y
              if (normY >= 0.7) {
                // Cabeza del teléfono hacia abajo
                readingFaceDown = true;
              } else if (normY <= -0.7) {
                // Cabeza del teléfono hacia arriba
                readingFaceUp = true;
              }
            }
          } else if (acceleration) {
            // Fallback si no existe accelerationIncludingGravity
            const { z } = acceleration;
            // Aproximación: z > 0 fuerte = boca arriba, z < 0 fuerte = boca abajo
            if (z <= -7) {
              readingFaceDown = true;
            } else if (z >= 7) {
              readingFaceUp = true;
            }
          } else if (rotation) {
            // Fallback adicional usando rotation
            const { beta, gamma } = rotation;
            const betaDegrees = (beta * 180) / Math.PI;
            const gammaDegrees = (gamma * 180) / Math.PI;

            const isBetaFaceDown =
              (betaDegrees > 120 && betaDegrees < 240) ||
              (betaDegrees < -120 && betaDegrees > -240);
            const isGammaFlat = Math.abs(gammaDegrees) < 60;

            if (isBetaFaceDown && isGammaFlat) {
              readingFaceDown = true;
            }
          }

          if (readingFaceDown) {
            consecutiveFaceDown += 1;
            consecutiveFaceUp = 0;
          } else if (readingFaceUp) {
            consecutiveFaceUp += 1;
            consecutiveFaceDown = 0;
          } else {
            consecutiveFaceDown = 0;
            consecutiveFaceUp = 0;
          }

          let nextIsFaceDown = isFaceDownRef.current;

          if (!isFaceDownRef.current && consecutiveFaceDown >= REQUIRED_STABLE_SAMPLES) {
            nextIsFaceDown = true;
          } else if (isFaceDownRef.current && consecutiveFaceUp >= REQUIRED_STABLE_SAMPLES) {
            nextIsFaceDown = false;
          }

          if (nextIsFaceDown !== isFaceDownRef.current) {
            if (nextIsFaceDown) {
              // Entrar: hacer un fade-in suave desde 0 hasta 1
              setVisible(true);
              fadeAnim.setValue(0);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }).start();
            } else {
              // Salir: hacer un fade-out suave y al final ocultar el overlay
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }).start(({ finished }) => {
                if (finished) {
                  setVisible(false);
                }
              });
            }

            isFaceDownRef.current = nextIsFaceDown;
            setIsFaceDown(nextIsFaceDown);
          }
        });
      } catch (error) {
        console.error('Error iniciando sensor de movimiento:', error);
      }
    };

    startListening();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="none">
      <View style={styles.content}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
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
  },
  logoImage: {
    width: width * 0.9,
    height: width * 0.9,
    opacity: 0.15,
  },
});
