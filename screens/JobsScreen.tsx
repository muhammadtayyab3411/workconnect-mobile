import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Alert,
  StyleSheet 
} from 'react-native';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI, JobListItem, JobCategory } from '../services/api';

export function JobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, categoriesData] = await Promise.all([
        jobsAPI.getJobs({ search: searchQuery, category: selectedCategory }),
        jobsAPI.getCategories()
      ]);
      setJobs(jobsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    await loadData();
  };

  const handleCategoryFilter = async (categorySlug: string) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
    // Reload data with new filter
    try {
      const jobsData = await jobsAPI.getJobs({ 
        search: searchQuery, 
        category: categorySlug === selectedCategory ? '' : categorySlug 
      });
      setJobs(jobsData);
    } catch (error) {
      console.error('Error filtering jobs:', error);
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

  const isClient = user?.role === 'client';

  if (!user) return null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isClient ? 'My Jobs' : 'Find Jobs'}
          </Text>
          <Text style={styles.subtitle}>
            {isClient 
              ? 'Manage your job postings and applications' 
              : 'Discover opportunities that match your skills'
            }
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <Button onPress={handleSearch} style={styles.searchButton}>
              Search
            </Button>
          </View>
          
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterToggle}
          >
            <Text style={styles.filterToggleText}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        {showFilters && (
          <View style={styles.filtersSection}>
            <Text style={styles.filtersTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryFilters}>
                <TouchableOpacity
                  onPress={() => handleCategoryFilter('')}
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.categoryChipActive
                  ]}
                >
                  <Text style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.categoryChipTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryFilter(category.slug)}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.slug && styles.categoryChipActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category.slug && styles.categoryChipTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Create Job Button (Clients only) */}
        {isClient && (
          <View style={styles.createJobSection}>
            <Button size="lg" style={styles.createJobButton}>
              Post New Job
            </Button>
          </View>
        )}

        {/* Jobs List */}
        <View style={styles.jobsSection}>
          <View style={styles.jobsHeader}>
            <Text style={styles.jobsTitle}>
              {isClient ? 'Your Jobs' : 'Available Jobs'}
            </Text>
            <Text style={styles.jobsCount}>
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
          ) : jobs.length === 0 ? (
            <Card style={styles.emptyState}>
              <CardContent style={styles.emptyStateContent}>
                <Text style={styles.emptyStateTitle}>
                  {isClient ? 'No jobs posted yet' : 'No jobs available'}
                </Text>
                <Text style={styles.emptyStateDescription}>
                  {isClient 
                    ? 'Start by posting your first job to find skilled professionals.'
                    : 'Check back later for new opportunities or adjust your search filters.'
                  }
                </Text>
                {isClient && (
                  <Button style={styles.emptyStateButton}>
                    Post Your First Job
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} style={styles.jobCard}>
                <CardHeader>
                  <View style={styles.jobCardHeader}>
                    <View style={styles.jobCardTitleRow}>
                      <CardTitle style={styles.jobCardTitle}>{job.title}</CardTitle>
                      {job.urgent && (
                        <Badge variant="destructive" size="sm">
                          Urgent
                        </Badge>
                      )}
                    </View>
                    <View style={styles.jobCardMeta}>
                      <Text style={styles.jobCardCategory}>{job.category_name}</Text>
                      <Text style={styles.jobCardLocation}>{job.city}</Text>
                      <Badge variant={getStatusBadgeVariant(job.status)} size="sm">
                        {job.status}
                      </Badge>
                    </View>
                  </View>
                </CardHeader>
                <CardContent>
                  <Text style={styles.jobCardDescription} numberOfLines={3}>
                    {job.description}
                  </Text>
                  <View style={styles.jobCardFooter}>
                    <View style={styles.jobCardInfo}>
                      <Text style={styles.jobCardBudget}>{job.budget_display}</Text>
                      <Text style={styles.jobCardTime}>{job.posted_time_ago}</Text>
                    </View>
                    {!isClient && (
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    )}
                    {isClient && (
                      <View style={styles.clientJobActions}>
                        <Text style={styles.applicationsCount}>
                          {/* We'll need to add applications_count to the API response */}
                          Applications: 0
                        </Text>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </View>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 8,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    paddingHorizontal: 20,
  },
  filterToggle: {
    alignSelf: 'flex-start',
  },
  filterToggleText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersSection: {
    marginBottom: 24,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 12,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  categoryChipActive: {
    backgroundColor: '#18181b',
    borderColor: '#18181b',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  createJobSection: {
    marginBottom: 24,
  },
  createJobButton: {
    width: '100%',
  },
  jobsSection: {
    marginBottom: 32,
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
  },
  jobsCount: {
    fontSize: 14,
    color: '#71717a',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#71717a',
  },
  emptyState: {
    marginBottom: 16,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobCardHeader: {
    gap: 8,
  },
  jobCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  jobCardTitle: {
    flex: 1,
    fontSize: 16,
  },
  jobCardMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  jobCardCategory: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  jobCardLocation: {
    fontSize: 14,
    color: '#71717a',
  },
  jobCardDescription: {
    color: '#71717a',
    marginBottom: 16,
    lineHeight: 20,
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobCardInfo: {
    flex: 1,
  },
  jobCardBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 4,
  },
  jobCardTime: {
    fontSize: 12,
    color: '#71717a',
  },
  clientJobActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  applicationsCount: {
    fontSize: 12,
    color: '#71717a',
  },
}); 