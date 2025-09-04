import React from 'react'
import { View, Text } from 'react-native'
import SwipeDeck from './src/components/SwipeCard'

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <Text style={{ textAlign: 'center', fontSize: 20 }}>BlindMatch (Expo)</Text>
      <SwipeDeck />
    </View>
  )
}
