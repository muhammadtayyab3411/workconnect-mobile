import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: any;
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === 'default' && styles.buttonDefault,
    variant === 'outline' && styles.buttonOutline,
    size === 'lg' && styles.buttonLg,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'default' && styles.textDefault,
    variant === 'outline' && styles.textOutline,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'default' ? '#ffffff' : '#000000'} 
        />
      ) : (
        <Text style={textStyle}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 40,
  },
  buttonDefault: {
    backgroundColor: '#18181b',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  buttonLg: {
    minHeight: 44,
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  textDefault: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#18181b',
  },
}); 