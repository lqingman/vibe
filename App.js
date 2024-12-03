import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CreatePost from './Screens/CreatePost';
import Profile from './Screens/Profile';
import ChangeLocation from './Screens/ChangeLocation';
import Explore from './Screens/Explore';
import Joined from './Screens/Joined';
import Color from './Styles/Color';
import Setting from './Screens/Setting';
import Login from './Screens/Login';
import Signup from './Screens/Signup';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Pressable, View, Alert, Platform } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebaseSetup';
import Details from './Screens/Details';
import Welcome from './Screens/Welcome';
import 'react-native-reanimated';
import { signOut } from 'firebase/auth';
import { AntDesign } from '@expo/vector-icons';


// Create the Stack Navigator
const Stack = createNativeStackNavigator();
// Create the Bottom Tab Navigator
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

// Create the Auth Stack Navigator
const AuthStack = <>
  <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }}/>
  <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
  <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }}/>
</>;

// Create the Home Screen
export default function App() {
  const [isUserLogin, setIsUserLogin] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      //console.log('User:', user);
      if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
        setIsUserLogin(true);
      } else {
      // User is signed out
        setIsUserLogin(false);
      }
    })
  }, []);

  //useEffect for notification setup
  useEffect(() => {
    async function configurePushNotifications() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Push notifications are required for event reminders.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Create notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('events', {
          name: 'Event Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    configurePushNotifications();
  }, []);

  // Create the Material Top Tab Navigator for the Home Screen
  function HomeTopTabs() {
    const insets = useSafeAreaInsets();
    return (
      <View
      style={{
        flex: 1,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <TopTab.Navigator
      initialRouteName="Explore"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Color.white,
          height: 50,
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          textTransform: "capitalize",
          fontWeight: "bold",
          color: Color.black,
          fontSize: 16,
          width: "100%",
        },
        tabBarIndicatorStyle: {
          height: 2,
          borderRadius: 5,
          backgroundColor: Color.navigatorBg,
        },
        tabBarShowLabel: true,
      }}>
        <TopTab.Screen name="Explore" component={Explore} options={{
          tabBarLabel: "Explore",
        }}/>
        <TopTab.Screen name="Joined" component={Joined} options={{
            tabBarLabel: "Joined",
          }}/>
      </TopTab.Navigator>
      </View>
    );
  }

  // Create the Bottom Tab Navigator
  function tabNavigator() {
    return (
      // Create the bottom tab navigator 
      <Tab.Navigator
      initialRouteName="Home"
      safeAreaInsets={{bottom: 0}}
      screenOptions={{
        tabBarActiveTintColor: Color.navigatorBg,
        tabBarActiveBackgroundColor: Color.background,
        tabBarInactiveBackgroundColor: Color.background,
        tabBarInactiveTintColor: 'lightgray',
        tabBarStyle: {
          height: '8%',
          paddingBottom: 0,
          borderTopWidth: 0,
          elevation: 0,
          borderTopWidth: 1, 
          borderTopColor: Color.lightgray,
        },
        tabBarItemStyle: {
          paddingBottom: 0,
        },
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginTop: 10,
        },
        headerStyle: {
          backgroundColor: Color.background,
        },
        headerTintColor: Color.black,
    }}
    >
      {/* Create the Home screen */}
      <Tab.Screen 
        name="Home" 
        component={HomeTopTabs} 
        options = {({ navigation }) => ({
          title: 'Home',
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('ChangeLocation')}>
              <FontAwesome5 name="map-marked" size={22} color={Color.navigatorBg} style={{ marginRight: 15 }} />
            </Pressable>
          ),
          tabBarIcon: ({color}) => <FontAwesome5 name="home" size={28} color={color} />,
        })}
      />
      {/* Create the CreatePost screen */}
      <Tab.Screen 
        name="CreatePost" 
        component={CreatePost} 
        options = {{
          title: 'Create Post',
          // headerShown: false,
          tabBarIcon: ({color}) => <FontAwesome5 name="plus-circle" size={28} color={color} />
        }}
      />
      {/* Create the Profile screen */}
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options = {({ navigation }) => ({
          title: 'Profile',
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('Setting')}>
              <FontAwesome5 name="cog" size={24} color={Color.navigatorBg} style={{ marginRight: 15 }} />
            </Pressable>
          ),
          headerStyle: { backgroundColor: Color.background },
          headerTintColor: Color.black,
          tabBarIcon: ({color}) => <FontAwesome5 name="user-alt" size={28} color={color} />

        })}
      />
    </Tab.Navigator>
    )
  }

  // Create the Stack Navigator
  function StackNavigator() {
    return(
      <Stack.Navigator initialRouteName={isUserLogin ? 'Tab' : 'Welcome'}>
        {isUserLogin ? (
          <>
            {/* Create the tab navigator */}
            <Stack.Screen 
              name="Tab" 
              children={tabNavigator} 
              options={{ 
                headerShown: false,
                headerBackTitle: "Home" 
              }}
            />            
            {/* Create the Home screen */}
            <Stack.Screen name="ChangeLocation" 
            component={ChangeLocation} 
            options={{
              title:"Choose a Location", 
              headerStyle:{backgroundColor:Color.background}, 
              headerTintColor: Color.black,
              headerBackTitle: "Back",
            }}/>
            <Stack.Screen 
              name="Details" 
              component={Details} 
              options={{
                title: "Details", 
                headerStyle: { backgroundColor: Color.background }, 
                headerTintColor: Color.black,
                headerBackTitle: "Home",
              }}
            />
            <Stack.Screen
            name="Setting"
            component={Setting}
            options={{
              title: "Settings",
              headerRight: () => (
                <Pressable onPress={() => signOut(auth)}>
                  <AntDesign name="logout" size={24} color={Color.navigatorBg} />
                </Pressable>
              ),
              headerStyle: { backgroundColor: Color.background },
              headerTintColor: Color.black,
            }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePost}
              options={{
                title: "Edit Post",
                headerStyle: { backgroundColor: Color.background },
                headerTintColor: Color.black,
                // headerShown: false
              }}
            />
            <Stack.Screen 
            name="UserProfile" 
            component={Profile} 
            options={{
              title: "Profile",
              headerStyle: { backgroundColor: Color.background },
              headerTintColor: Color.black,
              headerBackTitle: "Back"
            }}
            />
          </>
        ) : AuthStack}
      </Stack.Navigator>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
