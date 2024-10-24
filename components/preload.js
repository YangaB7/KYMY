import { Image } from 'react-native';

export const preloadImages = (images) => {
  return images.map(image => Image.prefetch(image));
};