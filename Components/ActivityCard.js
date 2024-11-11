import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import CusPressable from './CusPressable';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FavoriteButton from './FavoriteButton';


export default function ActivityCard ({data, cardStyle, imageStyle, contentStyle, onPress}) {
  if (!data) return null; // Only render if data exists
  //console.log(data)
  return (
    <CusPressable
      onPress={onPress}
      componentStyle={[styles.card, cardStyle]}
      childrenStyle={styles.inner}>
        <View
        style={[styles.media]}>
          <Image style={styles.image} source={{uri: data.image}} />
        </View>
        <View style={[styles.content, contentStyle]}>
          <Text style={styles.text}>{data.date}</Text>
          <Text style={styles.text}>{data.location}</Text>
        </View>
        <FavoriteButton
          componentStyle={{
            position: 'absolute',
            top: 260,
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
    height: '15%',
  },
  text: {
    paddingLeft: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
});