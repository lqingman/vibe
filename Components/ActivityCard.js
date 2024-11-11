import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import CusPressable from './CusPressable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FavoriteButton from './FavoriteButton';


export default function ActivityCard ({cardStyle, imageStyle, contentStyle, onPress, source, content }) {
  return (
    <CusPressable
      onPress={onPress}
      style={[styles.card, cardStyle]}>
        <View
        style={[styles.media]}>
          <Image style={styles.image} source={source} />
        </View>
        <View style={[styles.content, contentStyle]}>{content}</View>
        <FavoriteButton
          componentStyle={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
          childrenStyle={{
            paddingRight: 10,
          }}
          onPress={() => console.log('Pressed')}
          favorited={true}
        />
    </CusPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  inner: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
});