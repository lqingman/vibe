import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CusPressable from './CusPressable';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {Dimensions} from 'react-native';
import FilterOption from './FilterOption';

const windowWidth = Dimensions.get('window').width;

export default function FilterMenu() {
  const [show, setShow] = useState(false);
  const progressHeight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: progressHeight.value,
    }
  });

  const startAnimation = () => {
    if (progressHeight.value === 0) {
      // Show the buttons and expand the view
      progressHeight.value = withTiming(50, { duration: 200 });
      setTimeout(() => {
            setShow(true);
        }, 100)
    } else {
      // Hide the buttons and collapse the view
      setShow(false);
      progressHeight.value = withTiming(0, { duration: 200 });
    }
  }

  function filterHandler() {
    startAnimation();
    console.log('Filter');
  }

  return (
    <View style={{flex:1}}>
      <CusPressable pressedHandler={startAnimation} componentStyle={styles.iconContainer}>
        <FontAwesome5 name="filter" size={24} color="lightgrey" />
      </CusPressable>
      <Animated.View style={[styles.container, animatedStyle]}>
        {show && (
          <View style={styles.filterContainer}>
            <FilterOption filterHandler={filterHandler} filterText="All" />
            <FilterOption filterHandler={filterHandler} filterText="Latest" />
            <FilterOption filterHandler={filterHandler} filterText="Nearest" />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: 'white',
    //borderRadius: 25,
    //position: 'absolute',
    //bottom: 20,
    //right: 20,
    //padding: 10,
    paddingVertical: 20,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: windowWidth*0.98,
    backgroundColor: 'white',
    position: 'absolute',
    right: 5,
    marginTop: 45,
    borderRadius: 10,
    //elevation: 15,
    top: 10,
    //overflow: 'hidden',
    zIndex: 1,
    paddingHorizontal: 20,
  },
  filterContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterText: {
    fontSize: 16,
    //fontWeight: 'bold',
  },
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
});