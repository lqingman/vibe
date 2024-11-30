import React from 'react'
import ExploreCards from './ExploreCards';
import { StyleSheet } from 'react-native';
import MasonryList from 'reanimated-masonry-list';
import { useNavigation } from '@react-navigation/native';

export default function ExploreList({list}) {
  const navigation = useNavigation();
  
  return (
    <MasonryList
      data={list}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={styles.masonry}
      showsVerticalScrollIndicator={false}
      renderItem={({item, i}) => <ExploreCards data={item} index={i} onPress={() => navigation.navigate('Details', { activity: item })} />}
      refreshing={false}
    />
  );
};
    
const styles = StyleSheet.create({
  masonry: {
    paddingRight: 18,
  },
});
    