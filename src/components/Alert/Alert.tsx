import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { colors } from '../../theme';
import { AlertType } from '../../types';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const { width } = Dimensions.get('window');

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 15000,
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: colors.error,
          textColor: colors.white,
          icon: <AlertCircle color={colors.white} size={20} />,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          textColor: colors.black,
          icon: <AlertTriangle color={colors.black} size={20} />,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          textColor: colors.white,
          icon: <CheckCircle color={colors.white} size={20} />,
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info,
          textColor: colors.white,
          icon: <Info color={colors.white} size={20} />,
        };
    }
  };

  if (!isVisible) return null;

  const alertStyles = getStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: alertStyles.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{alertStyles.icon}</View>
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: alertStyles.textColor }]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, { color: alertStyles.textColor }]}>
            {message}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X color={alertStyles.textColor} size={20} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default Alert;
