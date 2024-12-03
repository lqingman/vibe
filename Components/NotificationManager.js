import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// set up notifications
async function setupNotifications() {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: false,
          allowAnnouncements: false,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: false,
        },
      });
      finalStatus = status;
    }
    //console.log('Notification permission status:', finalStatus);
    return finalStatus === 'granted';
  } catch (error) {
    //console.error('Error setting up notifications:', error);
    return false;
  }
}

// Helper function to calculate when to trigger the notification
function calculateTriggerTime(eventDate, eventTime, timeOption) {
  try {
    // Parse the time string
    const timeMatch = eventTime.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      console.error('Invalid time format');
      return null;
    }
  
    let [_, hours, minutes, seconds, meridian] = timeMatch;
    
    // Convert to 24-hour format
    hours = parseInt(hours);
    if (meridian.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (meridian.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  
    // Create Date object and set time components individually
    const [year, month, day] = eventDate.split('-').map(num => parseInt(num));
    const event = new Date();
    event.setFullYear(year);
    event.setMonth(month - 1);
    event.setDate(day);
    event.setHours(hours, parseInt(minutes), parseInt(seconds));
    
    console.log('Event date components:', {
      year, month, day, hours, minutes, seconds, meridian
    });
    console.log('Original event time (local):', event.toLocaleString());
  
    // Calculate offset based on timeOption
    let finalDate;
    switch(timeOption) {
      case "At time of event":
        finalDate = event;
        break;
      case "30 minutes before":
        finalDate = new Date(event.getTime() - (30 * 60 * 1000));
        break;
      case "1 hour before":
        finalDate = new Date(event.getTime() - (60 * 60 * 1000));
        break;
      case "2 hours before":
        finalDate = new Date(event.getTime() - (2 * 60 * 60 * 1000));
        break;
      case "1 day before":
        finalDate = new Date(event.getTime() - (24 * 60 * 60 * 1000));
        break;
      case "2 days before":
        finalDate = new Date(event.getTime() - (2 * 24 * 60 * 60 * 1000));
        break;
      case "1 week before":
        finalDate = new Date(event.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      default:
        finalDate = event;
    }
    //console.log('Final trigger time (local):', finalDate.toLocaleString());
    return finalDate;
  } catch (error) {
    //console.error('Error calculating trigger time:', error);
    return null;
  }
}

// Schedule a notification
export async function scheduleNotificationHandler(eventTitle, eventDate, eventTime, timeOption) {
  try {
    const isSetup = await setupNotifications();
    if (!isSetup) {
      console.log('Notifications setup failed');
      return null;
    }

    const triggerDate = calculateTriggerTime(eventDate, eventTime, timeOption);
    if (!triggerDate) return null;

    const now = new Date();
    
    // Calculate seconds until trigger
    const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

    // console.log('Time details:', {
    //   currentLocalTime: now.toLocaleString(),
    //   scheduledLocalTime: triggerDate.toLocaleString(),
    //   secondsUntilTrigger: secondsUntilTrigger,
    //   minutesUntilTrigger: Math.floor(secondsUntilTrigger / 60)
    // });

    if (secondsUntilTrigger <= 0) {
      console.log('Cannot schedule notifications for past dates');
      return null;
    }

    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Event Reminder",
        body: `Your event "${eventTitle}" is coming up!`,
        //priority: 'max',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilTrigger,
        repeats: false
      },
    });
    return notificationId;
  } catch (err) {
    console.error("Schedule notification error:", err);
    return null;
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

// Add this function to test scheduled notifications
export async function getAllScheduledNotifications() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('All scheduled notifications:', scheduledNotifications);
  return scheduledNotifications;
}