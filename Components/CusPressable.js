import { Pressable, View } from 'react-native'
import React from 'react'
import Style from '../Styles/Style';

// Custom Pressable component that allows for custom styling when pressed
export default function CusPressable({ children, pressedHandler, componentStyle, pressedStyle, childrenStyle, android_ripple, longPressHandler, disabled }) { 
  return (
    <Pressable 
      onPress={pressedHandler} 
      style={({ pressed }) => [
        Style.defaultPressable,
        componentStyle,
        pressed && Style.defaultPressed, 
        pressed && pressedStyle, 
      ]}
      android_ripple={android_ripple}
      onLongPress={longPressHandler}
      disabled={disabled}
    >
      {({ pressed }) => (
        <View style={childrenStyle}>
          {typeof children === 'function' ? children(pressed) : children}
        </View>
      )}
    </Pressable>
  );
}