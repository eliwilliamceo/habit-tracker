// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#10B981', tabBarStyle: { backgroundColor: '#fff' } }}>
      <Tabs.Screen 
        name="(tabs)/index" 
        options={{ 
          title: 'Hoy', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="(tabs)/add" 
        options={{ 
          title: 'Nuevo', 
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="(tabs)/dashboard" 
        options={{ 
          title: 'Progreso', 
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}
