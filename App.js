import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Screens/Home';
import CreatePost from './Screens/CreatePost';
import Profile from './Screens/Profile';
import ChangeLocation from './Screens/ChangeLocation';
import Color from './Styles/Color';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  function tabNavigator() {
    return (
      // Create the bottom tab navigator 
      <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Color.gold,
        tabBarActiveBackgroundColor: Color.navigatorBg,
        tabBarInactiveBackgroundColor: Color.navigatorBg,
        tabBarStyle: {
          height: '8%',
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          paddingBottom: 12,
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
        component={Home} 
        options = {{
          title: 'Home',
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

  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
