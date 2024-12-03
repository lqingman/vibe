import { View, FlatList, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'react-native-elements';
import Animated from 'react-native-reanimated';
import Style from '../Styles/Style';

// Get the window width
const { width: windowWidth } = Dimensions.get('window');

// Carousel component in detail screen
export default function Carousel({ data }) {
  // State for current index
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={windowWidth}
        decelerationRate="fast"
        pagingEnabled={true}
        onScroll={(data) => {
          const x = data.nativeEvent.contentOffset.x / windowWidth;
          //console.log("x", x)
          setCurrentIndex(Math.round(x));
        }}
        scrollEventThrottle={0}
        data={data}
        renderItem={({ item }) => {
          return <View style={Style.carouselContainer}>
            <Image source={{ uri: item }} style={Style.carouselImage} />
          </View>
        }}
        keyExtractor={(item) => item}
      />
      <View style={Style.carouselIndicatorContainer}>
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {data.map((_, index) => (
            <View key={index} style={[Style.carouselIndicator, { backgroundColor: index === currentIndex ? 'black' : 'gray' }]} />
          ))}
        </Animated.View>
      </View>
    </View>
  )
}