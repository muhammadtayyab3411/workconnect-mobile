# WorkConnect Mobile App

A React Native mobile app built with Expo for the WorkConnect platform - connecting clients with local service workers.

## 🚀 Features

### ✅ Completed (MVP Phase 1)
- **Authentication System**: Login/Signup with role selection (Client/Worker)
- **Dashboard**: Role-based dashboard with quick stats and recent activity
- **UI Components**: Custom components matching shadcn/ui design system
- **NativeWind**: Tailwind CSS styling for React Native
- **TypeScript**: Full TypeScript support

### 📱 Screens
1. **AuthScreen**: Combined login/signup with role selection
2. **DashboardScreen**: Role-based overview and navigation hub

## 🛠️ Technology Stack

- **React Native**: 0.72+
- **Expo**: SDK 49+
- **NativeWind**: Tailwind CSS for React Native
- **TypeScript**: Type safety
- **AsyncStorage**: Local data persistence
- **React Context**: State management

## 🎨 UI Design System

The app uses a custom UI component library that matches the shadcn/ui design system from the web app:

- **Button**: Multiple variants (default, secondary, outline, ghost, destructive)
- **Card**: With header, title, description, content, and footer components
- **Input**: Form inputs with validation and error states
- **Badge**: Status indicators

## 🏗️ Project Structure

```
workconnect-mobile/
├── components/
│   └── ui/                 # Custom UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       └── index.ts
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── screens/
│   ├── AuthScreen.tsx      # Login/Signup screen
│   └── DashboardScreen.tsx # Dashboard screen
├── utils/
│   └── cn.ts              # Utility for combining class names
├── App.tsx                # Main app component
├── global.css             # Tailwind CSS imports
├── tailwind.config.js     # Tailwind configuration
└── metro.config.js        # Metro bundler configuration
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## 🔐 Authentication

Currently uses mock authentication for demo purposes. The app supports:
- Email/password login and signup
- Role selection (Client or Worker)
- Persistent authentication state
- Automatic role-based routing

## 📋 Next Steps (Remaining Screens)

1. **JobsScreen**: Browse/manage jobs based on user role
2. **JobDetailsScreen**: Detailed job view and interactions
3. **ProfileScreen**: User profile and settings

## 🎯 Demo Features

- **Client Role**: View active jobs, total spent, post new jobs
- **Worker Role**: View completed jobs, total earned, find new jobs
- **Responsive Design**: Works on both iOS and Android
- **Consistent UI**: Matches web app design system

## 🔧 Development

The app is set up for easy development with:
- Hot reloading
- TypeScript support
- Tailwind CSS utilities
- Component-based architecture
- Context-based state management

## 📱 Testing

Test the app with different user roles:
1. Sign up as a "Client" to see client-specific dashboard
2. Sign up as a "Worker" to see worker-specific dashboard
3. Test login/logout functionality
4. Verify responsive design on different screen sizes 