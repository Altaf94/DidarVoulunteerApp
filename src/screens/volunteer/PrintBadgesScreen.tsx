// ============================================
// PRINT BADGES SCREEN
// Screen for selecting and printing volunteer badges
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
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Printer,
  FileText,
  Package,
  CheckSquare,
  Square,
  CheckCircle,
  ChevronRight,
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
  PrintStatus,
  CoveringSheet,
  AccessLevel,
} from '../../types/volunteer';
import {
  getRegionLabel,
  getAccessLevelLabel,
  getAccessLevelColor,
} from '../../constants/volunteerConstants';

type RootStackParamList = {
  CheckerHome: undefined;
  PrintBadges: undefined;
  DispatchPackages: undefined;
};

type PrintBadgesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PrintBadges'
>;

interface Props {
  navigation: PrintBadgesNavigationProp;
}

const PrintBadgesScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showCoveringSheetModal, setShowCoveringSheetModal] = useState(false);
  const [coveringSheets, setCoveringSheets] = useState<CoveringSheet[]>([]);
  const [currentPrintBatchId, setCurrentPrintBatchId] = useState<string | null>(null);

  const {
    volunteers,
    volunteersLoading,
    volunteersTotal,
    selectedVolunteers,
    currentFilters,
    userRegion,
    loadVolunteers,
    loadMoreVolunteers,
    createPrintBatch,
    printBadges,
    generateCoveringSheet,
    selectVolunteer,
    deselectVolunteer,
    selectAllVolunteers,
    deselectAllVolunteers,
    setFilters,
    clearFilters,
  } = useVolunteer();

  const { logout } = useAuth();

  useEffect(() => {
    // Load approved volunteers ready for printing
    loadVolunteers({
      status: VolunteerStatus.APPROVED,
      printStatus: PrintStatus.NOT_PRINTED,
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVolunteers({
      status: VolunteerStatus.APPROVED,
      printStatus: PrintStatus.NOT_PRINTED,
    });
    setRefreshing(false);
  }, []);

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

  const handleToggleSelect = (id: string) => {
    if (selectedVolunteers.includes(id)) {
      deselectVolunteer(id);
    } else {
      selectVolunteer(id);
    }
  };

  const handlePrintBadges = async () => {
    if (selectedVolunteers.length === 0) {
      Alert.alert('No Selection', 'Please select volunteers to print badges');
      return;
    }

    Alert.alert(
      'Print Badges',
      `Print badges for ${selectedVolunteers.length} volunteer(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Print',
          onPress: async () => {
            setIsPrinting(true);
            try {
              // Create print batch
              const batch = await createPrintBatch({
                volunteerIds: selectedVolunteers,
                region: userRegion!,
              });
              
              setCurrentPrintBatchId(batch.id);

              // Print badges
              const result = await printBadges(batch.id);

              Alert.alert(
                'Print Complete',
                `${selectedVolunteers.length} badges printed successfully.\n\nWould you like to generate covering sheets?`,
                [
                  {
                    text: 'Skip',
                    style: 'cancel',
                    onPress: () => {
                      deselectAllVolunteers();
                      onRefresh();
                    },
                  },
                  {
                    text: 'Generate',
                    onPress: () => handleGenerateCoveringSheets(batch.id),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Print Failed', error.message || 'Failed to print badges');
            } finally {
              setIsPrinting(false);
            }
          },
        },
      ]
    );
  };

  const handleGenerateCoveringSheets = async (batchId: string) => {
    try {
      setIsPrinting(true);
      const sheets = await generateCoveringSheet(batchId);
      setCoveringSheets(sheets);
      setShowCoveringSheetModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate covering sheets');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleProceedToDispatch = () => {
    setShowCoveringSheetModal(false);
    deselectAllVolunteers();
    navigation.navigate('DispatchPackages');
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
          {volunteersTotal} ready to print
        </Text>
      </View>

      {/* Filter Bar */}
      <FilterBar
        filters={currentFilters}
        onFiltersChange={setFilters}
        onSearch={() => loadVolunteers(currentFilters)}
        onClear={clearFilters}
        showRegionFilter={!userRegion}
        showStatusFilter={false}
        showPrintStatusFilter={false}
      />

      {/* Batch Info */}
      {selectedVolunteers.length > 0 && (
        <View style={styles.batchInfo}>
          <View style={styles.batchInfoItem}>
            <Text style={styles.batchInfoLabel}>Selected</Text>
            <Text style={styles.batchInfoValue}>{selectedVolunteers.length}</Text>
          </View>
          <View style={styles.batchInfoDivider} />
          <View style={styles.batchInfoItem}>
            <Text style={styles.batchInfoLabel}>Access Levels</Text>
            <Text style={styles.batchInfoValue}>
              {new Set(
                volunteers
                  .filter(v => selectedVolunteers.includes(v.id))
                  .map(v => v.accessLevel)
              ).size}
            </Text>
          </View>
        </View>
      )}
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
      <Printer size={48} color={colors.textMuted} />
      <Text style={styles.emptyText}>No badges to print</Text>
      <Text style={styles.emptySubtext}>
        All approved volunteers have been printed
      </Text>
    </View>
  );

  const renderVolunteerItem = ({ item }: { item: Volunteer }) => (
    <VolunteerCard
      volunteer={item}
      isSelected={selectedVolunteers.includes(item.id)}
      onSelect={handleToggleSelect}
      showCheckbox={true}
      showActions={false}
    />
  );

  // Covering Sheet Modal
  const renderCoveringSheetModal = () => (
    <Modal
      visible={showCoveringSheetModal}
      animationType="slide"
      transparent={true}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Covering Sheets Generated</Text>
          </View>

          <View style={modalStyles.content}>
            <Text style={modalStyles.description}>
              Covering sheets have been generated grouped by access level.
              Each sheet contains the list of volunteers for signature collection.
            </Text>

            {coveringSheets.map((sheet) => (
              <View key={sheet.id} style={modalStyles.sheetCard}>
                <View
                  style={[
                    modalStyles.colorBand,
                    { backgroundColor: sheet.bandColor },
                  ]}
                />
                <View style={modalStyles.sheetContent}>
                  <Text style={modalStyles.sheetTitle}>
                    {getAccessLevelLabel(sheet.accessLevel)}
                  </Text>
                  <Text style={modalStyles.sheetCount}>
                    {sheet.volunteers.length} volunteers
                  </Text>
                </View>
                <TouchableOpacity style={modalStyles.printSheetButton}>
                  <Printer size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={modalStyles.secondaryButton}
              onPress={() => setShowCoveringSheetModal(false)}
            >
              <Text style={modalStyles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.primaryButton}
              onPress={handleProceedToDispatch}
            >
              <Package size={18} color={colors.white} />
              <Text style={modalStyles.primaryButtonText}>Proceed to Dispatch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (volunteersLoading && !refreshing && volunteers.length === 0) {
    return <IsmailiLoader />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Print Badges"
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

      {/* Print Action Bar */}
      {selectedVolunteers.length > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.printButton}
            onPress={handlePrintBadges}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Printer size={20} color={colors.white} />
                <Text style={styles.printButtonText}>
                  Print {selectedVolunteers.length} Badge(s)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {renderCoveringSheetModal()}
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
  batchInfo: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGreen,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  batchInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  batchInfoDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  batchInfoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  batchInfoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
    marginTop: spacing.md,
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
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  printButtonText: {
    fontSize: 16,
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
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorBand: {
    width: 8,
    height: '100%',
  },
  sheetContent: {
    flex: 1,
    padding: spacing.md,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  sheetCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  printSheetButton: {
    padding: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default PrintBadgesScreen;
