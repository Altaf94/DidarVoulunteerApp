// ============================================
// FILTER BAR COMPONENT
// Filter controls for volunteer lists
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  RefreshCw,
} from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';
import {
  Region,
  VolunteerStatus,
  AccessLevel,
  DataSource,
  PrintStatus,
  VolunteerFilters,
} from '../../types/volunteer';
import {
  REGIONS,
  VOLUNTEER_STATUSES,
  ACCESS_LEVELS,
  DATA_SOURCES,
  PRINT_STATUSES,
} from '../../constants/volunteerConstants';
import { EVENTS } from '../../constants/volunteerConstants';
import CustomInput from '../CustomInput/CustomInput';

interface FilterBarProps {
  filters: VolunteerFilters;
  onFiltersChange: (filters: VolunteerFilters) => void;
  onSearch: () => void;
  onClear: () => void;
  showRegionFilter?: boolean;
  showStatusFilter?: boolean;
  showAccessLevelFilter?: boolean;
  showEventFilter?: boolean;
  showSourceFilter?: boolean;
  showPrintStatusFilter?: boolean;
  showSearchInput?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  showRegionFilter = true,
  showStatusFilter = true,
  showAccessLevelFilter = true,
  showEventFilter = true,
  showSourceFilter = false,
  showPrintStatusFilter = false,
  showSearchInput = true,
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<VolunteerFilters>(filters);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value !== undefined && key !== 'page' && key !== 'pageSize'
  ).length;

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setShowFilterModal(false);
    onSearch();
  };

  const handleClearFilters = () => {
    setTempFilters({ page: 1, pageSize: 20 });
    onClear();
    setShowFilterModal(false);
  };

  const updateTempFilter = (key: keyof VolunteerFilters, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  return (
    <View style={styles.container}>
      {/* Quick Search */}
      {showSearchInput && (
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color={colors.textMuted} />
            <CustomInput
              placeholder="Search by CNIC or Name..."
              value={filters.cnic || filters.name || ''}
              onChangeText={(text) => {
                // Detect if input is CNIC format or name
                if (/^[0-9-]+$/.test(text)) {
                  onFiltersChange({ ...filters, cnic: text, name: undefined });
                } else {
                  onFiltersChange({ ...filters, name: text, cnic: undefined });
                }
              }}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={18} color={activeFiltersCount > 0 ? colors.white : colors.primary} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {filters.region && (
            <FilterChip
              label={`Region: ${REGIONS.find(r => r.value === filters.region)?.label}`}
              onRemove={() => onFiltersChange({ ...filters, region: undefined })}
            />
          )}
          {filters.status && (
            <FilterChip
              label={`Status: ${VOLUNTEER_STATUSES.find(s => s.value === filters.status)?.label}`}
              onRemove={() => onFiltersChange({ ...filters, status: undefined })}
            />
          )}
          {filters.eventId && (
            <FilterChip
              label={`Event: ${EVENTS.find(e => e.id === filters.eventId)?.name}`}
              onRemove={() => onFiltersChange({ ...filters, eventId: undefined })}
            />
          )}
          {filters.accessLevel && (
            <FilterChip
              label={`Access: ${ACCESS_LEVELS.find(a => a.value === filters.accessLevel)?.label}`}
              onRemove={() => onFiltersChange({ ...filters, accessLevel: undefined })}
            />
          )}
          <TouchableOpacity style={styles.clearAllChip} onPress={onClear}>
            <RefreshCw size={14} color={colors.error} />
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Volunteers</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Region Filter */}
              {showRegionFilter && (
                <FilterSection
                  title="Region"
                  options={REGIONS.map(r => ({ value: r.value, label: r.label }))}
                  selected={tempFilters.region}
                  onSelect={(value) => updateTempFilter('region', value)}
                />
              )}

              {/* Status Filter */}
              {showStatusFilter && (
                <FilterSection
                  title="Status"
                  options={VOLUNTEER_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                  selected={tempFilters.status}
                  onSelect={(value) => updateTempFilter('status', value)}
                />
              )}

              {/* Event Filter */}
              {showEventFilter && (
                <FilterSection
                  title="Event"
                  options={EVENTS.map(e => ({ value: e.id, label: e.name }))}
                  selected={tempFilters.eventId}
                  onSelect={(value) => updateTempFilter('eventId', value)}
                />
              )}

              {/* Access Level Filter */}
              {showAccessLevelFilter && (
                <FilterSection
                  title="Access Level"
                  options={ACCESS_LEVELS.map(a => ({ value: a.value, label: a.label }))}
                  selected={tempFilters.accessLevel}
                  onSelect={(value) => updateTempFilter('accessLevel', value)}
                />
              )}

              {/* Source Filter */}
              {showSourceFilter && (
                <FilterSection
                  title="Data Source"
                  options={DATA_SOURCES.map(s => ({ value: s.value, label: s.label }))}
                  selected={tempFilters.source}
                  onSelect={(value) => updateTempFilter('source', value)}
                />
              )}

              {/* Print Status Filter */}
              {showPrintStatusFilter && (
                <FilterSection
                  title="Print Status"
                  options={PRINT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                  selected={tempFilters.printStatus}
                  onSelect={(value) => updateTempFilter('printStatus', value)}
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// FILTER SECTION COMPONENT
// ============================================

interface FilterSectionProps {
  title: string;
  options: { value: any; label: string }[];
  selected: any;
  onSelect: (value: any) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selected,
  onSelect,
}) => {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value)}
            style={[
              sectionStyles.option,
              selected === option.value && sectionStyles.optionSelected,
            ]}
            onPress={() => onSelect(selected === option.value ? undefined : option.value)}
          >
            <Text
              style={[
                sectionStyles.optionText,
                selected === option.value && sectionStyles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================
// FILTER CHIP COMPONENT
// ============================================

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <View style={chipStyles.container}>
      <Text style={chipStyles.label}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={chipStyles.removeButton}>
        <X size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  chipsContainer: {
    marginTop: spacing.sm,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  clearAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.badgeRed.bg,
    borderRadius: borderRadius.full,
  },
  clearAllText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
});

const chipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGreen,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
});

export default FilterBar;
