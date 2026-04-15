import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../../theme';

interface CustomModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const CustomModal: React.FC<CustomModalProps> = ({
  show,
  onClose,
  children,
  size = 'md',
  title,
}) => {
  const getMaxWidth = () => {
    switch (size) {
      case 'sm':
        return 300;
      case 'md':
        return 350;
      case 'lg':
        return 400;
      case 'xl':
        return 450;
      default:
        return 350;
    }
  };

  return (
    <Modal
      visible={show}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={[styles.modalContent, { maxWidth: getMaxWidth() }]}>
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X color={colors.textMuted} size={20} />
                </TouchableOpacity>
              </View>
            )}
            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: screenHeight * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default CustomModal;
