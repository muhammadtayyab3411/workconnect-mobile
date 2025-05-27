import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'worker'>('client');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { login, signup, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(email, password, role);
      } else {
        await signup(email, password, name, role);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.email?.[0] || 
                          error.response?.data?.password?.[0] || 
                          'Authentication failed. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            WorkConnect
          </Text>
          <Text style={styles.subtitle}>
            Connect with local service professionals
          </Text>
        </View>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />
            )}
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>
                I am a:
              </Text>
              <View style={styles.roleButtons}>
                <Button
                  variant={role === 'client' ? 'default' : 'outline'}
                  onPress={() => setRole('client')}
                  style={styles.roleButton}
                >
                  Client
                </Button>
                <Button
                  variant={role === 'worker' ? 'default' : 'outline'}
                  onPress={() => setRole('worker')}
                  style={styles.roleButton}
                >
                  Worker
                </Button>
              </View>
            </View>

            <Button
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
              size="lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </CardContent>
        </Card>

        <View style={styles.switchMode}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <Button
            variant="ghost"
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Button>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#18181b',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#71717a',
  },
  card: {
    marginBottom: 24,
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardContent: {
    gap: 16,
  },
  roleSection: {
    gap: 12,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181b',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  roleButton: {
    flex: 1,
  },
  submitButton: {
    width: '100%',
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchText: {
    color: '#71717a',
  },
  switchButton: {
    padding: 0,
    height: 'auto',
  },
}); 