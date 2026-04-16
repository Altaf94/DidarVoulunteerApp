// ============================================
// NATIONAL DASHBOARD SCREEN
// Leadership view with comprehensive statistics
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Users,
  Printer,
  Package,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  BarChart3,
} from 'lucide-react-native';
import Header from '../../components/Header/Header';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import StatsCard, {
  ProgressBar,
  SummaryCard,
  RegionProgressCard,
} from '../../components/volunteer/StatsCard';
import { colors, spacing, borderRadius } from '../../theme';
import { useVolunteer } from '../../context/VolunteerContext';
import { useAuth } from '../../context/AuthContext';
import {
  UserLevel,
  Region,
} from '../../types/volunteer';
import {
  getRegionLabel,
  getAccessLevelLabel,
  getAccessLevelColor,
  getProgressColor,
  REGIONS,
} from '../../constants/volunteerConstants';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Dashboard: undefined;
  CheckerReview: { region?: Region };
};

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

interface Props {
  navigation: DashboardNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const {
    dashboardStats,
    dashboardLoading,
    events,
    userLevel,
    userRegion,
    loadDashboardStats,
  } = useVolunteer();

  const { logout } = useAuth();

  const isNationalLevel = userLevel === UserLevel.NATIONAL;

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  }, []);

  // Summary Statistics
  const renderSummaryStats = () => {
    if (!dashboardStats) return null;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <SummaryCard
            title="Required"
            value={dashboardStats.totalRequired}
            icon={<Users size={24} color={colors.primary} />}
            color={colors.primary}
          />
          <SummaryCard
            title="Received"
            value={dashboardStats.totalReceived}
            subtitle={`${dashboardStats.receivedPercentage}%`}
            icon={<TrendingUp size={24} color={colors.info} />}
            color={colors.info}
          />
        </View>
        <View style={styles.summaryRow}>
          <SummaryCard
            title="Printed"
            value={dashboardStats.totalPrinted}
            subtitle={`${dashboardStats.printedPercentage}%`}
            icon={<Printer size={24} color={colors.success} />}
            color={colors.success}
          />
          <SummaryCard
            title="Dispatched"
            value={dashboardStats.totalDispatched}
            icon={<Package size={24} color="#8B5CF6" />}
            color="#8B5CF6"
          />
        </View>
      </View>
    );
  };

  // Main Progress Cards
  const renderProgressCards = () => {
    if (!dashboardStats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        
        <StatsCard
          title="Required vs Received"
          required={dashboardStats.totalRequired}
          received={dashboardStats.totalReceived}
          icon={<Users size={24} color={colors.primary} />}
        />
        
        <View style={styles.cardSpacer} />
        
        <StatsCard
          title="Required vs Printed"
          required={dashboardStats.totalRequired}
          received={dashboardStats.totalPrinted}
          icon={<Printer size={24} color={colors.success} />}
        />
      </View>
    );
  };

  // Region Progress (National Level Only)
  const renderRegionProgress = () => {
    if (!isNationalLevel || !dashboardStats?.byRegion) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Regional Progress</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardStats.byRegion.map((region) => (
          <TouchableOpacity
            key={region.region}
            onPress={() => navigation.navigate('CheckerReview', { region: region.region })}
          >
            <RegionProgressCard
              regionName={region.regionName}
              required={region.required}
              received={region.received}
              printed={region.printed}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Access Level Progress
  const renderAccessLevelProgress = () => {
    if (!dashboardStats?.byAccessLevel) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Access Level</Text>
        <View style={styles.accessLevelCard}>
          {dashboardStats.byAccessLevel.map((level) => {
            const percentage = level.required > 0 
              ? Math.round((level.received / level.required) * 100) 
              : 0;
            const color = getAccessLevelColor(level.accessLevel);

            return (
              <View key={level.accessLevel} style={styles.accessLevelRow}>
                <View style={styles.accessLevelHeader}>
                  <View style={[styles.accessLevelColor, { backgroundColor: color }]} />
                  <Text style={styles.accessLevelName}>{level.accessLevelName}</Text>
                </View>
                <View style={styles.accessLevelProgress}>
                  <View style={styles.accessLevelBar}>
                    <View
                      style={[
                        styles.accessLevelFill,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.accessLevelStats}>
                    {level.received}/{level.required}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Event Progress
  const renderEventProgress = () => {
    if (!dashboardStats?.byEvent) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Event</Text>
        <View style={styles.eventsContainer}>
          {dashboardStats.byEvent.map((event) => {
            const percentage = event.required > 0 
              ? Math.round((event.received / event.required) * 100) 
              : 0;

            return (
              <TouchableOpacity
                key={event.eventId}
                style={[
                  styles.eventCard,
                  selectedEvent === event.eventId && styles.eventCardSelected,
                ]}
                onPress={() => setSelectedEvent(
                  selectedEvent === event.eventId ? null : event.eventId
                )}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventNumber}>Event {event.eventNumber}</Text>
                  <Text style={[styles.eventPercentage, { color: getProgressColor(percentage) }]}>
                    {percentage}%
                  </Text>
                </View>

                <View style={styles.eventProgress}>
                  <View style={styles.eventBar}>
                    <View
                      style={[
                        styles.eventFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor: getProgressColor(percentage),
                        },
                      ]}
                    />
                  </View>
                </View>

                {selectedEvent === event.eventId && (
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Required</Text>
                      <Text style={styles.eventDetailValue}>{event.required}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Received</Text>
                      <Text style={styles.eventDetailValue}>{event.received}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Printed</Text>
                      <Text style={styles.eventDetailValue}>{event.printed}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Quick Stats Bar
  const renderQuickStats = () => {
    if (!dashboardStats) return null;

    const validationRate = dashboardStats.totalReceived > 0
      ? Math.round((dashboardStats.totalValidated / dashboardStats.totalReceived) * 100)
      : 0;
    
    const approvalRate = dashboardStats.totalValidated > 0
      ? Math.round((dashboardStats.totalApproved / dashboardStats.totalValidated) * 100)
      : 0;

    return (
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{validationRate}%</Text>
          <Text style={styles.quickStatLabel}>Validation Rate</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{approvalRate}%</Text>
          <Text style={styles.quickStatLabel}>Approval Rate</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{dashboardStats.printedPercentage}%</Text>
          <Text style={styles.quickStatLabel}>Print Progress</Text>
        </View>
      </View>
    );
  };

  if (dashboardLoading && !refreshing) {
    return <IsmailiLoader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={isNationalLevel ? 'National Dashboard' : 'Regional Dashboard'}
        subtitle={
          isNationalLevel
            ? 'All Regions Overview'
            : userRegion
            ? getRegionLabel(userRegion)
            : 'Dashboard'
        }
        onLogout={logout}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderQuickStats()}
        {renderSummaryStats()}
        {renderProgressCards()}
        {isNationalLevel && renderRegionProgress()}
        {renderAccessLevelProgress()}
        {renderEventProgress()}
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
    padding: spacing.lg,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.sm,
  },
  summaryContainer: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  cardSpacer: {
    height: spacing.md,
  },
  accessLevelCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accessLevelRow: {
    marginBottom: spacing.md,
  },
  accessLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  accessLevelColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  accessLevelName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  accessLevelProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessLevelBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  accessLevelFill: {
    height: '100%',
    borderRadius: 4,
  },
  accessLevelStats: {
    fontSize: 12,
    color: colors.textMuted,
    width: 60,
    textAlign: 'right',
  },
  eventsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eventCard: {
    width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventCardSelected: {
    width: '100%',
    borderColor: colors.primary,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eventPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  eventProgress: {
    marginBottom: spacing.xs,
  },
  eventBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  eventFill: {
    height: '100%',
    borderRadius: 3,
  },
  eventDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  eventDetailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  eventDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default DashboardScreen;
