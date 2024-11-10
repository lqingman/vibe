import { Pressable, View } from 'react-native'
import React from 'react'
import Style from '../Styles/Style';

export default function PressableButton({ children, pressedHandler, componentStyle, pressedStyle, childrenStyle, android_ripple, longPressHandler }) { 
  return (
    <Pressable 
      onPress={pressedHandler} 
      style={({ pressed }) => [
        Style.defaultPressable,
        componentStyle,
        pressed && Style.defaultPressed, // Apply default pressed style
        pressed && pressedStyle, // Apply pressed style
      ]}
      android_ripple={android_ripple}
      onLongPress={longPressHandler}
    >
      <View style={childrenStyle}>
        {children}
      </View>
    </Pressable>
  );
}