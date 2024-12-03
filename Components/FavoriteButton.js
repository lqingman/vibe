import React from 'react'
import CusPressable from './CusPressable'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Color from '../Styles/Color';

// Custom button component for favoriting activities
export default function FavoriteButton({favorited, componentStyle, childrenStyle, onPress}) {
  return (
    <CusPressable
      componentStyle={componentStyle}
      childrenStyle={childrenStyle}
      pressedHandler={onPress}
    >
      {favorited ?
      <FontAwesome name="heart" size={24} color={Color.red} />
      :
      <FontAwesome name="heart-o" size={24} color={Color.black} />
      }
    </CusPressable>
  )
}