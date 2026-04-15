import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { colors } from '../../theme';

interface IsmailiLoaderProps {
  message?: string;
  subMessage?: string;
  visible?: boolean;
}

const ismailiLogo = require('../../assets/images/ismaililogo.png');

const IsmailiLoader: React.FC<IsmailiLoaderProps> = ({
  message = 'Loading...',
  subMessage = 'Please wait while we process your request',
  visible = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Animated.Image
            source={ismailiLogo}
            style={[
              styles.logo,
              {
                transform: [{ rotateY }],
              },
            ]}
            resizeMode="contain"
          />
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.subMessage}>{subMessage}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  message: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  subMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default IsmailiLoader;
