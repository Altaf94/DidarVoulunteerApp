import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header/Header';
import AlertComponent from '../../components/Alert/Alert';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import CustomModal from '../../components/CustomModal/CustomModal';
import CustomInput from '../../components/CustomInput/CustomInput';
import ToggleSwitch from '../../components/shared/ToggleSwitch';
import { colors } from '../../theme';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { tokenService } from '../../services/tokenService';
import { User, UsersResponse, Jamatkhana } from '../../types';
import { Edit2, Trash2, Search, ChevronDown, Plus, Filter, X } from 'lucide-react-native';

type RootStackParamList = {
  Login: undefined;
  UserManagement: undefined;
  ApplicationView: { formData: any };
};

type UserManagementNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UserManagement'
>;

interface Props {
  navigation: UserManagementNavigationProp;
}

const UserManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UsersResponse['Pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [jamatkhanas, setJamatkhanas] = useState<Jamatkhana[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dropdown states
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showJamatkhanaFilter, setShowJamatkhanaFilter] = useState(false);
  const [showCreateJamatkhanaDropdown, setShowCreateJamatkhanaDropdown] = useState(false);
  const [showEditJamatkhanaDropdown, setShowEditJamatkhanaDropdown] = useState(false);

  // Search states for dropdowns
  const [jamatkhanaFilterSearch, setJamatkhanaFilterSearch] = useState('');
  const [createJamatkhanaSearch, setCreateJamatkhanaSearch] = useState('');
  const [editJamatkhanaSearch, setEditJamatkhanaSearch] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    Email: '',
    FullName: '',
    PhoneNumber: '',
    Password: '',
    RoleId: 0,
    StatusId: 1,
    JamatKhanaIds: [] as string[],
    IsActive: true,
  });

  // Filters
  const [filters, setFilters] = useState({
    Email: '',
    JamatKhanaId: '',
    RoleId: 0,
    StatusId: 0,
    IsActive: null as boolean | null,
    PageNumber: 1,
    PageSize: 10,
  });

  const { alert, showError, showSuccess, hideAlert } = useAlert();
  const { logout, userRole } = useAuth();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    if (filters.PageNumber > 0) {
      fetchUsers();
    }
  }, [filters.PageNumber, filters.PageSize]);

  const checkAuthAndFetch = async () => {
    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      navigation.replace('Login');
      return;
    }
    fetchUsers();
    fetchJamatkhanas();
    initializeFormRole();
  };

  const initializeFormRole = async () => {
    const role = await tokenService.getUserRole();
    // Admin (3) creates Checker (2), Checker (2) creates Enumerator (1)
    const defaultRoleId = role === 3 ? 2 : role === 2 ? 1 : 0;
    setFormData(prev => ({ ...prev, RoleId: defaultRoleId }));
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const isAuth = await tokenService.isAuthenticated();
      if (!isAuth) {
        showError('Authentication Error', 'No access token found. Please login again.');
        setIsLoading(false);
        return;
      }

      const data = await apiService.getUsers({
        Email: filters.Email,
        JamatKhanaId: filters.JamatKhanaId,
        PageNumber: filters.PageNumber,
        PageSize: filters.PageSize,
      });

      // Client-side filtering for checkers and advanced filters
      let filteredUsers = data.Users;
      const currentUserRole = await tokenService.getUserRole();

      if (currentUserRole === 2) {
        const userJamatKhanaIds = await tokenService.getUserJamatKhanaIds();
        filteredUsers = data.Users.filter((user: User) => {
          if (user.RoleId === 3) return false; // Exclude admins
          return user.JamatKhanaIds.some((jkId: string) =>
            userJamatKhanaIds.includes(jkId)
          );
        });
      }

      // Apply advanced filters
      if (filters.RoleId > 0) {
        filteredUsers = filteredUsers.filter((user: User) => user.RoleId === filters.RoleId);
      }
      if (filters.StatusId > 0) {
        filteredUsers = filteredUsers.filter((user: User) => user.StatusId === filters.StatusId);
      }
      if (filters.IsActive !== null) {
        filteredUsers = filteredUsers.filter((user: User) => user.IsActive === filters.IsActive);
      }

      setUsers(filteredUsers);
      setPagination(data.Pagination);
    } catch (error: any) {
      showError('Error', error.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchJamatkhanas = async () => {
    try {
      const isAuth = await tokenService.isAuthenticated();
      if (!isAuth) return;

      const userJamatKhanaIds = await tokenService.getUserJamatKhanaIds();
      const data = await apiService.getJamatkhanas();

      const transformedData = data.map((jk: any) => ({
        id: jk.id || jk.Id || jk.JamatKhanaId,
        name: jk.name || jk.Name,
      }));

      // Filter based on user's permissions
      let filteredData = transformedData;
      if (userJamatKhanaIds.length > 0) {
        filteredData = transformedData.filter((jk: Jamatkhana) =>
          userJamatKhanaIds.includes(jk.id)
        );
      }

      setJamatkhanas(filteredData);
    } catch (error) {
      console.error('Failed to fetch Jamatkhanas:', error);
    }
  };

  const handleCreateUser = async () => {
    setShowCreateModal(false);
    setIsLoading(true);
    try {
      const { Password, ...createUserData } = formData;
      await apiService.createUser(createUserData);
      showSuccess('Success', 'User created successfully! Password will be sent to their email.');
      resetForm();
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to create user');
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setShowEditModal(false);
    setIsLoading(true);
    try {
      await apiService.updateUser(selectedUser.Id, {
        FullName: formData.FullName,
        PhoneNumber: formData.PhoneNumber,
        JamatKhanaIds: formData.JamatKhanaIds,
        IsActive: formData.IsActive,
      });
      showSuccess('Success', 'User updated successfully!');
      resetForm();
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update user');
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setShowDeleteModal(false);
    setIsLoading(true);
    try {
      await apiService.deleteUser(selectedUser.Id);
      showSuccess('Success', 'User deleted successfully!');
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      // Find the user to get all required fields
      const user = users.find(u => u.Id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      await apiService.updateUser(userId, {
        FullName: user.FullName,
        PhoneNumber: user.PhoneNumber,
        JamatKhanaIds: user.JamatKhanaIds,
        IsActive: !currentStatus,
      });
      showSuccess('Success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    const defaultRoleId = userRole === 3 ? 2 : userRole === 2 ? 1 : 0;
    setFormData({
      Email: '',
      FullName: '',
      PhoneNumber: '',
      Password: '',
      RoleId: defaultRoleId,
      StatusId: 1,
      JamatKhanaIds: [],
      IsActive: true,
    });
    setCreateJamatkhanaSearch('');
    setEditJamatkhanaSearch('');
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      Email: user.Email,
      FullName: user.FullName,
      PhoneNumber: user.PhoneNumber,
      Password: '',
      RoleId: user.RoleId,
      StatusId: user.StatusId,
      JamatKhanaIds: user.JamatKhanaIds,
      IsActive: user.IsActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, PageNumber: 1 }));
    fetchUsers();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, PageNumber: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      Email: '',
      JamatKhanaId: '',
      RoleId: 0,
      StatusId: 0,
      IsActive: null,
      PageNumber: 1,
      PageSize: 10,
    });
    setJamatkhanaFilterSearch('');
    fetchUsers();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const getRoleName = (roleId: number) => {
    const roles: { [key: number]: string } = {
      1: 'Enumerator',
      2: 'Checker',
      3: 'Administrator',
      4: 'JK Admin',
    };
    return roles[roleId] || 'Unknown';
  };

  const getStatusName = (statusId: number) => {
    const statuses: { [key: number]: string } = {
      1: 'Active',
      2: 'Inactive',
      3: 'Pending',
    };
    return statuses[statusId] || 'Unknown';
  };

  const getRoleStyle = (roleId: number) => {
    switch (roleId) {
      case 1:
        return { bg: colors.roleColors.enumerator.bg, fg: colors.roleColors.enumerator.fg };
      case 2:
        return { bg: colors.roleColors.checker.bg, fg: colors.roleColors.checker.fg };
      case 3:
        return { bg: colors.roleColors.admin.bg, fg: colors.roleColors.admin.fg };
      case 4:
        return { bg: colors.roleColors.jkAdmin.bg, fg: colors.roleColors.jkAdmin.fg };
      default:
        return { bg: colors.badgeGray.bg, fg: colors.badgeGray.fg };
    }
  };

  const getStatusStyle = (statusId: number) => {
    switch (statusId) {
      case 1:
        return { bg: colors.statusColors.active.bg, fg: colors.statusColors.active.fg };
      case 2:
        return { bg: colors.statusColors.inactive.bg, fg: colors.statusColors.inactive.fg };
      case 3:
        return { bg: colors.statusColors.pending.bg, fg: colors.statusColors.pending.fg };
      default:
        return { bg: colors.badgeGray.bg, fg: colors.badgeGray.fg };
    }
  };

  const getFilteredJamatkhanas = (search: string) => {
    if (!search.trim()) return jamatkhanas;
    return jamatkhanas.filter(jk =>
      jk.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const roleStyle = getRoleStyle(item.RoleId);
    const statusStyle = getStatusStyle(item.StatusId);

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.FullName}
            </Text>
            <Text style={styles.userId}>ID: {item.Id}</Text>
          </View>
          <View style={styles.userActions}>
            <ToggleSwitch
              checked={item.IsActive}
              onChange={() => handleToggleUserStatus(item.Id, item.IsActive)}
              disabled={isLoading}
            />
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.actionButton}>
              <Edit2 color={colors.textMuted} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openDeleteModal(item)}
              style={styles.actionButton}>
              <Trash2 color={colors.errorLight} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.userEmail} numberOfLines={1}>
          {item.Email}
        </Text>
        <Text style={styles.userPhone} numberOfLines={1}>
          {item.PhoneNumber}
        </Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: roleStyle.bg }]}>
            <Text style={[styles.badgeText, { color: roleStyle.fg }]}>
              {getRoleName(item.RoleId)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.fg }]}>
              {getStatusName(item.StatusId)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRoleFilter = () => (
    <View style={styles.filterDropdown}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowRoleFilter(!showRoleFilter)}>
        <Text style={styles.filterButtonText}>
          {filters.RoleId > 0 ? getRoleName(filters.RoleId) : 'All Roles'}
        </Text>
        <ChevronDown color={colors.textMuted} size={16} />
      </TouchableOpacity>
      {showRoleFilter && (
        <>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setShowRoleFilter(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('RoleId', 0);
                setShowRoleFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>All Roles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('RoleId', 1);
                setShowRoleFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>Enumerator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('RoleId', 2);
                setShowRoleFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>Checker</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('RoleId', 3);
                setShowRoleFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>Administrator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('RoleId', 4);
                setShowRoleFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>JK Admin</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterDropdown}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowStatusFilter(!showStatusFilter)}>
        <Text style={styles.filterButtonText}>
          {filters.StatusId > 0 ? getStatusName(filters.StatusId) : 'All Status'}
        </Text>
        <ChevronDown color={colors.textMuted} size={16} />
      </TouchableOpacity>
      {showStatusFilter && (
        <>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setShowStatusFilter(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('StatusId', 0);
                setShowStatusFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>All Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('StatusId', 1);
                setShowStatusFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('StatusId', 2);
                setShowStatusFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>Inactive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleFilterChange('StatusId', 3);
                setShowStatusFilter(false);
              }}>
              <Text style={styles.dropdownItemText}>Pending</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderActiveFilter = () => (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>Active Users:</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            filters.IsActive === null && styles.toggleOptionActive,
          ]}
          onPress={() => handleFilterChange('IsActive', null)}>
          <Text style={[
            styles.toggleOptionText,
            filters.IsActive === null && styles.toggleOptionTextActive,
          ]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            filters.IsActive === true && styles.toggleOptionActive,
          ]}
          onPress={() => handleFilterChange('IsActive', true)}>
          <Text style={[
            styles.toggleOptionText,
            filters.IsActive === true && styles.toggleOptionTextActive,
          ]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            filters.IsActive === false && styles.toggleOptionActive,
          ]}
          onPress={() => handleFilterChange('IsActive', false)}>
          <Text style={[
            styles.toggleOptionText,
            filters.IsActive === false && styles.toggleOptionTextActive,
          ]}>Inactive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <IsmailiLoader visible={isLoading && !refreshing} />

      <AlertComponent
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        autoClose
        autoCloseDelay={15000}
      />

      <Header title="Welcome to MHIP" onLogout={handleLogout} />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>User Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>User Management</Text>
              <Text style={styles.welcomeSubtitle}>
                Manage user accounts and permissions
              </Text>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}>
              <Plus color={colors.white} size={16} />
              <Text style={styles.createButtonText}>Create User</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <View style={styles.filterRow}>
            <View style={styles.filterInput}>
              <TextInput
                style={styles.input}
                placeholder="Search by email or name"
                value={filters.Email}
                onChangeText={text => handleFilterChange('Email', text)}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}>
              <Search color={colors.white} size={18} />
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.advancedFilters}>
            {renderRoleFilter()}
            {renderStatusFilter()}
            {renderActiveFilter()}
          </View>

          {(filters.RoleId > 0 || filters.StatusId > 0 || filters.IsActive !== null) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}>
              <X color={colors.primary} size={16} />
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Users List */}
        <View style={styles.listSection}>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={item => item.Id}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isLoading ? 'Loading...' : 'No users found'}
                </Text>
              </View>
            }
          />

          {/* Pagination */}
          {pagination && pagination.TotalPages > 1 && (
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>
                Showing {((pagination.Page - 1) * pagination.PageSize) + 1} to {Math.min(pagination.Page * pagination.PageSize, pagination.Total)} of {pagination.Total} results
              </Text>
              <View style={styles.paginationButtons}>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    !pagination.HasPrevious && styles.pageButtonDisabled,
                  ]}
                  disabled={!pagination.HasPrevious}
                  onPress={() =>
                    setFilters(prev => ({
                      ...prev,
                      PageNumber: prev.PageNumber - 1,
                    }))
                  }>
                  <Text style={styles.pageButtonText}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    !pagination.HasNext && styles.pageButtonDisabled,
                  ]}
                  disabled={!pagination.HasNext}
                  onPress={() =>
                    setFilters(prev => ({
                      ...prev,
                      PageNumber: prev.PageNumber + 1,
                    }))
                  }>
                  <Text style={styles.pageButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create User Modal */}
      <CustomModal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        size="lg"
        title="Create New User">
        <ScrollView style={styles.modalScroll}>
          <View style={styles.modalForm}>
            <CustomInput
              label="Full Name *"
              placeholder="Enter full name"
              value={formData.FullName}
              onChange={text =>
                setFormData(prev => ({ ...prev, FullName: text.substring(0, 100) }))
              }
            />
            <CustomInput
              type="email"
              label="Email *"
              placeholder="Enter email address"
              value={formData.Email}
              onChange={text =>
                setFormData(prev => ({ ...prev, Email: text.toLowerCase() }))
              }
            />
            <CustomInput
              label="Phone Number *"
              placeholder="Enter phone number"
              value={formData.PhoneNumber}
              onChange={text => setFormData(prev => ({ ...prev, PhoneNumber: text }))}
              keyboardType="phone-pad"
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {}}>
                  <Text style={styles.pickerButtonText}>
                    {getRoleName(formData.RoleId)}
                  </Text>
                  <ChevronDown color={colors.textMuted} size={16} />
                </TouchableOpacity>
                <View style={styles.pickerDropdown}>
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => setFormData(prev => ({ ...prev, RoleId: 1 }))}>
                    <Text style={styles.pickerItemText}>Enumerator</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => setFormData(prev => ({ ...prev, RoleId: 2 }))}>
                    <Text style={styles.pickerItemText}>Checker</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => setFormData(prev => ({ ...prev, RoleId: 3 }))}>
                    <Text style={styles.pickerItemText}>Administrator</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => setFormData(prev => ({ ...prev, RoleId: 4 }))}>
                    <Text style={styles.pickerItemText}>JK Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Jamat Khana *</Text>
              <View style={styles.jamatkhanaSelector}>
                <TouchableOpacity
                  style={styles.jamatkhanaButton}
                  onPress={() => setShowCreateJamatkhanaDropdown(!showCreateJamatkhanaDropdown)}>
                  <Text style={[
                    styles.jamatkhanaButtonText,
                    formData.JamatKhanaIds.length === 0 && styles.placeholderText
                  ]}>
                    {formData.JamatKhanaIds.length > 0
                      ? `${formData.JamatKhanaIds.length} Jamat Khana(s) selected`
                      : 'Select Jamat Khana'
                    }
                  </Text>
                  <ChevronDown color={colors.textMuted} size={16} />
                </TouchableOpacity>

                {showCreateJamatkhanaDropdown && (
                  <View style={styles.jamatkhanaDropdown}>
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search Jamat Khana..."
                        value={createJamatkhanaSearch}
                        onChangeText={setCreateJamatkhanaSearch}
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                    <ScrollView style={styles.dropdownScroll}>
                      {getFilteredJamatkhanas(createJamatkhanaSearch).map((jk) => (
                        <TouchableOpacity
                          key={jk.id}
                          style={[
                            styles.dropdownItem,
                            formData.JamatKhanaIds.includes(jk.id) && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            const isSelected = formData.JamatKhanaIds.includes(jk.id);
                            if (isSelected) {
                              setFormData(prev => ({
                                ...prev,
                                JamatKhanaIds: prev.JamatKhanaIds.filter(id => id !== jk.id)
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                JamatKhanaIds: [...prev.JamatKhanaIds, jk.id]
                              }));
                            }
                          }}>
                          <Text style={[
                            styles.dropdownItemText,
                            formData.JamatKhanaIds.includes(jk.id) && styles.dropdownItemTextSelected
                          ]}>
                            {jk.name}
                          </Text>
                          {formData.JamatKhanaIds.includes(jk.id) && (
                            <View style={styles.checkmark}>
                              <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <Text style={styles.helperText}>Click to select multiple Jamat Khana</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}>
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitModalButton,
                  (!formData.FullName || !formData.Email || !formData.PhoneNumber || formData.JamatKhanaIds.length === 0) &&
                    styles.submitModalButtonDisabled,
                ]}
                onPress={handleCreateUser}
                disabled={!formData.FullName || !formData.Email || !formData.PhoneNumber || formData.JamatKhanaIds.length === 0}>
                <Text style={styles.submitModalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </CustomModal>

      {/* Edit User Modal */}
      <CustomModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedUser(null);
        }}
        size="lg"
        title="Edit User">
        <ScrollView style={styles.modalScroll}>
          <View style={styles.modalForm}>
            <CustomInput
              label="Full Name *"
              placeholder="Enter full name"
              value={formData.FullName}
              onChange={text =>
                setFormData(prev => ({ ...prev, FullName: text.substring(0, 100) }))
              }
            />
            <CustomInput
              label="Phone Number *"
              placeholder="Enter phone number"
              value={formData.PhoneNumber}
              onChange={text => setFormData(prev => ({ ...prev, PhoneNumber: text }))}
              keyboardType="phone-pad"
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Jamat Khana *</Text>
              <View style={styles.jamatkhanaSelector}>
                <TouchableOpacity
                  style={styles.jamatkhanaButton}
                  onPress={() => setShowEditJamatkhanaDropdown(!showEditJamatkhanaDropdown)}>
                  <Text style={[
                    styles.jamatkhanaButtonText,
                    formData.JamatKhanaIds.length === 0 && styles.placeholderText
                  ]}>
                    {formData.JamatKhanaIds.length > 0
                      ? `${formData.JamatKhanaIds.length} Jamat Khana(s) selected`
                      : 'Select Jamat Khana'
                    }
                  </Text>
                  <ChevronDown color={colors.textMuted} size={16} />
                </TouchableOpacity>

                {showEditJamatkhanaDropdown && (
                  <View style={styles.jamatkhanaDropdown}>
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search Jamat Khana..."
                        value={editJamatkhanaSearch}
                        onChangeText={setEditJamatkhanaSearch}
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                    <ScrollView style={styles.dropdownScroll}>
                      {getFilteredJamatkhanas(editJamatkhanaSearch).map((jk) => (
                        <TouchableOpacity
                          key={jk.id}
                          style={[
                            styles.dropdownItem,
                            formData.JamatKhanaIds.includes(jk.id) && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            const isSelected = formData.JamatKhanaIds.includes(jk.id);
                            if (isSelected) {
                              setFormData(prev => ({
                                ...prev,
                                JamatKhanaIds: prev.JamatKhanaIds.filter(id => id !== jk.id)
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                JamatKhanaIds: [...prev.JamatKhanaIds, jk.id]
                              }));
                            }
                          }}>
                          <Text style={[
                            styles.dropdownItemText,
                            formData.JamatKhanaIds.includes(jk.id) && styles.dropdownItemTextSelected
                          ]}>
                            {jk.name}
                          </Text>
                          {formData.JamatKhanaIds.includes(jk.id) && (
                            <View style={styles.checkmark}>
                              <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <Text style={styles.helperText}>Click to select multiple Jamat Khana</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Active User</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Inactive</Text>
                <Switch
                  value={formData.IsActive}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, IsActive: value }))}
                  trackColor={{ false: colors.borderLight, true: colors.primary }}
                  thumbColor={colors.white}
                />
                <Text style={styles.toggleLabel}>Active</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedUser(null);
                }}>
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalButton}
                onPress={handleUpdateUser}>
                <Text style={styles.submitModalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        size="sm"
        title="Delete User">
        <View style={styles.deleteModalContent}>
          <View style={styles.deleteIcon}>
            <Trash2 color={colors.errorLight} size={48} />
          </View>
          <Text style={styles.deleteModalTitle}>Delete User</Text>
          <Text style={styles.deleteModalText}>
            Are you sure you want to delete user <Text style={styles.deleteUserName}>"{selectedUser?.FullName}"</Text>?
            {'\n\n'}
            <Text style={styles.deleteWarning}>This action cannot be undone.</Text>
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}>
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitModalButton, styles.deleteConfirmButton]}
              onPress={handleDeleteUser}>
              <Text style={styles.submitModalButtonText}>Delete User</Text>
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
  breadcrumb: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primaryDark,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    alignSelf: 'flex-start',
    paddingBottom: 4,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    marginHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  filterSection: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    marginRight: 12,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 20,
    height: 40,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  advancedFilters: {
    marginTop: 16,
  },
  filterDropdown: {
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  toggleOptionActive: {
    backgroundColor: colors.primary,
  },
  toggleOptionText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  toggleOptionTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  listSection: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  userCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modalForm: {
    gap: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pickerContainer: {
    position: 'relative',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  pickerButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  pickerDropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  jamatkhanaSelector: {
    position: 'relative',
  },
  jamatkhanaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  jamatkhanaButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  jamatkhanaDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
  },
  searchContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    height: 32,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  dropdownScroll: {
    maxHeight: 160,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginHorizontal: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelModalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  cancelModalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  submitModalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  submitModalButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitModalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  deleteConfirmButton: {
    backgroundColor: colors.errorLight,
  },
  deleteModalContent: {
    paddingTop: 8,
    alignItems: 'center',
  },
  deleteIcon: {
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteUserName: {
    fontWeight: '600',
    color: colors.primary,
  },
  deleteWarning: {
    color: colors.errorLight,
    fontWeight: '600',
  },
});

export default UserManagementScreen;
