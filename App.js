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
import { Pressable, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebaseSetup';
import Details from './Screens/Details';
import Welcome from './Screens/Welcome';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
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

  // Create the Material Top Tab Navigator for the Home Screen
  function HomeTopTabs() {
    const insets = useSafeAreaInsets();
    return (
      <View
      style={{
        flex: 1,
        paddingTop: 0,
        paddingBottom: insets.bottom,
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
          height: 5,
          borderRadius: 5,
          backgroundColor: "#1DA1F2",
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
        tabBarActiveTintColor: Color.gold,
        tabBarActiveBackgroundColor: Color.navigatorBg,
        tabBarInactiveBackgroundColor: Color.navigatorBg,
        tabBarStyle: {
          height: '8%',
          paddingBottom: 0,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingBottom: 0,
        },
        headerStyle: {
          backgroundColor: Color.navigatorBg,
        },
        headerTintColor: Color.white,
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
              <FontAwesome5 name="map-marked" size={22} color={Color.white} style={{ marginRight: 15 }} />
            </Pressable>
          ),
          tabBarIcon: ({color}) => <FontAwesome5 name="home" size={24} color={color} />,
        })}
      />
      {/* Create the CreatePost screen */}
      <Tab.Screen 
        name="CreatePost" 
        component={CreatePost} 
        options = {{
          title: 'Create Post',
          // headerShown: false,
          tabBarIcon: ({color}) => <FontAwesome5 name="plus-circle" size={24} color={color} />
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
              <FontAwesome5 name="cog" size={24} color={Color.white} style={{ marginRight: 15 }} />
            </Pressable>
          ),
          headerStyle: { backgroundColor: Color.navigatorBg },
          headerTintColor: Color.white,
          tabBarIcon: ({color}) => <FontAwesome5 name="user-alt" size={24} color={color} />

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
            <Stack.Screen name="Tab" children={tabNavigator} options={{headerShown: false}}/>
            {/* Create the Home screen */}
            <Stack.Screen name="ChangeLocation" 
            component={ChangeLocation} 
            options={{
              title:"Choose a Location", 
              headerStyle:{backgroundColor:Color.navigatorBg}, 
              headerTintColor: Color.white,
              headerBackTitleVisible: false,
            }}/>
            <Stack.Screen 
              name="Details" 
              component={Details} 
              options={{
                title: "Details", 
                headerStyle: { backgroundColor: Color.navigatorBg }, 
                headerTintColor: Color.white,
              }}
            />
            <Stack.Screen
            name="Setting"
            component={Setting}
            options={{
              title: "Settings",
              headerStyle: { backgroundColor: Color.navigatorBg },
              headerTintColor: Color.white,
            }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePost}
              options={{
                title: "Edit Post",
                headerStyle: { backgroundColor: Color.navigatorBg },
                headerTintColor: Color.white,
                // headerShown: false
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
