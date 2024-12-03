import React from 'react';
import Animated, {FadeInDown} from 'react-native-reanimated';
import ExploreCard from './ExploreCard';

// ExploreCards component to display the explore cards
export default function ExploreCards ({data, index, onPress}) {
  if (!data) return null; 
  
  // Determine if the card is even or odd
  const even = index % 2 === 0;
  const spacing = 4;

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