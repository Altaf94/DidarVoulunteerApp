import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import Alert from '../../components/Alert/Alert';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import CustomModal from '../../components/CustomModal/CustomModal';
import { colors } from '../../theme';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { tokenService } from '../../services/tokenService';
import { FormData, FamilyMember, LookupData } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  UserManagement: undefined;
  ApplicationView: { formData: FormData };
};

type ApplicationViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ApplicationView'
>;

type ApplicationViewRouteProp = RouteProp<RootStackParamList, 'ApplicationView'>;

interface Props {
  navigation: ApplicationViewNavigationProp;
  route: ApplicationViewRouteProp;
}

// Helper functions
const currency = (n: number) =>
  `PKR ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const getLookupDisplay = (
  lookupData: LookupData | null | undefined,
  lookupTableName: string,
  id: number,
  fallback: string = 'Unknown'
) => {
  if (!lookupData || !lookupData[lookupTableName]) {
    return fallback;
  }
  const item = lookupData[lookupTableName].find(item => item.Id === id);
  return item?.Name || fallback;
};

// Badge Component
const Badge: React.FC<{
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue';
  children: React.ReactNode;
}> = ({ color = 'gray', children }) => {
  const colorMap = {
    gray: { bg: colors.badgeGray.bg, fg: colors.badgeGray.fg },
    green: { bg: colors.badgeGreen.bg, fg: colors.badgeGreen.fg },
    yellow: { bg: colors.badgeYellow.bg, fg: colors.badgeYellow.fg },
    red: { bg: colors.badgeRed.bg, fg: colors.badgeRed.fg },
    blue: { bg: colors.badgeBlue.bg, fg: colors.badgeBlue.fg },
  };
  const c = colorMap[color];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{children}</Text>
    </View>
  );
};

// Card Component
const Card: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={styles.card}>
    {title && (
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    )}
    <View style={styles.cardBody}>{children}</View>
  </View>
);

// Row Component
const Row: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowValueContainer}>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

// Member Block Component
const MemberBlock: React.FC<{
  person: FamilyMember;
  lookupData?: LookupData | null;
}> = ({ person, lookupData }) => {
  const getGenderDisplay = (genderId: number) =>
    getLookupDisplay(lookupData, 'Genders', genderId, 'Other');
  const getRelationDisplay = (relationId: number) =>
    getLookupDisplay(lookupData, 'RelationshipsToHead', relationId, 'Other');
  const getMaritalStatusDisplay = (maritalId: number) =>
    getLookupDisplay(lookupData, 'MaritalStatuses', maritalId, 'Single');

  const formatDate = (monthYear: string) => {
    try {
      if (!monthYear || monthYear?.trim() === '') return 'Not specified';
      const [month, year] = monthYear.split('-');
      if (!month || !year) return 'Invalid date';
      const date = new Date(parseInt(year), parseInt(month) - 1);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    } catch {
      return 'Invalid date';
    }
  };

  const calculateAge = (monthYear: string) => {
    try {
      if (!monthYear || monthYear?.trim() === '') return 'Unknown';
      const [month, year] = monthYear.split('-');
      if (!month || !year) return 'Unknown';
      const birthDate = new Date(parseInt(year), parseInt(month) - 1);
      if (isNaN(birthDate.getTime())) return 'Unknown';
      const today = new Date();
      let ageInYears = today.getFullYear() - birthDate.getFullYear();
      if (ageInYears < 0) return 'Unknown';
      return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <View style={styles.memberBlock}>
      <Card>
        <View style={styles.memberHeader}>
          <Text style={styles.memberRelation}>
            {getRelationDisplay(person.RelationshipToHeadId)}
          </Text>
        </View>

        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{person.FullName}</Text>
          <Badge color="gray">{getGenderDisplay(person.GenderId)}</Badge>
          <Badge color="red">
            {getMaritalStatusDisplay(person.MaritalStatusId)}
          </Badge>
        </View>

        <View style={styles.memberMeta}>
          <Text style={styles.metaText}>CNIC: {person.IdNumber}</Text>
          <Text style={styles.metaText}>
            {formatDate(person.MonthYearOfBirth)} • {calculateAge(person.MonthYearOfBirth)}
          </Text>
        </View>

        <View style={styles.memberDetails}>
          <Row label="Mobile" value={person.MobileNumber} />
          <Row
            label="Ismaili"
            value={person.CommunityAffiliation ? 'Yes' : 'No'}
          />
          <Row
            label="Bank"
            value={
              person.BankTypeId
                ? getLookupDisplay(lookupData, 'BankTypes', person.BankTypeId, 'Unknown')
                : 'No'
            }
          />
          <Row
            label="Insurance"
            value={person.HealthInsurance ? 'Yes' : 'No'}
          />
        </View>
      </Card>

      {/* Education Section */}
      <View style={styles.sectionCard}>
        <View style={[styles.sectionBorder, { borderLeftColor: '#ED6F15' }]}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.sectionContent}>
            {person.IsStudying
              ? [
                  person.SchoolTypeId &&
                    getLookupDisplay(lookupData, 'SchoolTypes', person.SchoolTypeId),
                  person.SchoolName,
                  person.LevelId &&
                    getLookupDisplay(lookupData, 'Levels', person.LevelId),
                  person.GradeId &&
                    getLookupDisplay(lookupData, 'Grades', person.GradeId),
                  person.Degree,
                  person.Fees && person.Fees > 0 && currency(person.Fees),
                ]
                  .filter(Boolean)
                  .join(' • ') || 'Studying'
              : person.NotStudyingReasonId
              ? getLookupDisplay(
                  lookupData,
                  'NotStudyingReasons',
                  person.NotStudyingReasonId
                )
              : 'Not Studying'}
          </Text>
        </View>
      </View>

      {/* Employment Section */}
      <View style={styles.sectionCard}>
        <View style={[styles.sectionBorder, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.sectionTitle}>
            {person.EarningStatus ? 'Employed' : 'Not Employed'}
          </Text>
          <Text style={styles.sectionContent}>
            {person.EarningStatus
              ? [
                  person.OccupationTypeId &&
                    getLookupDisplay(
                      lookupData,
                      'OccupationTypes',
                      person.OccupationTypeId
                    ),
                  person.EmploymentTypeId &&
                    getLookupDisplay(
                      lookupData,
                      'EmploymentTypes',
                      person.EmploymentTypeId
                    ),
                  person.Industry,
                  person.IncomeBandId &&
                    getLookupDisplay(lookupData, 'IncomeBands', person.IncomeBandId),
                ]
                  .filter(Boolean)
                  .join(' • ') || 'Employed'
              : person.NoEarningReasonId
              ? getLookupDisplay(
                  lookupData,
                  'NoEarningReasons',
                  person.NoEarningReasonId,
                  'Not specified'
                )
              : 'Not specified'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ApplicationViewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { formData } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertReason, setRevertReason] = useState('');

  const { alert, showError, showSuccess, hideAlert } = useAlert();
  const { userRole } = useAuth();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      navigation.replace('Login');
      return;
    }
    fetchLookupData();
  };

  const fetchLookupData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('lookupTables');
      if (storedData) {
        setLookupData(JSON.parse(storedData));
        return;
      }

      const data = await apiService.getAllLookupTables();
      setLookupData(data);
      await AsyncStorage.setItem('lookupTables', JSON.stringify(data));
    } catch (err) {
      console.error('Lookup data fetch error:', err);
    }
  };

  const handleApprove = async () => {
    if (!formData?.FormId) {
      showError('Error', 'Form ID not found');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.updateFormStatus(
        formData.FormId,
        3, // Approved status
        formData.JamatKhanaId
      );
      showSuccess('Success', 'Form approved successfully!');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      showError('Error', error.message || 'Failed to approve form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = () => {
    setShowRevertModal(true);
  };

  const handleRevertConfirm = async () => {
    if (!formData?.FormId) {
      showError('Error', 'Form ID not found');
      return;
    }

    if (!revertReason?.trim()) {
      showError('Error', 'Please provide a reason for reverting');
      return;
    }

    setShowRevertModal(false);
    setIsLoading(true);

    try {
      await apiService.updateFormStatus(
        formData.FormId,
        4, // Rejected status
        formData.JamatKhanaId,
        revertReason
      );
      showSuccess('Success', 'Form reverted successfully!');
      setRevertReason('');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      showError('Error', error.message || 'Failed to revert form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  if (!formData) {
    return (
      <View style={styles.container}>
        <Header title="Welcome to MHIP" onLogout={handleLogout} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No form data available</Text>
          <Text style={styles.emptySubtitle}>
            Please navigate back and try again.
          </Text>
        </View>
      </View>
    );
  }

  const memberCount = formData.FamilyMembers.length;

  return (
    <View style={styles.container}>
      <IsmailiLoader visible={isLoading} />

      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        autoClose
        autoCloseDelay={15000}
      />

      <Header title="Welcome to MHIP" onLogout={handleLogout} />

      <ScrollView style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.pageTitle}>Review Application</Text>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <Card>
              <View style={styles.formIdContainer}>
                <Text style={styles.formId}>{formData.FormId}</Text>
                {formData.JamatKhanaId && (
                  <Badge color="blue">{formData.JamatKhanaId}</Badge>
                )}
              </View>
              <View style={styles.infoRows}>
                <Row
                  label="House"
                  value={formData.HouseOwnership ? 'Yes' : 'No'}
                />
                <Row
                  label="In Pakistan"
                  value={formData.FamilyMembers?.length || 0}
                />
                <Row
                  label="Outside Pakistan"
                  value={formData.FamilyMembersOutsidePakistan}
                />
              </View>
            </Card>

            <Card title="Family Income">
              {formData.FamilyIncomeSourcesIds &&
              formData.FamilyIncomeSourcesIds.length > 0 ? (
                <View>
                  <Text style={styles.incomeSourcesText}>
                    {formData.FamilyIncomeSourcesIds.map(sourceId =>
                      getLookupDisplay(
                        lookupData,
                        'FamilyIncomeStatus',
                        sourceId,
                        `Source ID: ${sourceId}`
                      )
                    ).join(' | ')}
                  </Text>
                  <Row
                    label="Total Income"
                    value={
                      formData.IncomeBandId
                        ? getLookupDisplay(
                            lookupData,
                            'IncomeBands',
                            formData.IncomeBandId,
                            'No value specified'
                          )
                        : 'No value specified'
                    }
                  />
                </View>
              ) : (
                <Text style={styles.noDataText}>No income sources specified</Text>
              )}
            </Card>

            <Card title="Family CNICs in Pakistan">
              <View style={styles.cnicContainer}>
                {formData.FamilyMembers?.filter(m => m.IdNumber).map(
                  (member, idx) => (
                    <Badge key={idx} color="gray">
                      {member.IdNumber}
                    </Badge>
                  )
                )}
                {!formData.FamilyMembers?.some(m => m.IdNumber) && (
                  <Text style={styles.noDataText}>No CNICs specified</Text>
                )}
              </View>
            </Card>
          </View>

          {/* Family Members */}
          <View style={styles.membersSection}>
            <View style={styles.membersSectionHeader}>
              <Text style={styles.membersSectionTitle}>
                Family Member Detail
              </Text>
              <Text style={styles.memberCount}>
                Total Members: {memberCount}
              </Text>
            </View>

            {formData.FamilyMembers.map((member, idx) => (
              <View key={`${member.Id}-${idx}`}>
                <MemberBlock person={member} lookupData={lookupData} />
                {idx < formData.FamilyMembers.length - 1 && (
                  <View style={styles.memberDivider} />
                )}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          {(userRole === 2 || userRole === 3) && formData.FormStatus !== 4 && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.revertButton}
                onPress={handleRevert}
                disabled={isLoading}>
                <Text style={styles.revertButtonText}>Revert</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApprove}
                disabled={isLoading}>
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Revert Modal */}
      <CustomModal
        show={showRevertModal}
        onClose={() => {
          setShowRevertModal(false);
          setRevertReason('');
        }}
        size="lg"
        title="Reason for Rejection">
        <View style={styles.revertModalContent}>
          <Text style={styles.revertLabel}>Comments</Text>
          <TextInput
            style={styles.revertInput}
            placeholder="Enter your details here.."
            value={revertReason}
            onChangeText={setRevertReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.revertModalButtons}>
            <TouchableOpacity
              style={styles.cancelRevertButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelRevertButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmRevertButton,
                !revertReason?.trim() && styles.confirmRevertButtonDisabled,
              ]}
              onPress={handleRevertConfirm}
              disabled={!revertReason?.trim()}>
              <Text style={styles.confirmRevertButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    backgroundColor: colors.backgroundGreen,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoCards: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  cardBody: {
    padding: 12,
  },
  formIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  formId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoRows: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: 8,
  },
  rowValueContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  incomeSourcesText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cnicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  membersSection: {
    marginBottom: 24,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membersSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  memberCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  memberBlock: {
    gap: 8,
  },
  memberHeader: {
    marginBottom: 8,
  },
  memberRelation: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  memberMeta: {
    gap: 4,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  memberDetails: {
    gap: 4,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionBorder: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    color: colors.textMuted,
  },
  memberDivider: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    borderStyle: 'dashed',
    marginVertical: 16,
    opacity: 0.4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  revertButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: 'rgba(234, 69, 53, 0.1)',
  },
  revertButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.errorLight,
  },
  approveButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  revertModalContent: {
    paddingTop: 8,
  },
  revertLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  revertInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
    backgroundColor: colors.white,
  },
  revertModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 16,
  },
  cancelRevertButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  cancelRevertButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  confirmRevertButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.errorLight,
  },
  confirmRevertButtonDisabled: {
    opacity: 0.5,
  },
  confirmRevertButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
});

export default ApplicationViewScreen;
