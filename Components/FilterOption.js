import { Text } from 'react-native'
import React from 'react'
import CusPressable from './CusPressable'
import Style from '../Styles/Style'

// Custom filter option buttons
export default function FilterOption({filterHandler, filterText, textColor}) {
  return (
    <CusPressable
      componentStyle={Style.filterButton}
      pressedHandler={filterHandler}
      childrenStyle={{alignItems: 'center'}}
    >
      <Text style={[Style.filterText, {color: textColor}]}>{filterText}</Text>
    </CusPressable>
  )
}