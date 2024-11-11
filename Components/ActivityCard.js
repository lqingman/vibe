import React from 'react';
import {StyleSheet} from 'react-native';
import {CusPressable} from './CusPressable';

const Card = ({children, style, onPress }) => {
  return (
    <CusPressable
      onPress={onPress}
      style={[styles.card, style]}>
    {children}
    </CusPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 200,
    backgroundColor: colors.white,
    borderRadius: sizes.radius,
  },
  inner: {
    width: '100%',
    height: '100%',
  },
});

export default Card;