// ============================================
// VOLUNTEER UPLOAD SCREEN
// Screen for uploading Excel files with volunteer data
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header/Header';
import FileUpload from '../../components/volunteer/FileUpload';
import { colors, spacing, borderRadius } from '../../theme';
import { useVolunteer } from '../../context/VolunteerContext';
import { useAuth } from '../../context/AuthContext';
import { UploadBatch } from '../../types/volunteer';
import { getRegionLabel } from '../../constants/volunteerConstants';

type RootStackParamList = {
  MakerHome: undefined;
  VolunteerUpload: undefined;
  VolunteerReview: { batchId?: string };
};

type VolunteerUploadNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VolunteerUpload'
>;

interface Props {
  navigation: VolunteerUploadNavigationProp;
}

const VolunteerUploadScreen: React.FC<Props> = ({ navigation }) => {
  const [isUploading, setIsUploading] = useState(false);

  const { uploadVolunteerData, userRegion } = useVolunteer();
  const { logout } = useAuth();

  const handleUploadSuccess = (batch: UploadBatch) => {
    Alert.alert(
      'Upload Successful',
      `${batch.totalRecords} records processed.\n\n` +
      `✓ Valid: ${batch.validRecords}\n` +
      `✗ Rejected: ${batch.rejectedRecords}\n` +
      `⚠ Discrepant: ${batch.discrepantRecords}`,
      [
        {
          text: 'Review Records',
          onPress: () => navigation.navigate('VolunteerReview', { batchId: batch.id }),
        },
        {
          text: 'Back to Dashboard',
          onPress: () => navigation.navigate('MakerHome'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleUploadError = (error: string) => {
    Alert.alert('Upload Failed', error);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Upload Volunteer Data"
        subtitle={userRegion ? getRegionLabel(userRegion) : 'Select Region'}
        onLogout={logout}
      />

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Upload Instructions</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instruction}>
              1. Select the region for this upload
            </Text>
            <Text style={styles.instruction}>
              2. Choose the data source (Local Council, ITREB, etc.)
            </Text>
            <Text style={styles.instruction}>
              3. Upload an Excel file with volunteer data
            </Text>
            <Text style={styles.instruction}>
              4. System will automatically validate:
            </Text>
            <View style={styles.subInstructions}>
              <Text style={styles.subInstruction}>• CNIC verification</Text>
              <Text style={styles.subInstruction}>• Duplicate detection</Text>
              <Text style={styles.subInstruction}>• Discrepancy checks</Text>
            </View>
            <Text style={styles.instruction}>
              5. Review and approve/reject records
            </Text>
          </View>
        </View>

        {/* File Upload Component */}
        <FileUpload
          onUpload={uploadVolunteerData}
          region={userRegion}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />

        {/* Validation Rules Info */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>⚙️ Validation Rules</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.badgeRed.bg }]}>
                <Text style={{ color: colors.badgeRed.fg }}>❌</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleName}>CNIC Not Found</Text>
                <Text style={styles.ruleDesc}>
                  Record rejected if CNIC not in Enrollment System
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.badgeRed.bg }]}>
                <Text style={{ color: colors.badgeRed.fg }}>❌</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleName}>Duplicate Same Duty</Text>
                <Text style={styles.ruleDesc}>
                  Rejected if same person assigned same duty in same event
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.badgeYellow.bg }]}>
                <Text style={{ color: colors.badgeYellow.fg }}>⚠️</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleName}>Different Duties Same Event</Text>
                <Text style={styles.ruleDesc}>
                  Flagged as discrepant, requires review
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.badgeYellow.bg }]}>
                <Text style={{ color: colors.badgeYellow.fg }}>⚠️</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleName}>Multiple Teams</Text>
                <Text style={styles.ruleDesc}>
                  Flagged if assigned by multiple sources
                </Text>
              </View>
            </View>
            <View style={styles.ruleItem}>
              <View style={[styles.ruleBadge, { backgroundColor: colors.badgeBlue.bg }]}>
                <Text style={{ color: colors.badgeBlue.fg }}>ℹ️</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleName}>Multiple Events</Text>
                <Text style={styles.ruleDesc}>
                  Allowed but flagged for visibility
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  instructionsCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  instructionsList: {
    gap: spacing.sm,
  },
  instruction: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  subInstructions: {
    marginLeft: spacing.lg,
    gap: spacing.xs,
  },
  subInstruction: {
    fontSize: 13,
    color: colors.textMuted,
  },
  rulesCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rulesList: {
    gap: spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  ruleBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleContent: {
    flex: 1,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default VolunteerUploadScreen;
