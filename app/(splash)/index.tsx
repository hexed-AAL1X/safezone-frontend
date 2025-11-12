import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
 

// Importa el logo de forma segura
import AnimatedLogo from '../../components/AnimatedLogo';

// El manejo del splash nativo se realiza en app/_layout.tsx

const SplashScreenComponent: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/onboarding');
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background}>
        {/* Logo animado */}
        <AnimatedLogo size={680} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default SplashScreenComponent;

