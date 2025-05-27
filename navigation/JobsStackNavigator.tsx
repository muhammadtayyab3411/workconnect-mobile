import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { JobsScreen } from '../screens/JobsScreen';
import { JobDetailsScreen } from '../screens/JobDetailsScreen';

export type JobsStackParamList = {
  JobsList: undefined;
  JobDetails: { jobId: string };
};

const Stack = createStackNavigator<JobsStackParamList>();

export function JobsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomColor: '#e4e4e7',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#18181b',
        },
        headerTintColor: '#18181b',
      }}
    >
      <Stack.Screen 
        name="JobsList" 
        component={JobsScreen}
        options={{
          headerTitle: 'Jobs',
        }}
      />
      <Stack.Screen 
        name="JobDetails" 
        component={JobDetailsScreen}
        options={{
          headerTitle: 'Job Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
} 