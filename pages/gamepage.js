import React, { useState } from 'react';
import {View,Text,ScrollView,TouchableOpacity,StyleSheet,SafeAreaView} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFonts } from 'expo-font';
import Header from '../components/header';
import { games } from '../commons/constants';


const GamePage = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedGame, setExpandedGame] = useState(null);
  const [fontsLoaded] = useFonts({
    'Cabin-Medium': require('../assets/fonts/Cabin-Medium.ttf'),
  });

  const filteredGames = selectedCategory.includes('All')
  ? games
  : games.filter(game => game.category.includes(selectedCategory));

  const toggleDescription = (gameId) => {
    setExpandedGame(expandedGame === gameId ? null : gameId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={"Select a Game"} handleGoHome={()=>navigation.navigate("Home")}/>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Memory Types" value="All" />
          <Picker.Item label="Sequential Memory" value="Sequential Memory" />
          <Picker.Item label="Visual Memory" value="Visual Memory" />
          <Picker.Item label="Visual-Spatial Memory" value="Visual-Spatial Memory" />
          <Picker.Item label="Working Memory" value="Working Memory" />
          <Picker.Item label="Verbal Memory" value="Verbal Memory" />
          <Picker.Item label="Semantic Memory" value="Semantic Memory" />
        </Picker>
      <ScrollView style={styles.scrollView}>
        {filteredGames.map((game) => (
          <View key={game.id} style={styles.gameContainer}>
            <TouchableOpacity style={styles.gameButton} onPress={() => navigation.navigate(game.nav)}>
              <Text style={styles.gameName}>{game.name}</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => toggleDescription(game.id)}
              >
                <Text style={styles.infoButtonText}>i</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            {expandedGame === game.id && (
              <Text style={styles.gameDescription}>{game.description}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3E9"
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  gameContainer: {
    marginHorizontal: "3%",
    marginVertical: 5,
  },
  gameButton: {
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor:"#FDA758"
  },
  gameName: {
    fontSize: "35%",
    fontWeight: 'bold',
    fontFamily:'Cabin-Medium',
  },
  infoButton: {
    backgroundColor: 'turquoise',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameDescription: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    fontFamily:'Cabin-Medium',
    fontSize:20,
  },
});

export default GamePage;