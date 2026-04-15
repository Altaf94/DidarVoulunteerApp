import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '../../theme';

interface CustomInputProps extends Omit<TextInputProps, 'onChange'> {
  id?: string;
  type?: 'text' | 'email' | 'password';
  label?: string;
  error?: boolean;
  errorMessage?: string;
  containerStyle?: object;
  onChange?: (text: string) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type = 'text',
  label,
  error = false,
  errorMessage,
  containerStyle,
  onChange,
  value,
  placeholder,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const secureTextEntry = isPassword && !showPassword;
  const keyboardType = type === 'email' ? 'email-address' : 'default';

  const handleChangeText = (text: string) => {
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          autoCorrect={false}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}>
            {showPassword ? (
              <EyeOff color={colors.textMuted} size={20} />
            ) : (
              <Eye color={colors.textMuted} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: colors.textMuted,
  },
  inputContainerError: {
    borderColor: colors.errorLight,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: colors.errorLight,
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomInput;
