import { View, Text, Button } from 'react-native'
import React from 'react'
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase/firebaseSetup';

export default function Setting () {
  return (
    <View>
      <Text>Setting</Text>
      <Button
        title="Sign out"
        onPress={()=>signOut(auth)}/>
    </View>
  )
}

