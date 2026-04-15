import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string; // For compatibility, not used in RN
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        checked ? styles.containerChecked : styles.containerUnchecked,
        disabled && styles.containerDisabled,
      ]}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.thumb,
          checked ? styles.thumbChecked : styles.thumbUnchecked,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  containerChecked: {
    backgroundColor: colors.primary,
  },
  containerUnchecked: {
    backgroundColor: colors.borderLight,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  thumbChecked: {
    alignSelf: 'flex-end',
  },
  thumbUnchecked: {
    alignSelf: 'flex-start',
  },
});

export default ToggleSwitch;