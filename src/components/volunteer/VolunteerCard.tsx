// ============================================
// VOLUNTEER CARD COMPONENT
// Displays volunteer information in a card format
// ============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Check, AlertTriangle, X, Printer, Package } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';
import {
  Volunteer,
  VolunteerStatus,
  PrintStatus,
} from '../../types/volunteer';
import {
  getStatusConfig,
  getPrintStatusConfig,
  getAccessLevelLabel,
  getAccessLevelColor,
  getRegionLabel,
  getDataSourceLabel,
} from '../../constants/volunteerConstants';

interface VolunteerCardProps {
  volunteer: Volunteer;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onPress?: (volunteer: Volunteer) => void;
  showCheckbox?: boolean;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const VolunteerCard: React.FC<VolunteerCardProps> = ({
  volunteer,
  isSelected = false,
  onSelect,
  onPress,
  showCheckbox = false,
  showActions = false,
  onApprove,
  onReject,
}) => {
  const statusConfig = getStatusConfig(volunteer.status);
  const printStatusConfig = getPrintStatusConfig(volunteer.printStatus);
  const accessLevelColor = getAccessLevelColor(volunteer.accessLevel);

  const handleCardPress = () => {
    if (showCheckbox && onSelect) {
      onSelect(volunteer.id);
    } else if (onPress) {
      onPress(volunteer);
    }
  };

  const renderStatusBadge = () => (
    <View style={[styles.badge, { backgroundColor: statusConfig.color }]}>
      <Text style={[styles.badgeText, { color: statusConfig.textColor }]}>
        {statusConfig.label}
      </Text>
    </View>
  );

  const renderAccessLevelBand = () => (
    <View style={[styles.accessLevelBand, { backgroundColor: accessLevelColor }]}>
      <Text style={styles.accessLevelText}>
        {getAccessLevelLabel(volunteer.accessLevel)}
      </Text>
    </View>
  );

  const renderDiscrepancyWarning = () => {
    if (volunteer.status !== VolunteerStatus.DISCREPANT) return null;
    
    return (
      <View style={styles.warningContainer}>
        <AlertTriangle size={16} color="#F59E0B" />
        <Text style={styles.warningText}>
          {volunteer.validationErrors.length > 0
            ? volunteer.validationErrors[0].errorMessage
            : 'Discrepancy detected'}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
      ]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {showCheckbox && (
            <TouchableOpacity
              style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
              ]}
              onPress={() => onSelect?.(volunteer.id)}
            >
              {isSelected && <Check size={14} color="#FFFFFF" />}
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.volunteerId}>{volunteer.volunteerId}</Text>
            <Text style={styles.name}>{volunteer.name}</Text>
          </View>
        </View>
        {renderStatusBadge()}
      </View>

      {/* Access Level Band */}
      {renderAccessLevelBand()}

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CNIC:</Text>
          <Text style={styles.detailValue}>{volunteer.cnic}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Event:</Text>
          <Text style={styles.detailValue}>Event {volunteer.eventNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duty:</Text>
          <Text style={styles.detailValue}>{volunteer.dutyTypeName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Region:</Text>
          <Text style={styles.detailValue}>{getRegionLabel(volunteer.region)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Source:</Text>
          <Text style={styles.detailValue}>{getDataSourceLabel(volunteer.source)}</Text>
        </View>
      </View>

      {/* Discrepancy Warning */}
      {renderDiscrepancyWarning()}

      {/* Print Status */}
      {volunteer.printStatus !== PrintStatus.NOT_PRINTED && (
        <View style={styles.printStatusContainer}>
          <Printer size={14} color={printStatusConfig.textColor} />
          <Text style={[styles.printStatusText, { color: printStatusConfig.textColor }]}>
            {printStatusConfig.label}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && volunteer.status === VolunteerStatus.VALID && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => onApprove?.(volunteer.id)}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => onReject?.(volunteer.id)}
          >
            <X size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.backgroundGreen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  volunteerId: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  accessLevelBand: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  accessLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsContainer: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    width: 70,
    fontSize: 13,
    color: colors.textMuted,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  warningText: {
    marginLeft: spacing.sm,
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  printStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  printStatusText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VolunteerCard;
