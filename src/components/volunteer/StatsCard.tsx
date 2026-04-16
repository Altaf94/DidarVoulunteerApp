// ============================================
// STATS CARD COMPONENT
// Displays statistics with progress visualization
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { getProgressColor } from '../../constants/volunteerConstants';

interface StatsCardProps {
  title: string;
  required: number;
  received: number;
  subtitle?: string;
  icon?: React.ReactNode;
  showPercentage?: boolean;
  variant?: 'default' | 'compact';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  required,
  received,
  subtitle,
  icon,
  showPercentage = true,
  variant = 'default',
}) => {
  const percentage = required > 0 ? Math.round((received / required) * 100) : 0;
  const progressColor = getProgressColor(percentage);

  const isCompact = variant === 'compact';

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {showPercentage && (
          <Text style={[styles.percentage, { color: progressColor }]}>
            {percentage}%
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Required</Text>
          <Text style={styles.statValue}>{required.toLocaleString()}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Received</Text>
          <Text style={[styles.statValue, { color: progressColor }]}>
            {received.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={styles.statValue}>
            {Math.max(required - received, 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// PROGRESS BAR COMPONENT
// Horizontal bar chart for dashboard
// ============================================

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  showValue?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue,
  color,
  showValue = true,
  height = 20,
}) => {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const barColor = color || getProgressColor(percentage);

  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.labelRow}>
        <Text style={progressStyles.label}>{label}</Text>
        {showValue && (
          <Text style={progressStyles.value}>
            {value.toLocaleString()} / {maxValue.toLocaleString()} ({percentage}%)
          </Text>
        )}
      </View>
      <View style={[progressStyles.bar, { height }]}>
        <View
          style={[
            progressStyles.fill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

// ============================================
// SUMMARY CARD COMPONENT
// Simple card for showing single stat
// ============================================

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
}) => {
  return (
    <View style={summaryStyles.container}>
      <View style={[summaryStyles.iconBox, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={summaryStyles.title}>{title}</Text>
      <Text style={[summaryStyles.value, { color }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      {subtitle && <Text style={summaryStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

// ============================================
// REGION PROGRESS CARD
// Card showing progress for a specific region
// ============================================

interface RegionProgressCardProps {
  regionName: string;
  required: number;
  received: number;
  printed: number;
  onPress?: () => void;
}

export const RegionProgressCard: React.FC<RegionProgressCardProps> = ({
  regionName,
  required,
  received,
  printed,
}) => {
  const receivedPercentage = required > 0 ? Math.round((received / required) * 100) : 0;
  const printedPercentage = required > 0 ? Math.round((printed / required) * 100) : 0;

  return (
    <View style={regionStyles.container}>
      <Text style={regionStyles.regionName}>{regionName}</Text>
      
      <View style={regionStyles.statsContainer}>
        <View style={regionStyles.statBox}>
          <Text style={regionStyles.statValue}>{required}</Text>
          <Text style={regionStyles.statLabel}>Required</Text>
        </View>
        <View style={regionStyles.statBox}>
          <Text style={[regionStyles.statValue, { color: getProgressColor(receivedPercentage) }]}>
            {received}
          </Text>
          <Text style={regionStyles.statLabel}>Received</Text>
        </View>
        <View style={regionStyles.statBox}>
          <Text style={[regionStyles.statValue, { color: getProgressColor(printedPercentage) }]}>
            {printed}
          </Text>
          <Text style={regionStyles.statLabel}>Printed</Text>
        </View>
      </View>

      <View style={regionStyles.progressBars}>
        <View style={regionStyles.progressRow}>
          <Text style={regionStyles.progressLabel}>Received</Text>
          <View style={regionStyles.progressBar}>
            <View
              style={[
                regionStyles.progressFill,
                {
                  width: `${receivedPercentage}%`,
                  backgroundColor: getProgressColor(receivedPercentage),
                },
              ]}
            />
          </View>
          <Text style={regionStyles.progressPercentage}>{receivedPercentage}%</Text>
        </View>
        <View style={regionStyles.progressRow}>
          <Text style={regionStyles.progressLabel}>Printed</Text>
          <View style={regionStyles.progressBar}>
            <View
              style={[
                regionStyles.progressFill,
                {
                  width: `${printedPercentage}%`,
                  backgroundColor: getProgressColor(printedPercentage),
                },
              ]}
            />
          </View>
          <Text style={regionStyles.progressPercentage}>{printedPercentage}%</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerCompact: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  titleCompact: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

const progressStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bar: {
    backgroundColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 10,
  },
});

const summaryStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: (Dimensions.get('window').width - spacing.lg * 3) / 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

const regionStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  regionName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressBars: {
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    width: 70,
    fontSize: 12,
    color: colors.textMuted,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercentage: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
});

export default StatsCard;
