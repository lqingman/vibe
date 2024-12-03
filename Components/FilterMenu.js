import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import CusPressable from './CusPressable';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FilterOption from './FilterOption';
import Style from '../Styles/Style';

// Custom filter menu component in the explore screen
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
  }

  return (
    <View style={{flex:1}}>
      <CusPressable pressedHandler={startAnimation} componentStyle={Style.filterIconContainer}>
        <FontAwesome5 name="filter" size={24} color="lightgrey" />
      </CusPressable>
      <Animated.View style={[Style.filterMenuContainer, animatedStyle]}>
        {show && (
          <View style={Style.filterContainer}>
            <FilterOption filterHandler={() => filterHandler('All')} filterText="All" textColor={allTextColor} />
            <FilterOption filterHandler={() => filterHandler("Latest")} filterText="Latest" textColor={latestTextColor} />
            <FilterOption filterHandler={() => filterHandler("Nearest")} filterText="Nearest" textColor={nearestTextColor} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}