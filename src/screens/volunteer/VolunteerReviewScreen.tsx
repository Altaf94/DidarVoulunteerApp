// ============================================
// VOLUNTEER REVIEW SCREEN
// Screen for reviewing, approving, and rejecting volunteers
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import {
  CheckCircle,
  XCircle,
  Send,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import Header from '../../components/Header/Header';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import VolunteerCard from '../../components/volunteer/VolunteerCard';
import FilterBar from '../../components/volunteer/FilterBar';
import { colors, spacing, borderRadius } from '../../theme';
import { useVolunteer } from '../../context/VolunteerContext';
import { useAuth } from '../../context/AuthContext';
import {
  Volunteer,
  VolunteerStatus,
  VolunteerFilters,
} from '../../types/volunteer';
import { getRegionLabel, getStatusConfig } from '../../constants/volunteerConstants';

type RootStackParamList = {
  MakerHome: undefined;
  VolunteerReview: { batchId?: string; status?: VolunteerStatus };
  VolunteerDetail: { volunteerId: string };
};

type VolunteerReviewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VolunteerReview'
>;

type VolunteerReviewRouteProp = RouteProp<RootStackParamList, 'VolunteerReview'>;

interface Props {
  navigation: VolunteerReviewNavigationProp;
  route: VolunteerReviewRouteProp;
}

const VolunteerReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { batchId, status } = route.params || {};
  
  const [refreshing, setRefreshing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    volunteers,
    volunteersLoading,
    volunteersTotal,
    selectedVolunteers,
    currentFilters,
    userRegion,
    loadVolunteers,
    loadMoreVolunteers,
    approveVolunteers,
    submitVolunteers,
    selectVolunteer,
    deselectVolunteer,
    selectAllVolunteers,
    deselectAllVolunteers,
    setFilters,
    clearFilters,
  } = useVolunteer();

  const { logout } = useAuth();

  useEffect(() => {
    // Initialize filters based on route params
    const initialFilters: VolunteerFilters = {};
    if (batchId) initialFilters.uploadBatchId = batchId;
    if (status) initialFilters.status = status;
    
    loadVolunteers(initialFilters);
  }, [batchId, status]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVolunteers(currentFilters);
    setRefreshing(false);
  }, [currentFilters]);

  const handleLoadMore = () => {
    if (!volunteersLoading && volunteers.length < volunteersTotal) {
      loadMoreVolunteers();
    }
  };

  const handleSelectAll = () => {
    if (selectedVolunteers.length === volunteers.length) {
      deselectAllVolunteers();
    } else {
      selectAllVolunteers();
    }
  };

  const handleApprove = async (volunteerId?: string) => {
    const idsToApprove = volunteerId ? [volunteerId] : selectedVolunteers;
    
    if (idsToApprove.length === 0) {
      Alert.alert('No Selection', 'Please select volunteers to approve');
      return;
    }

    Alert.alert(
      'Approve Volunteers',
      `Are you sure you want to approve ${idsToApprove.length} volunteer(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await approveVolunteers({
                volunteerIds: idsToApprove,
                action: 'approve',
              });
              Alert.alert('Success', `${idsToApprove.length} volunteer(s) approved`);
              onRefresh();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (volunteerId?: string) => {
    const idsToReject = volunteerId ? [volunteerId] : selectedVolunteers;
    
    if (idsToReject.length === 0) {
      Alert.alert('No Selection', 'Please select volunteers to reject');
      return;
    }

    Alert.alert(
      'Reject Volunteers',
      `Are you sure you want to reject ${idsToReject.length} volunteer(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await approveVolunteers({
                volunteerIds: idsToReject,
                action: 'reject',
                reason: rejectReason || undefined,
              });
              Alert.alert('Success', `${idsToReject.length} volunteer(s) rejected`);
              setRejectReason('');
              onRefresh();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Get approved volunteers for submission
    const approvedVolunteers = volunteers.filter(
      v => v.status === VolunteerStatus.APPROVED || v.status === VolunteerStatus.VALID
    );

    if (approvedVolunteers.length === 0) {
      Alert.alert('No Records', 'No approved records available for submission');
      return;
    }

    Alert.alert(
      'Submit to Checker',
      `Submit ${approvedVolunteers.length} volunteer(s) for final approval?\n\n` +
      'This will generate Volunteer IDs and send records to the Checker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await submitVolunteers(approvedVolunteers.map(v => v.id));
              Alert.alert('Success', 'Records submitted to Checker');
              onRefresh();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to submit');
            }
          },
        },
      ]
    );
  };

  const handleToggleSelect = (id: string) => {
    if (selectedVolunteers.includes(id)) {
      deselectVolunteer(id);
    } else {
      selectVolunteer(id);
    }
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Selection Header */}
      <View style={styles.selectionHeader}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectAll}
        >
          {selectedVolunteers.length === volunteers.length && volunteers.length > 0 ? (
            <CheckSquare size={20} color={colors.primary} />
          ) : (
            <Square size={20} color={colors.textMuted} />
          )}
          <Text style={styles.selectAllText}>
            {selectedVolunteers.length > 0
              ? `${selectedVolunteers.length} selected`
              : 'Select all'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.totalText}>
          {volunteersTotal} total records
        </Text>
      </View>

      {/* Filter Bar */}
      <FilterBar
        filters={currentFilters}
        onFiltersChange={setFilters}
        onSearch={() => loadVolunteers(currentFilters)}
        onClear={clearFilters}
        showRegionFilter={!userRegion}
      />
    </View>
  );

  const renderFooter = () => {
    if (!volunteersLoading) return null;
    return (
      <View style={styles.loadingMore}>
        <IsmailiLoader />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No volunteers found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your filters or upload new data
      </Text>
    </View>
  );

  const renderVolunteerItem = ({ item }: { item: Volunteer }) => (
    <VolunteerCard
      volunteer={item}
      isSelected={selectedVolunteers.includes(item.id)}
      onSelect={handleToggleSelect}
      showCheckbox={true}
      showActions={item.status === VolunteerStatus.VALID || item.status === VolunteerStatus.DISCREPANT}
      onApprove={() => handleApprove(item.id)}
      onReject={() => handleReject(item.id)}
    />
  );

  const screenTitle = status
    ? `${getStatusConfig(status).label} Records`
    : 'Review Volunteers';

  return (
    <View style={styles.container}>
      <Header
        title={screenTitle}
        subtitle={userRegion ? getRegionLabel(userRegion) : 'All Regions'}
        onLogout={logout}
      />

      <FlatList
        data={volunteers}
        keyExtractor={(item) => item.id}
        renderItem={renderVolunteerItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!volunteersLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Bottom Action Bar */}
      {selectedVolunteers.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveBtn]}
            onPress={() => handleApprove()}
          >
            <CheckCircle size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectBtn]}
            onPress={() => handleReject()}
          >
            <XCircle size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit Button */}
      {selectedVolunteers.length === 0 && volunteers.some(v => 
        v.status === VolunteerStatus.APPROVED || v.status === VolunteerStatus.VALID
      ) && (
        <View style={styles.submitBar}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Send size={20} color={colors.white} />
            <Text style={styles.submitBtnText}>Submit to Checker</Text>
          </TouchableOpacity>
        </View>
      )}
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  totalText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  loadingMore: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default VolunteerReviewScreen;
