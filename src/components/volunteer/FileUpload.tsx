// ============================================
// FILE UPLOAD COMPONENT
// Excel file upload with drag & drop support
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';
import {
  Region,
  DataSource,
  VolunteerUploadFormData,
  UploadBatch,
} from '../../types/volunteer';
import {
  REGIONS,
  DATA_SOURCES,
  EXCEL_TEMPLATE_COLUMNS,
} from '../../constants/volunteerConstants';

// Simple file type for mock implementation
interface SelectedFile {
  name: string;
  uri: string;
  size?: number;
  type?: string;
}

interface FileUploadProps {
  onUpload: (data: VolunteerUploadFormData) => Promise<UploadBatch>;
  region?: Region;
  source?: DataSource;
  onSuccess?: (batch: UploadBatch) => void;
  onError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  region,
  source,
  onSuccess,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>(region);
  const [selectedSource, setSelectedSource] = useState<DataSource>(source || DataSource.LOCAL_COUNCIL);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadBatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilePick = async () => {
    // Show info that file picking will be available soon
    Alert.alert(
      'Select Excel File',
      'File upload functionality will be available in the next update. For now, you can use the web portal to upload Excel files.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Demo File',
          onPress: () => {
            // Set a demo file for testing
            setSelectedFile({
              name: 'volunteers_demo.xlsx',
              uri: 'file://demo/volunteers_demo.xlsx',
              size: 25600,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            setError(null);
            setUploadResult(null);
          },
        },
      ]
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!selectedRegion) {
      setError('Please select a region');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await onUpload({
        file: selectedFile as any,
        region: selectedRegion,
        source: selectedSource,
        sourceEntityId: 'default-entity',
      });

      setUploadResult(result);
      onSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
  };

  const renderTemplateInfo = () => (
    <View style={styles.templateInfo}>
      <View style={styles.templateHeader}>
        <FileSpreadsheet size={20} color={colors.primary} />
        <Text style={styles.templateTitle}>Excel Template Format</Text>
      </View>
      <View style={styles.templateColumns}>
        {EXCEL_TEMPLATE_COLUMNS.map((col) => (
          <View key={col.key} style={styles.columnRow}>
            <Text style={styles.columnName}>
              {col.label}
              {col.required && <Text style={styles.required}> *</Text>}
            </Text>
            <Text style={styles.columnExample}>e.g., {col.example}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.downloadTemplate}>
        <Download size={16} color={colors.primary} />
        <Text style={styles.downloadTemplateText}>Download Template</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUploadResult = () => {
    if (!uploadResult) return null;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <CheckCircle size={24} color={colors.success} />
          <Text style={styles.resultTitle}>Upload Successful</Text>
        </View>
        <View style={styles.resultStats}>
          <ResultStat label="Total Records" value={uploadResult.totalRecords} />
          <ResultStat
            label="Valid"
            value={uploadResult.validRecords}
            color={colors.success}
          />
          <ResultStat
            label="Rejected"
            value={uploadResult.rejectedRecords}
            color={colors.error}
          />
          <ResultStat
            label="Discrepant"
            value={uploadResult.discrepantRecords}
            color="#F59E0B"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Region Selection */}
      {!region && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Region</Text>
          <View style={styles.optionsRow}>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.optionButton,
                  selectedRegion === r.value && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedRegion(r.value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedRegion === r.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Source Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Source</Text>
        <View style={styles.optionsRow}>
          {DATA_SOURCES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[
                styles.optionButton,
                selectedSource === s.value && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedSource(s.value)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  selectedSource === s.value && styles.optionButtonTextSelected,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* File Drop Zone */}
      <TouchableOpacity
        style={[styles.dropZone, selectedFile && styles.dropZoneActive]}
        onPress={handleFilePick}
        disabled={isUploading}
      >
        {selectedFile ? (
          <View style={styles.fileSelected}>
            <FileSpreadsheet size={32} color={colors.primary} />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
            </Text>
            {!isUploading && (
              <TouchableOpacity style={styles.clearFile} onPress={handleClear}>
                <XCircle size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.dropZoneContent}>
            <Upload size={40} color={colors.textMuted} />
            <Text style={styles.dropZoneText}>
              Tap to select Excel file
            </Text>
            <Text style={styles.dropZoneSubtext}>
              .xlsx or .xls files only
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <XCircle size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, (!selectedFile || isUploading) && styles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Upload size={20} color={colors.white} />
            <Text style={styles.uploadButtonText}>Upload & Validate</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Upload Result */}
      {renderUploadResult()}

      {/* Template Info */}
      {!uploadResult && renderTemplateInfo()}
    </View>
  );
};

// ============================================
// RESULT STAT COMPONENT
// ============================================

interface ResultStatProps {
  label: string;
  value: number;
  color?: string;
}

const ResultStat: React.FC<ResultStatProps> = ({ label, value, color }) => (
  <View style={styles.resultStat}>
    <Text style={[styles.resultStatValue, color && { color }]}>{value}</Text>
    <Text style={styles.resultStatLabel}>{label}</Text>
  </View>
);

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  optionButtonTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
  },
  dropZoneActive: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundGreen,
    borderStyle: 'solid',
  },
  dropZoneContent: {
    alignItems: 'center',
  },
  dropZoneText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginTop: spacing.md,
  },
  dropZoneSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  fileSelected: {
    alignItems: 'center',
    width: '100%',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    maxWidth: '80%',
  },
  fileSize: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  clearFile: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.badgeRed.bg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  uploadButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  resultContainer: {
    backgroundColor: colors.badgeGreen.bg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  resultStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  resultStat: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  templateInfo: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  templateColumns: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  columnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  columnName: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  columnExample: {
    fontSize: 12,
    color: colors.textMuted,
  },
  downloadTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  downloadTemplateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default FileUpload;
