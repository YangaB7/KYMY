import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';  
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
import Home from "./pages/home";
import GamePage from "./pages/gamepage";
import Crossword from "./pages/games/Crossword/crossword";
import Sudoku from "./pages/games/Sudoku/sudoku";
import Matching from "./pages/games/matching";
import Scramble from"./unused/wordscramble";
import SlideEntry from "./pages/games/slidePuzzle/entry";
import Slide from "./pages/games/slidePuzzle/slidepuzzle";
import TileMatch from './pages/games/tileMatch/tilematch';
import TileEntry from './pages/games/tileMatch/matchEntry';
import SudokuEntry from './pages/games/Sudoku/sudokuEntry';
import Crypt from './pages/games/decrypt';
import OrderGame from './pages/games/Order/ordergame';
import OrderEntry from './pages/games/Order/orderEntry';
import WordScramble from './pages/games/newWordScramble';  
import MazeGame from './pages/games/maze';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Learn from './pages/learn';
import { Ionicons } from '@expo/vector-icons';


SplashScreen.preventAutoHideAsync();
                                                                                                          
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 768; 
function TabNavigator() {
  return (
    <Tab.Navigator
    initialRouteName="Home" 
    screenOptions={({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === 'Home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'Learn') {
        iconName = focused ? 'book' : 'book-outline';
      } else if (route.name === 'Games') {
        iconName = focused ? 'dice' : 'dice-outline';
      }

      const iconSize = isLargeScreen ? 25 : 30;

      return <Ionicons name={iconName} size={iconSize} color={color} />;
    },
    tabBarLabelStyle: {
      fontSize: isLargeScreen ? 25 : 17,
      fontFamily:"Cabin-Medium"
    },
    tabBarStyle: {
      height: isLargeScreen ? 80 : 75,
      paddingBottom: isLargeScreen ? 10 : 15,
    },
    tabBarActiveTintColor: '#FDA758',
    tabBarInactiveTintColor: 'gray',
  })}
>
  <Tab.Screen name="Learn" component={Learn} />
  <Tab.Screen name="Home" component={Home} />
  <Tab.Screen name="Games" component={GamePage} />
</Tab.Navigator>
  );
}


export default function App() {

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload images
        const images = [
          require('./assets/arrow.png'),
          require('./assets/yangaLook.png'),
          require('./assets/fire.png'),
          require('./assets/heart_Icon.png'),
          require('./assets/home.png'),
          require('./assets/megRun.png'),
          require('./assets/slidePuzzle.png'),
          require('./assets/Sudoku.png'),
          require('./assets/tilematch.png'),
          require('./assets/boyTwo.png'),
        ];

        const cacheImages = images.map(image => {
          return Asset.loadAsync(image);
        });

        const fonts = Font.loadAsync({
          'Cabin-Medium': require('./assets/fonts/Cabin-Medium.ttf'),
          ...Ionicons.font,
        });

        await Promise.all([...cacheImages, fonts]);

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator  initialRouteName="Main" options={{headerShown:false}}>
          <Stack.Screen name="Main" component={TabNavigator} options={{headerShown:false}}/>
          <Stack.Screen name="Crossword" component={Crossword} options={{headerShown:false}}/>
          <Stack.Screen name="Sudoku" component={Sudoku} options={{headerShown:false}}/>
          <Stack.Screen name="SudokuEntry" component={SudokuEntry} options={{headerShown:false}} />
          <Stack.Screen name="Matching" component={Matching} options={{headerShown:false}} />
          <Stack.Screen name="SlideEntry" component={SlideEntry} options={{headerShown:false}} />
          <Stack.Screen name="SlidePuzzle" component={Slide} options={{headerShown:false}} />
          <Stack.Screen name="Scramble" component={Scramble} options={{headerShown:false}}/>
          <Stack.Screen name="WordScramble" component={WordScramble} options={{headerShown:false}}/>
          <Stack.Screen name="TileMatch" component={TileMatch} options={{headerShown:false}}/>
          <Stack.Screen name="TileEntry" component={TileEntry} options={{headerShown:false}}/>
          <Stack.Screen name="Crypt" component={Crypt} options={{headerShown:false}}/>
          <Stack.Screen name="OrderGame" component={OrderGame} options={{headerShown:false}}/>
          <Stack.Screen name="OrderEntry" component={OrderEntry} options={{headerShown:false}}/>
          <Stack.Screen name="MazeGame" component={MazeGame} options={{headerShown:false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
