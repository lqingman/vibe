import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Home from './Screens/Home';
import CreatePost from './Screens/CreatePost';
import Profile from './Screens/Profile';
import ChangeLocation from './Screens/ChangeLocation';
import Explore from './Screens/Explore';
import Joined from './Screens/Joined';
import Color from './Styles/Color';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { SafeAreaView, View } from 'react-native';
import Style from './Styles/Style';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

export default function App() {
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
        options = {{
          title: 'Home',
          headerShown: true,
          tabBarIcon: ({color}) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      {/* Create the CreatePost screen */}
      <Tab.Screen 
        name="CreatePost" 
        component={CreatePost} 
        options = {{
          title: 'Create Post',
          tabBarIcon: ({color}) => <FontAwesome5 name="plus-circle" size={24} color={color} />
        }}
      />
      {/* Create the Profile screen */}
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options = {{
          tabBarIcon: ({color}) => <FontAwesome5 name="user-alt" size={24} color={color} />
        }}
        />
    </Tab.Navigator>
    )
  }

  function StackNavigator() {
    return(
        <Stack.Navigator initialRouteName='Tab'>
          {/* Create the tab navigator */}
          <Stack.Screen name="Tab" children={tabNavigator} options={{headerShown: false}}/>
          {/* Create the Home screen */}
          <Stack.Screen name="ChangeLocation" 
          component={ChangeLocation} 
          options={{
            title:"Change Your Location", 
            headerStyle:{backgroundColor:Color.navigatorBg}, 
            headerTintColor: Color.white,
            headerBackTitleVisible: false,
          }}/>
        </Stack.Navigator>
    )
  }

  return (
    // <SafeAreaView style={Style.appContainer} 
    // forceInset={{ top: "always", bottom: "never" }}
    // > 
    <SafeAreaProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
