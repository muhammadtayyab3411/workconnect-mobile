import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  style 
}: BadgeProps) {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      styles[size],
      style
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`]
      ]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  default: {
    backgroundColor: '#18181b',
    borderColor: '#18181b',
  },
  secondary: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  destructive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#e4e4e7',
  },
  success: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  warning: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  
  // Text styles
  text: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  
  // Text colors
  defaultText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#71717a',
  },
  destructiveText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#18181b',
  },
  successText: {
    color: '#ffffff',
  },
  warningText: {
    color: '#ffffff',
  },
  
  // Text sizes
  smText: {
    fontSize: 11,
    lineHeight: 14,
  },
  mdText: {
    fontSize: 12,
    lineHeight: 16,
  },
  lgText: {
    fontSize: 14,
    lineHeight: 18,
  },
}); 