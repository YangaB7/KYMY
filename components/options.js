import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Options = ({ onClose }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
        <Text>Options</Text>
        <TouchableOpacity onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Options;
