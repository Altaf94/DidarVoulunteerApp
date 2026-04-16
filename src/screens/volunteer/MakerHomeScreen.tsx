// ============================================
// MAKER HOME SCREEN
// Main screen for Maker role - Upload, Review, Submit
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
  Upload,
  FileCheck,
  AlertTriangle,
  Send,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';
import Header from '../../components/Header/Header';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import { SummaryCard } from '../../components/volunteer/StatsCard';
import { colors, spacing, borderRadius } from '../../theme';
import { useVolunteer } from '../../context/VolunteerContext';
import { useAuth } from '../../context/AuthContext';
import {
  VolunteerStatus,
  UploadBatch,
} from '../../types/volunteer';
import { getRegionLabel } from '../../constants/volunteerConstants';

type RootStackParamList = {
  MakerHome: undefined;
  VolunteerUpload: undefined;
  VolunteerReview: { batchId?: string; status?: VolunteerStatus };
  VolunteerDetail: { volunteerId: string };
};

type MakerHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MakerHome'
>;

interface Props {
  navigation: MakerHomeNavigationProp;
}

const MakerHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    volunteers,
    volunteersLoading,
    uploadBatches,
    uploadBatchesLoading,
    userRegion,
    loadVolunteers,
    loadUploadBatches,
  } = useVolunteer();

  const { logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadVolunteers(),
      loadUploadBatches(),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Calculate statistics
  const validCount = volunteers.filter(v => v.status === VolunteerStatus.VALID).length;
  const discrepantCount = volunteers.filter(v => v.status === VolunteerStatus.DISCREPANT).length;
  const pendingCount = volunteers.filter(v => v.status === VolunteerStatus.PENDING).length;
  const submittedCount = volunteers.filter(v => v.status === VolunteerStatus.SUBMITTED).length;

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('VolunteerReview', { status: VolunteerStatus.VALID })}
        >
          <SummaryCard
            title="Valid Records"
            value={validCount}
            icon={<CheckCircle size={24} color={colors.success} />}
            color={colors.success}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('VolunteerReview', { status: VolunteerStatus.DISCREPANT })}
        >
          <SummaryCard
            title="Discrepant"
            value={discrepantCount}
            icon={<AlertTriangle size={24} color="#F59E0B" />}
            color="#F59E0B"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.summaryRow}>
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('VolunteerReview', { status: VolunteerStatus.PENDING })}
        >
          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={<Clock size={24} color={colors.info} />}
            color={colors.info}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.summaryCardWrapper}
          onPress={() => navigation.navigate('VolunteerReview', { status: VolunteerStatus.SUBMITTED })}
        >
          <SummaryCard
            title="Submitted"
            value={submittedCount}
            icon={<Send size={24} color={colors.primary} />}
            color={colors.primary}
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
          style={[styles.actionCard, styles.uploadCard]}
          onPress={() => navigation.navigate('VolunteerUpload')}
        >
          <Upload size={32} color={colors.white} />
          <Text style={styles.actionTitle}>Upload Data</Text>
          <Text style={styles.actionSubtitle}>Import Excel file</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.reviewCard]}
          onPress={() => navigation.navigate('VolunteerReview', {})}
        >
          <FileCheck size={32} color={colors.white} />
          <Text style={styles.actionTitle}>Review Records</Text>
          <Text style={styles.actionSubtitle}>Approve or reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentBatches = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {uploadBatches.length === 0 ? (
        <View style={styles.emptyState}>
          <FileSpreadsheet size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>No uploads yet</Text>
          <Text style={styles.emptySubtext}>
            Upload your first Excel file to get started
          </Text>
        </View>
      ) : (
        uploadBatches.slice(0, 5).map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            onPress={() => navigation.navigate('VolunteerReview', { batchId: batch.id })}
          />
        ))
      )}
    </View>
  );

  if (volunteersLoading && !refreshing) {
    return <IsmailiLoader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Maker Dashboard"
        subtitle={userRegion ? getRegionLabel(userRegion) : 'All Regions'}
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
        {renderRecentBatches()}
      </ScrollView>
    </View>
  );
};

// ============================================
// BATCH CARD COMPONENT
// ============================================

interface BatchCardProps {
  batch: UploadBatch;
  onPress: () => void;
}

const BatchCard: React.FC<BatchCardProps> = ({ batch, onPress }) => {
  const statusColor = batch.status === 'completed' ? colors.success : 
    batch.status === 'processing' ? colors.warning : colors.error;

  return (
    <TouchableOpacity style={batchStyles.container} onPress={onPress}>
      <View style={batchStyles.iconContainer}>
        <FileSpreadsheet size={24} color={colors.primary} />
      </View>
      <View style={batchStyles.content}>
        <Text style={batchStyles.fileName} numberOfLines={1}>
          {batch.fileName}
        </Text>
        <Text style={batchStyles.meta}>
          {getRegionLabel(batch.region)} • {new Date(batch.createdAt).toLocaleDateString()}
        </Text>
        <View style={batchStyles.stats}>
          <Text style={[batchStyles.stat, { color: colors.success }]}>
            ✓ {batch.validRecords}
          </Text>
          <Text style={[batchStyles.stat, { color: colors.error }]}>
            ✗ {batch.rejectedRecords}
          </Text>
          <Text style={[batchStyles.stat, { color: '#F59E0B' }]}>
            ⚠ {batch.discrepantRecords}
          </Text>
        </View>
      </View>
      <View style={[batchStyles.statusBadge, { backgroundColor: statusColor + '20' }]}>
        <Text style={[batchStyles.statusText, { color: statusColor }]}>
          {batch.status}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </TouchableOpacity>
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
  },
  actionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  uploadCard: {
    backgroundColor: colors.primary,
  },
  reviewCard: {
    backgroundColor: colors.info,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.md,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

const batchStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default MakerHomeScreen;
