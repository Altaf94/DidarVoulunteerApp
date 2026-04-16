// ============================================
// DISPATCH PACKAGES SCREEN
// Screen for managing dispatch packages
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
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  ChevronRight,
  Plus,
  Send,
} from 'lucide-react-native';
import Header from '../../components/Header/Header';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import { colors, spacing, borderRadius } from '../../theme';
import { useVolunteer } from '../../context/VolunteerContext';
import { useAuth } from '../../context/AuthContext';
import {
  DispatchPackage,
  PrintStatus,
  DataSource,
} from '../../types/volunteer';
import {
  getRegionLabel,
  getDataSourceLabel,
  DATA_SOURCES,
} from '../../constants/volunteerConstants';

type RootStackParamList = {
  CheckerHome: undefined;
  DispatchPackages: undefined;
};

type DispatchPackagesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DispatchPackages'
>;

interface Props {
  navigation: DispatchPackagesNavigationProp;
}

const DispatchPackagesScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DataSource | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    dispatchPackages,
    dispatchPackagesLoading,
    volunteers,
    printBatches,
    userRegion,
    loadDispatchPackages,
    prepareDispatchPackage,
    dispatchPackage,
  } = useVolunteer();

  const { logout } = useAuth();

  useEffect(() => {
    loadDispatchPackages();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDispatchPackages();
    setRefreshing(false);
  }, []);

  const handleCreatePackage = async () => {
    if (!selectedDestination) {
      Alert.alert('Select Destination', 'Please select a destination for the package');
      return;
    }

    setIsCreating(true);
    try {
      // Get printed batches that haven't been dispatched
      const printedBatchIds = printBatches
        .filter(b => b.status === 'completed')
        .map(b => b.id);

      if (printedBatchIds.length === 0) {
        Alert.alert('No Batches', 'No printed batches available for dispatch');
        setIsCreating(false);
        return;
      }

      const pkg = await prepareDispatchPackage({
        printBatchIds: printedBatchIds,
        destination: selectedDestination,
        destinationEntityId: 'default-entity',
      });

      Alert.alert('Package Created', `Package ${pkg.id} created successfully`);
      setShowCreateModal(false);
      setSelectedDestination(null);
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create package');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDispatch = async (packageId: string) => {
    Alert.alert(
      'Dispatch Package',
      'Are you sure you want to dispatch this package?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch',
          onPress: async () => {
            try {
              await dispatchPackage(packageId);
              Alert.alert('Success', 'Package dispatched successfully');
              onRefresh();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to dispatch');
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <CheckCircle size={20} color={colors.success} />;
      case 'ready':
        return <Truck size={20} color={colors.info} />;
      default:
        return <Clock size={20} color={colors.warning} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return colors.success;
      case 'ready':
        return colors.info;
      case 'received':
        return '#8B5CF6';
      default:
        return colors.warning;
    }
  };

  const renderPackageCard = ({ item }: { item: DispatchPackage }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.packageCard}>
        {/* Status Strip */}
        <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />

        <View style={styles.packageContent}>
          {/* Header */}
          <View style={styles.packageHeader}>
            <View style={styles.packageTitleRow}>
              <Package size={20} color={colors.primary} />
              <Text style={styles.packageId}>PKG-{item.id.slice(-6).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              {getStatusIcon(item.status)}
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View style={styles.destinationRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.destinationText}>
              {item.destinationEntityName}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.totalBadges}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.totalBands}</Text>
              <Text style={styles.statLabel}>Bands</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.coveringSheetIds.length}</Text>
              <Text style={styles.statLabel}>Sheets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getRegionLabel(item.region).slice(0, 3)}</Text>
              <Text style={styles.statLabel}>Region</Text>
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.timestampRow}>
            <Text style={styles.timestamp}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.dispatchedAt && (
              <Text style={styles.timestamp}>
                Dispatched: {new Date(item.dispatchedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Action Button */}
          {(item.status === 'preparing' || item.status === 'ready') && (
            <TouchableOpacity
              style={styles.dispatchButton}
              onPress={() => handleDispatch(item.id)}
            >
              <Send size={18} color={colors.white} />
              <Text style={styles.dispatchButtonText}>Dispatch Package</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Package size={48} color={colors.textMuted} />
      <Text style={styles.emptyText}>No packages yet</Text>
      <Text style={styles.emptySubtext}>
        Create a new package after printing badges
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Plus size={18} color={colors.white} />
        <Text style={styles.createButtonText}>Create Package</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerStats}>
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>
            {dispatchPackages.filter(p => p.status === 'preparing').length}
          </Text>
          <Text style={styles.headerStatLabel}>Preparing</Text>
        </View>
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>
            {dispatchPackages.filter(p => p.status === 'ready').length}
          </Text>
          <Text style={styles.headerStatLabel}>Ready</Text>
        </View>
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>
            {dispatchPackages.filter(p => p.status === 'dispatched').length}
          </Text>
          <Text style={styles.headerStatLabel}>Dispatched</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.newPackageButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Plus size={20} color={colors.white} />
        <Text style={styles.newPackageButtonText}>New Package</Text>
      </TouchableOpacity>
    </View>
  );

  // Create Package Modal
  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Create Dispatch Package</Text>
          </View>

          <View style={modalStyles.content}>
            <Text style={modalStyles.label}>Select Destination</Text>
            <View style={modalStyles.optionsContainer}>
              {DATA_SOURCES.map((source) => (
                <TouchableOpacity
                  key={source.value}
                  style={[
                    modalStyles.option,
                    selectedDestination === source.value && modalStyles.optionSelected,
                  ]}
                  onPress={() => setSelectedDestination(source.value)}
                >
                  <Text
                    style={[
                      modalStyles.optionText,
                      selectedDestination === source.value && modalStyles.optionTextSelected,
                    ]}
                  >
                    {source.label}
                  </Text>
                  <Text style={modalStyles.optionDesc}>{source.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.summary}>
              <Text style={modalStyles.summaryTitle}>Package Contents</Text>
              <View style={modalStyles.summaryRow}>
                <Text style={modalStyles.summaryLabel}>Print Batches:</Text>
                <Text style={modalStyles.summaryValue}>
                  {printBatches.filter(b => b.status === 'completed').length}
                </Text>
              </View>
              <View style={modalStyles.summaryRow}>
                <Text style={modalStyles.summaryLabel}>Total Badges:</Text>
                <Text style={modalStyles.summaryValue}>
                  {volunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length}
                </Text>
              </View>
            </View>
          </View>

          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={modalStyles.cancelButton}
              onPress={() => {
                setShowCreateModal(false);
                setSelectedDestination(null);
              }}
            >
              <Text style={modalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.createButton,
                !selectedDestination && modalStyles.createButtonDisabled,
              ]}
              onPress={handleCreatePackage}
              disabled={!selectedDestination || isCreating}
            >
              {isCreating ? (
                <IsmailiLoader />
              ) : (
                <>
                  <Package size={18} color={colors.white} />
                  <Text style={modalStyles.createButtonText}>Create Package</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (dispatchPackagesLoading && !refreshing && dispatchPackages.length === 0) {
    return <IsmailiLoader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Dispatch Packages"
        subtitle={userRegion ? getRegionLabel(userRegion) : 'All Regions'}
        onLogout={logout}
      />

      <FlatList
        data={dispatchPackages}
        keyExtractor={(item) => item.id}
        renderItem={renderPackageCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!dispatchPackagesLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {renderCreateModal()}
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
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  headerStatLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  newPackageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  newPackageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  packageCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusStrip: {
    width: 6,
  },
  packageContent: {
    flex: 1,
    padding: spacing.lg,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  packageId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  destinationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dispatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  dispatchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  option: {
    padding: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundGreen,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  summary: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  createButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default DispatchPackagesScreen;
