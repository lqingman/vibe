import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CusPressable from './CusPressable';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {Dimensions} from 'react-native';
import FilterOption from './FilterOption';

// Get window width
const windowWidth = Dimensions.get('window').width;

// Custom filter menu component
export default function FilterMenu({handleFilterSelection}) {
  // State for showing filter menu
  const [show, setShow] = useState(false);
  // Shared value for animation
  const progressHeight = useSharedValue(0);
  // State for text colors
  const [allTextColor, setAllTextColor] = useState('red');
  const [latestTextColor, setLatestTextColor] = useState('black');
  const [nearestTextColor, setNearestTextColor] = useState('black');

  // Animated style for the filter menu
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: progressHeight.value,
    }
  });

  // Function to start the animation
  const startAnimation = () => {
    if (progressHeight.value === 0) {
      // Show the buttons and expand the view
      progressHeight.value = withTiming(50, { duration: 300 });
      setTimeout(() => {
            setShow(true);
        }, 200)
    } else {
      // Hide the buttons and collapse the view
      setShow(false);
      progressHeight.value = withTiming(0, { duration: 300 });
    }
  }

  // Function to handle filter selection
  function filterHandler(selectedFilter) {
    startAnimation();
    handleFilterSelection(selectedFilter);
    if (selectedFilter === 'All') {
      setAllTextColor('red');
      setLatestTextColor('black');
      setNearestTextColor('black');
    } else if (selectedFilter === 'Latest') {
      setLatestTextColor('red');
      setAllTextColor('black');
      setNearestTextColor('black');
    } else if (selectedFilter === 'Nearest') {
      setNearestTextColor('red');
      setAllTextColor('black');
      setLatestTextColor('black');
    }
    //console.log(`Filter set for ${selectedFilter}`);
  }

  return (
    <View style={{flex:1}}>
      <CusPressable pressedHandler={startAnimation} componentStyle={styles.iconContainer}>
        <FontAwesome5 name="filter" size={24} color="lightgrey" />
      </CusPressable>
      <Animated.View style={[styles.container, animatedStyle]}>
        {show && (
          <View style={styles.filterContainer}>
            <FilterOption filterHandler={() => filterHandler('All')} filterText="All" textColor={allTextColor} />
            <FilterOption filterHandler={() => filterHandler("Latest")} filterText="Latest" textColor={latestTextColor} />
            <FilterOption filterHandler={() => filterHandler("Nearest")} filterText="Nearest" textColor={nearestTextColor} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: 'white',
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
    top: 10,
    overflow: 'hidden',
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