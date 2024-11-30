import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import ExploreCard from './ExploreCard';

export default function ExploreCards ({data, index, onPress}) {
  if (!data) return null; 
  
  const even = index % 2 === 0;
  const spacing = 12;

  // Calculate card height based on index pattern
  const getCardHeight = (index) => {
    if (index === 0) {
      return 300;
    } else {
      return 280;
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index < 6 ? index * 80 : 0)}
      style={{
        flex: 1,
        paddingLeft: !even ? spacing / 2 : 0,
        paddingRight: even ? spacing / 2 : 0,
      }}>
        <ExploreCard
          data={data}
          onPress={onPress}
          cardStyle={{ height: getCardHeight(index) }}
          contentStyle={{ flexDirection: 'column' }}
        />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginLeft: 20,
    width: "90%",
    height: 300,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 10,
  },
  inner: {
    width: '100%',
    height: '100%',
  },
  media: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    height: '90%',
    width: '100%',
    resizeMode: 'cover',
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    height: '10%',
  },
  text: {
    paddingLeft: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 5,
    color: 'purple',
  },
});