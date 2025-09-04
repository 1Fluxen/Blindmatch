import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'

export default function SwipeCard({ profile = {}, onLike = ()=>{}, onPass = ()=>{} }) {
  return (
    <View style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', margin: 12 }}>
      {profile.photos?.[0] && (
        <Image source={{ uri: profile.photos[0] }} style={{ width: '100%', height: 360 }} />
      )}
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 18 }}>{profile.display_name}, {profile.age}</Text>
        <Text style={{ color: '#666' }}>{profile.bio}</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity onPress={() => onPass(profile)} style={{ marginRight: 8 }}>
            <Text>Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onLike(profile)}>
            <Text>Gilla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
