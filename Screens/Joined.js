import { View, Text } from 'react-native'
import React from 'react'
import ActivityCard from '../Components/ActivityCard';

export default function Joined() {
  return (
    <View>
      <Text>Joined</Text>
      <ActivityCard
        onPress={() => console.log('Pressed')}
        source={require('../assets/images/users/32.jpeg')}
        content={
          <Text>Activity 1</Text>
        }
      />
    </View>
  )
}