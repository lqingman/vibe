import { View, Text } from 'react-native'
import React from 'react'
import CusPressable from './CusPressable'
import FontAwesome from '@expo/vector-icons/FontAwesome';


export default function FavoriteButton({favorited, componentStyle, childrenStyle, onPress}) {
  //const color = pressed? 'red': 'white'

  return (
    <CusPressable
      componentStyle={componentStyle}
      childrenStyle={childrenStyle}
      pressedHandler={onPress}
    >
      {favorited ?
      <FontAwesome name="heart" size={24} color={'red'} />
      :
      <FontAwesome name="heart-o" size={24} color="black" />
      }
    </CusPressable>
  )
}