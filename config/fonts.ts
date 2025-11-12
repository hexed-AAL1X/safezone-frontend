import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'Inter-Black': require('../assets/fonts/Inter-Black.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });
};

export const fontConfig = {
  Inter: {
    400: 'Inter-Regular',
    900: 'Inter-Black',
  },
  Montserrat: {
    700: 'Montserrat-Bold',
  },
};
