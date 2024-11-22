import { View, Button, Alert } from 'react-native'
import React from 'react'
import * as Notifications from 'expo-notifications';

export default function NotificationManager() {

  async function verifyPermissions() {
    try{
      const permissionResponse = await Notifications.getPermissionsAsync();
      if (!permissionResponse.granted) {
        const newPermission = await Notifications.requestPermissionsAsync();
        return newPermission.granted;
      }
      return true;
    }
    catch (err) {
      console.log("verify permissions error", err);
    }
  }

  async function scheduleNotificationHandler() {
    try{
      const hasPermission = await verifyPermissions();
      if (!hasPermission) {
        Alert.alert('You need to grant notification permissions.');
        return;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'First Notification',
          body: 'This is my first notification',
        },
        trigger: {
          //type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });
    }
    catch (err) {
      console.log("schedule notification error", err);
    }
  }

  return (
    <View>
      <Button title="Schedule a Notification" onPress={scheduleNotificationHandler}/>
    </View>
  )
}