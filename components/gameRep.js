import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const GameRepresentation = () => {
  const animatedValues = useRef(Array(4).fill(0).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((value, index) => 
      Animated.sequence([
        Animated.delay(index * 300),
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        })
      ])
    );

    Animated.loop(Animated.stagger(200, animations)).start();
  }, []);

  return (
    <View style={styles.border}>
      <View style={styles.container}>
        {animatedValues.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.square,
              {
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][index],
                opacity: value,
                transform: [{ scale: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                }) }]
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  border: {
    padding: 10,
    borderWidth: 3,
    borderColor: '#f8a5a7',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: 220,
    height: 220,
  },
  square: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 15,
  },
});

export default GameRepresentation;