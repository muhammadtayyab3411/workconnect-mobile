import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export function DashboardScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isClient = user.role === 'client';
  const userName = user.first_name || user.email.split('@')[0];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18181b', marginBottom: 8 }}>
            Welcome back, {userName}!
          </Text>
          <Text style={{ color: '#71717a' }}>
            {isClient ? 'Find trusted professionals for your projects' : 'Discover new job opportunities'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#18181b', marginBottom: 16 }}>
            Quick Overview
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18181b' }}>
                  {isClient ? '3' : '12'}
                </Text>
                <Text style={{ fontSize: 14, color: '#71717a' }}>
                  {isClient ? 'Active Jobs' : 'Jobs Completed'}
                </Text>
              </CardContent>
            </Card>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18181b' }}>
                  {isClient ? '$2,450' : '$3,200'}
                </Text>
                <Text style={{ fontSize: 14, color: '#71717a' }}>
                  {isClient ? 'Total Spent' : 'Total Earned'}
                </Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Main Action */}
        <View style={{ marginBottom: 32 }}>
          <Button size="lg" style={{ width: '100%' }}>
            {isClient ? 'Post New Job' : 'Find Jobs'}
          </Button>
        </View>

        {/* Recent Activity */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#18181b', marginBottom: 16 }}>
            {isClient ? 'Recent Jobs' : 'Recent Applications'}
          </Text>
          
          {/* Mock recent items */}
          {[1, 2, 3].map((item) => (
            <Card key={item} style={{ marginBottom: 16 }}>
              <CardHeader>
                <CardTitle style={{ fontSize: 16 }}>
                  {isClient 
                    ? `Home Cleaning Service ${item}`
                    : `Plumbing Repair Job ${item}`
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#71717a' }}>
                    {isClient ? '$150 - $200' : 'Applied 2 days ago'}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#18181b' }}>
                    {isClient ? 'Active' : 'Pending'}
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Logout Button */}
        <View style={{ marginTop: 32 }}>
          <Button variant="outline" onPress={handleLogout} style={{ width: '100%' }}>
            Logout
          </Button>
        </View>
      </View>
    </ScrollView>
  );
} 