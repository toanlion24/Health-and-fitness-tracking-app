import React from 'react';
import { View, Text } from 'react-native';

export default function MainTab() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' }}>
      <Text style={{ fontSize: 20, color: '#2e7d32', fontWeight: 'bold' }}>
        🎉 Chúc mừng! Bạn đã vào màn hình chính.
      </Text>
    </View>
  );
}