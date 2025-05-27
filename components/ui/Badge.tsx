import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-input bg-background text-foreground',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <View
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        badgeVariants[variant],
        className
      )}
    >
      <Text className="text-xs font-semibold">
        {children}
      </Text>
    </View>
  );
} 