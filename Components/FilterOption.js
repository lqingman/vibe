import { Text, StyleSheet } from 'react-native'
import React from 'react'
import CusPressable from './CusPressable'

export default function FilterOption({filterHandler, filterText, textColor}) {

  return (
    <CusPressable
      componentStyle={styles.filterButton}
      pressedHandler={filterHandler}
      childrenStyle={{alignItems: 'center'}}
    >
      <Text style={[styles.text, {color: textColor}]}>{filterText}</Text>
    </CusPressable>
  )
}

const styles = StyleSheet.create({
  filterButton: {
    width: '25%',
    height: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'lightgrey',
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    color: 'black',
  }
})
