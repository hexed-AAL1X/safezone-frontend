module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      // NOTA: react-native-reanimated/plugin debe ser el último en la lista
    ],
  };
};
