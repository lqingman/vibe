import { View, Text } from 'react-native'
import React from 'react'
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function CreatePost() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Text>CreatePost</Text>
    </View>
  )
}