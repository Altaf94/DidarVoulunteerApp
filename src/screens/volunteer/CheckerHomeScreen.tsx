// ============================================
// CHECKER HOME SCREEN
// Main screen for Checker role - Review, Print, Dispatch
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FileCheck,
  Printer,
  Package,
  Send,
  ChevronRight,
  Users,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react-native';
import Header from '../../components/Header/Header';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import { SummaryCard, RegionProgressCard } from '../../components/volunteer/StatsCard';
import { colors, spacing, borderRadius } from '../../theme';
import { useVolunteer } from '../../context/VolunteerContext';
import { useAuth } from '../../context/AuthContext';
import {
  VolunteerStatus,
  PrintStatus,
  UserLevel,
  Region,
} from '../../types/volunteer';
import { getRegionLabel, REGIONS } from '../../constants/volunteerConstants';

type RootStackParamList = {
  CheckerHome: undefined;
  CheckerReview: { region?: Region };
  PrintBadges: undefined;
  DispatchPackages: undefined;
};

type CheckerHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CheckerHome'
>;

interface Props {
  navigation: CheckerHomeNavigationProp;
}

const CheckerHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    volunteers,
    volunteersLoading,
    dashboardStats,
    dashboardLoading,
    dispatchPackages,
    userLevel,
    userRegion,
    loadVolunteers,
    loadDashboardStats,
    loadDispatchPackages,
  } = useVolunteer();

  const { logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadVolunteers({ status: VolunteerStatus.SUBMITTED }),
      loadDashboardStats(),
      loadDispatchPackages(),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Calculate statistics
  const submittedCount = volunteers.filter(v => v.status === VolunteerStatus.SUBMITTED).length;
  const approvedCount = volunteers.filter(v => v.status === VolunteerStatus.APPROVED).length;
  const printedCount = volunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length;
  const dispatchedCount = volunteers.filter(v => v.printStatus === PrintStatus.DISPATCHED).length;

  const isNationalLevel = userLevel === UserLevel.NATIONAL;

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('CheckerReview', {})}
        >
          <SummaryCard
            title="Pending Review"
            value={submittedCount}
            icon={<Clock size={24} color={colors.info} />}
            color={colors.info}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('PrintBadges')}
        >
          <SummaryCard
            title="Ready to Print"
            value={approvedCount}
            icon={<Printer size={24} color={colors.primary} />}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.summaryRow}>
        <SummaryCard
          title="Printed"
          value={printedCount}
          icon={<CheckCircle size={24} color={colors.success} />}
          color={colors.success}
        />
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('DispatchPackages')}
        >
          <SummaryCard
            title="Dispatched"
            value={dispatchedCount}
            icon={<Truck size={24} color="#8B5CF6" />}
            color="#8B5CF6"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.reviewCard]}
          onPress={() => navigation.navigate('CheckerReview', {})}
        >
          <FileCheck size={32} color={colors.white} />
          <Text style={styles.actionTitle}>Review Submissions</Text>
          <Text style={styles.actionSubtitle}>{submittedCount} pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.printCard]}
          onPress={() => navigation.navigate('PrintBadges')}
        >
          <Printer size={32} color={colors.white} />
          <Text style={styles.actionTitle}>Print Badges</Text>
          <Text style={styles.actionSubtitle}>{approvedCount} ready</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionCard, styles.dispatchCard, styles.fullWidthAction]}
        onPress={() => navigation.navigate('DispatchPackages')}
      >
        <Package size={32} color={colors.white} />
        <View style={styles.fullWidthActionText}>
          <Text style={styles.actionTitle}>Manage Dispatch</Text>
          <Text style={styles.actionSubtitle}>Prepare & send packages</Text>
        </View>
        <ChevronRight size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderRegionProgress = () => {
    if (!isNationalLevel || !dashboardStats?.byRegion) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Region Progress</Text>
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

  const renderRecentPackages = () => {
    if (dispatchPackages.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Packages</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DispatchPackages')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dispatchPackages.slice(0, 3).map((pkg) => (
          <View key={pkg.id} style={styles.packageCard}>
            <View style={styles.packageIcon}>
              <Package size={24} color={colors.primary} />
            </View>
            <View style={styles.packageContent}>
              <Text style={styles.packageTitle}>{pkg.destinationEntityName}</Text>
              <Text style={styles.packageMeta}>
                {pkg.totalBadges} badges • {getRegionLabel(pkg.region)}
              </Text>
            </View>
            <View style={[
              styles.packageStatus,
              { backgroundColor: pkg.status === 'dispatched' ? colors.badgeGreen.bg : colors.badgeYellow.bg }
            ]}>
              <Text style={[
                styles.packageStatusText,
                { color: pkg.status === 'dispatched' ? colors.badgeGreen.fg : colors.badgeYellow.fg }
              ]}>
                {pkg.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if ((volunteersLoading || dashboardLoading) && !refreshing) {
    return <IsmailiLoader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Checker Dashboard"
        subtitle={isNationalLevel ? 'National Level' : userRegion ? getRegionLabel(userRegion) : 'Regional Level'}
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
        {renderSummaryCards()}
        {renderQuickActions()}
        {renderRegionProgress()}
        {renderRecentPackages()}
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
  summaryContainer: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCardWrapper: {
    flex: 1,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  fullWidthAction: {
    flex: undefined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  fullWidthActionText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  reviewCard: {
    backgroundColor: colors.info,
  },
  printCard: {
    backgroundColor: colors.primary,
  },
  dispatchCard: {
    backgroundColor: '#8B5CF6',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packageIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  packageContent: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  packageMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  packageStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  packageStatusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default CheckerHomeScreen;
