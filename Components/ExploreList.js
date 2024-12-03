import React from 'react'
import ExploreCards from './ExploreCards';
import MasonryList from 'reanimated-masonry-list';
import { useNavigation } from '@react-navigation/native';
import Style from '../Styles/Style';

// ExploreList component to display the explore list using MasonryList
export default function ExploreList({list}) {
  // Get the navigation object
  const navigation = useNavigation();

  return (
    <MasonryList
      data={list}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={Style.masonry}
      showsVerticalScrollIndicator={false}
      renderItem={({item, i}) => <ExploreCards data={item} index={i} onPress={() => navigation.navigate('Details', { activity: item })} />}
      refreshing={false}
    />
  );
};
    