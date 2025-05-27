import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  Modal,
  StyleSheet 
} from 'react-native';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI, bidsAPI, Job, CreateBidRequest } from '../services/api';

interface JobDetailsScreenProps {
  route: {
    params: {
      jobId: string;
    };
  };
  navigation: any;
}

export function JobDetailsScreen({ route, navigation }: JobDetailsScreenProps) {
  const { jobId } = route.params;
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidData, setBidData] = useState({
    price: '',
    availability: '',
    proposal: '',
  });
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const jobData = await jobsAPI.getJob(jobId);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job details:', error);
      Alert.alert('Error', 'Failed to load job details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    if (!job || !user) return;

    // Validate bid data
    if (!bidData.price || !bidData.availability || !bidData.proposal) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const price = parseFloat(bidData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      setSubmittingBid(true);
      
      const bidRequest: CreateBidRequest = {
        job: job.id,
        price: price,
        availability: bidData.availability,
        proposal: bidData.proposal,
      };

      await bidsAPI.createBid(bidRequest);
      
      Alert.alert(
        'Success', 
        'Your bid has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBidModal(false);
              setBidData({ price: '', availability: '', proposal: '' });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Failed to submit bid. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingBid(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const isClient = user.role === 'client';
  const isJobOwner = isClient && job.client_email === user.email;
  const canApply = !isClient && job.status === 'open' && job.client_email !== user.email;

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{job.title}</Text>
              {job.urgent && (
                <Badge variant="destructive" size="sm">
                  Urgent
                </Badge>
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.category}>{job.category_name}</Text>
              <Text style={styles.location}>{job.city}</Text>
              <Badge variant={getStatusBadgeVariant(job.status)} size="sm">
                {job.status_display}
              </Badge>
            </View>
            <Text style={styles.postedTime}>Posted {job.posted_time_ago}</Text>
          </View>

          {/* Budget and Key Info */}
          <Card style={styles.budgetCard}>
            <CardContent style={styles.budgetContent}>
              <View style={styles.budgetRow}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Budget</Text>
                  <Text style={styles.budgetValue}>{job.budget_display}</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Payment</Text>
                  <Text style={styles.budgetValue}>{job.payment_type_display}</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Duration</Text>
                  <Text style={styles.budgetValue}>{job.duration_display || 'Flexible'}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card style={styles.section}>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={styles.description}>{job.description}</Text>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card style={styles.section}>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Job Type:</Text>
                <Text style={styles.detailValue}>{job.job_type_display}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Experience Level:</Text>
                <Text style={styles.detailValue}>{job.experience_level_display}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{job.address}, {job.city}</Text>
              </View>
              {job.start_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(job.start_date)}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Flexible Schedule:</Text>
                <Text style={styles.detailValue}>{job.flexible_schedule ? 'Yes' : 'No'}</Text>
              </View>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          {job.special_requirements && (
            <Card style={styles.section}>
              <CardHeader>
                <CardTitle>Special Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Text style={styles.description}>{job.special_requirements}</Text>
              </CardContent>
            </Card>
          )}

          {/* Client Information */}
          <Card style={styles.section}>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{job.client_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Views:</Text>
                <Text style={styles.detailValue}>{job.views_count} views</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Applications:</Text>
                <Text style={styles.detailValue}>{job.applications_count} applications</Text>
              </View>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {canApply && (
              <Button 
                size="lg" 
                style={styles.applyButton}
                onPress={() => setShowBidModal(true)}
              >
                Apply for this Job
              </Button>
            )}
            
            {isJobOwner && (
              <View style={styles.ownerActions}>
                <Button variant="outline" style={styles.ownerButton}>
                  Edit Job
                </Button>
                <Button variant="outline" style={styles.ownerButton}>
                  View Applications
                </Button>
                {job.status === 'open' && (
                  <Button variant="destructive" style={styles.ownerButton}>
                    Close Job
                  </Button>
                )}
              </View>
            )}

            {!canApply && !isJobOwner && (
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  {!isClient 
                    ? 'This job is not available for applications'
                    : 'You are viewing this job as a client'
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bid Submission Modal */}
      <Modal
        visible={showBidModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBidModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Your Bid</Text>
            <TouchableOpacity 
              onPress={() => setShowBidModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalJobTitle}>{job.title}</Text>
            <Text style={styles.modalJobBudget}>Budget: {job.budget_display}</Text>
            
            <View style={styles.bidForm}>
              <Input
                label="Your Bid Amount ($)"
                placeholder="Enter your bid amount"
                value={bidData.price}
                onChangeText={(text) => setBidData(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
              />
              
              <Input
                label="Availability"
                placeholder="When can you start? (e.g., Available immediately, Next week)"
                value={bidData.availability}
                onChangeText={(text) => setBidData(prev => ({ ...prev, availability: text }))}
              />
              
              <View style={styles.proposalSection}>
                <Text style={styles.proposalLabel}>Proposal</Text>
                <Input
                  placeholder="Describe your approach, experience, and why you're the best fit for this job..."
                  value={bidData.proposal}
                  onChangeText={(text) => setBidData(prev => ({ ...prev, proposal: text }))}
                  style={styles.proposalInput}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button 
              variant="outline" 
              onPress={() => setShowBidModal(false)}
              style={styles.modalCancelButton}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSubmitBid}
              loading={submittingBid}
              style={styles.modalSubmitButton}
            >
              Submit Bid
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    color: '#71717a',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181b',
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  location: {
    fontSize: 16,
    color: '#71717a',
  },
  postedTime: {
    fontSize: 14,
    color: '#71717a',
  },
  budgetCard: {
    marginBottom: 24,
  },
  budgetContent: {
    padding: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetItem: {
    alignItems: 'center',
    flex: 1,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
  },
  section: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#18181b',
  },
  detailsContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#71717a',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#18181b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  applyButton: {
    width: '100%',
  },
  ownerActions: {
    gap: 12,
  },
  ownerButton: {
    width: '100%',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    color: '#71717a',
    textAlign: 'center',
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
    fontSize: 20,
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
  modalJobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 8,
  },
  modalJobBudget: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 24,
  },
  bidForm: {
    gap: 20,
  },
  proposalSection: {
    gap: 8,
  },
  proposalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181b',
  },
  proposalInput: {
    minHeight: 120,
    textAlignVertical: 'top',
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
  modalSubmitButton: {
    flex: 1,
  },
}); 