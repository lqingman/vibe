import { View, FlatList, Dimensions, StyleSheet, Pressable, Text } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'react-native-elements';
import Feather from '@expo/vector-icons/Feather';
import Animated from 'react-native-reanimated';

const { width: windowWidth } = Dimensions.get('window');

export default function Carousel({ data }) {
  //console.log("data", data)
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
          return <View style={styles.container}>
            <Image source={{ uri: item }} style={styles.image} />
          </View>
        }}
        keyExtractor={(item) => item.index}
      />
      <View style={styles.indicatorContainer}>
        {/* <Pressable>
          <Feather name="arrow-left" size={24} color="black" />
        </Pressable>
        <Pressable>
          <Feather name="arrow-right" size={24} color="black" />
        </Pressable> */}
        <Animated.View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {data.map((_, index) => (
            <View key={index} style={[styles.indicator, { backgroundColor: index === currentIndex ? 'black' : 'gray' }]} />
          ))}
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: windowWidth,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: windowWidth,
    height: windowWidth * 0.8,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: windowWidth - 20,
    marginTop: 10
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5
  }
})