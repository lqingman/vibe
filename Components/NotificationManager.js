import * as Notifications from 'expo-notifications';

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

  export async function scheduleNotificationHandler(eventTitle, eventDate, timeOption) {
    try{
      const hasPermission = await verifyPermissions();
      if (!hasPermission) {
        Alert.alert('You need to grant notification permissions.');
        return;
      }

      const triggerDate = calculateTriggerTime(eventDate, timeOption);
    
    // Don't schedule if the date is in the past
    if (triggerDate <= new Date()) {
      console.log('Cannot schedule notifications for past dates');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Event Reminder",
        body: `Your event "${eventTitle}" is coming up!`,
      },
      trigger: {
          date: triggerDate,
        },
      });
      return notificationId;
    }
    catch (err) {
      console.log("schedule notification error", err);
    }
  }

// Cancel a scheduled notification
export async function cancelNotification(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Helper function to calculate when to trigger the notification
function calculateTriggerTime(eventDate, timeOption) {
  const event = new Date(eventDate);
  
  switch(timeOption) {
    case "At time of event":
      return event;
    case "30 minutes before":
      return new Date(event.getTime() - (30 * 60 * 1000));
    case "1 hour before":
      return new Date(event.getTime() - (60 * 60 * 1000));
    case "2 hours before":
      return new Date(event.getTime() - (2 * 60 * 60 * 1000));
    case "1 day before":
      return new Date(event.getTime() - (24 * 60 * 60 * 1000));
    case "2 days before":
      return new Date(event.getTime() - (2 * 24 * 60 * 60 * 1000));
    case "1 week before":
      return new Date(event.getTime() - (7 * 24 * 60 * 60 * 1000));
    default:
      return event;
  }
}