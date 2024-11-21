import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CusPressable from './CusPressable';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function DropDown() {
  const [show, setShow] = useState(false);
  const progressHeight = useSharedValue(0);
  const arrowHeight = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: progressHeight.value,
    }
  });

  const animatedArrow = useAnimatedStyle(() => {
    return {
      borderTopWidth: arrowHeight.value,
      borderBottomWidth: arrowHeight.value,
    }
  });

  const startAnimation = () => {
    progressHeight.value === 0 && (
      (arrowHeight.value = withTiming(10, { duration: 1 })),
      (progressHeight.value = withTiming(50, { duration: 300 })), // Adjust your height as needed here (100)
      (setShow(true)))
    progressHeight.value > 0 && (
      (progressHeight.value = withTiming(0, { duration: 300 })),
      setTimeout(() => {
          arrowHeight.value = withTiming(0, { duration: 1 })
          setShow(false);
      }, 200))
  }

  function filterHandler() {
    startAnimation();
    console.log('Filter');
  }

  return (
    <View style={{flex:1}}>
      <CusPressable pressedHandler={startAnimation} componentStyle={{backgroundColor:"white"}}>
        <FontAwesome5 name="filter" size={22} color="lightgrey" />
      </CusPressable>
      <Animated.View style={[styles.container, animatedStyle]}>
        {show && (
          <View style={styles.filterContainer}>
            <CusPressable pressedHandler={filterHandler}>
              <Text style={styles.filterText}>All</Text>
            </CusPressable>
            <CusPressable pressedHandler={filterHandler}>
              <Text style={styles.filterText}>Latest</Text>
            </CusPressable>
            <CusPressable pressedHandler={filterHandler}>
              <Text style={styles.filterText}>Nearest</Text>
            </CusPressable>
          </View>
        )}
      </Animated.View>
      {/* <Animated.View style={[styles.arrow, animatedArrow]} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        width: windowWidth*0.98,
        height: 900,
        backgroundColor: 'white',
        position: 'absolute',
        right: 5,
        marginTop: 30,
        borderRadius: 10,
        //elevation: 15,
        top: 10,
        //overflow: 'hidden',
        zIndex: 1,
    },
    arrow: {
        position: 'absolute',
        top: 25,
        right: 7,
        borderTopWidth: 0,
        borderTopColor: 'transparent',
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
        borderRightWidth: 10,
        borderRightColor: 'white',
        transform: [{ rotate: '90deg' }],
    },
    filterContainer: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 16,
        //fontWeight: 'bold',
    },
});