import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal,
  Image,
  StyleSheet 
} from 'react-native';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, ProfileUpdateRequest } from '../services/api';

export function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSection, setEditingSection] = useState<'basic' | 'professional' | 'skills'>('basic');
  const [profileData, setProfileData] = useState<ProfileUpdateRequest>({});
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
        bio: user.bio || '',
        skills: user.skills || [],
        languages: user.languages || [],
        years_of_experience: user.years_of_experience || 0,
        experience_description: user.experience_description || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await authAPI.updateProfile(profileData);
      
      // Refresh user data in context
      await updateUser();
      
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills?.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !profileData.languages?.includes(newLanguage.trim())) {
      setProfileData(prev => ({
        ...prev,
        languages: [...(prev.languages || []), newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages?.filter(lang => lang !== languageToRemove) || []
    }));
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const openEditModal = (section: 'basic' | 'professional' | 'skills') => {
    setEditingSection(section);
    setShowEditModal(true);
  };

  if (!user) return null;

  const isWorker = user.role === 'worker';

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Profile Header */}
          <Card style={styles.headerCard}>
            <CardContent style={styles.headerContent}>
              <View style={styles.profileImageContainer}>
                {user.profile_picture ? (
                  <Image source={{ uri: user.profile_picture }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={styles.editImageButton}>
                  <Text style={styles.editImageText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.full_name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <View style={styles.profileMeta}>
                  <Badge variant="secondary" size="sm">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {user.is_verified && (
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  )}
                </View>
                {isWorker && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {user.rating_display}</Text>
                    <Text style={styles.completedJobs}>
                      {user.total_completed_jobs} jobs completed
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card style={styles.section}>
            <CardHeader>
              <View style={styles.sectionHeader}>
                <CardTitle>Basic Information</CardTitle>
                <TouchableOpacity onPress={() => openEditModal('basic')}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>
                  {user.phone_number || 'Not provided'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>
                  {user.address || 'Not provided'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth:</Text>
                <Text style={styles.infoValue}>
                  {user.date_of_birth || 'Not provided'}
                </Text>
              </View>
              {user.bio && (
                <View style={styles.bioSection}>
                  <Text style={styles.infoLabel}>About:</Text>
                  <Text style={styles.bioText}>{user.bio}</Text>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Professional Information (Workers only) */}
          {isWorker && (
            <Card style={styles.section}>
              <CardHeader>
                <View style={styles.sectionHeader}>
                  <CardTitle>Professional Information</CardTitle>
                  <TouchableOpacity onPress={() => openEditModal('professional')}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </CardHeader>
              <CardContent style={styles.sectionContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Experience:</Text>
                  <Text style={styles.infoValue}>
                    {user.years_of_experience ? `${user.years_of_experience} years` : 'Not specified'}
                  </Text>
                </View>
                {user.experience_description && (
                  <View style={styles.bioSection}>
                    <Text style={styles.infoLabel}>Experience Description:</Text>
                    <Text style={styles.bioText}>{user.experience_description}</Text>
                  </View>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills & Languages (Workers only) */}
          {isWorker && (
            <Card style={styles.section}>
              <CardHeader>
                <View style={styles.sectionHeader}>
                  <CardTitle>Skills & Languages</CardTitle>
                  <TouchableOpacity onPress={() => openEditModal('skills')}>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </CardHeader>
              <CardContent style={styles.sectionContent}>
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsLabel}>Skills:</Text>
                  <View style={styles.skillsContainer}>
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" size="sm" style={styles.skillBadge}>
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>No skills added</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsLabel}>Languages:</Text>
                  <View style={styles.skillsContainer}>
                    {user.languages && user.languages.length > 0 ? (
                      user.languages.map((language, index) => (
                        <Badge key={index} variant="outline" size="sm" style={styles.skillBadge}>
                          {language}
                        </Badge>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>No languages added</Text>
                    )}
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Account Settings */}
          <Card style={styles.section}>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent style={styles.settingsContent}>
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Change Password</Text>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Notification Settings</Text>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Privacy Settings</Text>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>Help & Support</Text>
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <Button variant="destructive" onPress={handleLogout} style={styles.logoutButton}>
              Logout
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Edit {editingSection === 'basic' ? 'Basic Information' : 
                   editingSection === 'professional' ? 'Professional Information' : 
                   'Skills & Languages'}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowEditModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {editingSection === 'basic' && (
              <View style={styles.editForm}>
                <Input
                  label="First Name"
                  value={profileData.first_name}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, first_name: text }))}
                />
                
                <Input
                  label="Last Name"
                  value={profileData.last_name}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, last_name: text }))}
                />
                
                <Input
                  label="Phone Number"
                  value={profileData.phone_number}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, phone_number: text }))}
                  keyboardType="phone-pad"
                />
                
                <Input
                  label="Address"
                  value={profileData.address}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, address: text }))}
                />
                
                <Input
                  label="Date of Birth (YYYY-MM-DD)"
                  value={profileData.date_of_birth}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, date_of_birth: text }))}
                  placeholder="1990-01-01"
                />
                
                <View style={styles.bioInputSection}>
                  <Text style={styles.inputLabel}>About/Bio</Text>
                  <Input
                    value={profileData.bio}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                    placeholder="Tell us about yourself..."
                    style={styles.bioInput}
                  />
                </View>
              </View>
            )}

            {editingSection === 'professional' && isWorker && (
              <View style={styles.editForm}>
                <Input
                  label="Years of Experience"
                  value={profileData.years_of_experience?.toString() || ''}
                  onChangeText={(text) => setProfileData(prev => ({ 
                    ...prev, 
                    years_of_experience: parseInt(text) || 0 
                  }))}
                  keyboardType="numeric"
                  placeholder="5"
                />
                
                <View style={styles.bioInputSection}>
                  <Text style={styles.inputLabel}>Experience Description</Text>
                  <Input
                    value={profileData.experience_description}
                    onChangeText={(text) => setProfileData(prev => ({ 
                      ...prev, 
                      experience_description: text 
                    }))}
                    placeholder="Describe your professional experience..."
                    style={styles.bioInput}
                  />
                </View>
              </View>
            )}

            {editingSection === 'skills' && isWorker && (
              <View style={styles.editForm}>
                {/* Skills Section */}
                <View style={styles.skillEditSection}>
                  <Text style={styles.inputLabel}>Skills</Text>
                  <View style={styles.addSkillRow}>
                    <Input
                      value={newSkill}
                      onChangeText={setNewSkill}
                      placeholder="Add a skill..."
                      style={styles.skillInput}
                    />
                    <Button onPress={handleAddSkill} style={styles.addButton}>
                      Add
                    </Button>
                  </View>
                  <View style={styles.skillsContainer}>
                    {profileData.skills?.map((skill, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleRemoveSkill(skill)}
                        style={styles.removableSkill}
                      >
                        <Text style={styles.skillText}>{skill}</Text>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Languages Section */}
                <View style={styles.skillEditSection}>
                  <Text style={styles.inputLabel}>Languages</Text>
                  <View style={styles.addSkillRow}>
                    <Input
                      value={newLanguage}
                      onChangeText={setNewLanguage}
                      placeholder="Add a language..."
                      style={styles.skillInput}
                    />
                    <Button onPress={handleAddLanguage} style={styles.addButton}>
                      Add
                    </Button>
                  </View>
                  <View style={styles.skillsContainer}>
                    {profileData.languages?.map((language, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleRemoveLanguage(language)}
                        style={styles.removableSkill}
                      >
                        <Text style={styles.skillText}>{language}</Text>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button 
              variant="outline" 
              onPress={() => setShowEditModal(false)}
              style={styles.modalCancelButton}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSaveProfile}
              loading={loading}
              style={styles.modalSaveButton}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerCard: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#71717a',
  },
  editImageButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#18181b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editImageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 8,
  },
  profileMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181b',
  },
  completedJobs: {
    fontSize: 12,
    color: '#71717a',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#71717a',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#18181b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  bioSection: {
    gap: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#18181b',
    lineHeight: 20,
  },
  skillsSection: {
    gap: 8,
  },
  skillsLabel: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    fontStyle: 'italic',
  },
  settingsContent: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  settingText: {
    fontSize: 16,
    color: '#18181b',
  },
  settingArrow: {
    fontSize: 18,
    color: '#71717a',
  },
  logoutSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  logoutButton: {
    width: '100%',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#71717a',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  editForm: {
    gap: 20,
  },
  bioInputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181b',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  skillEditSection: {
    gap: 12,
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  skillInput: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 20,
  },
  removableSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#18181b',
  },
  removeText: {
    fontSize: 12,
    color: '#71717a',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSaveButton: {
    flex: 1,
  },
}); 