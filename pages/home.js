import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity,StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import Fires from "../components/fires";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';

import { games } from '../commons/constants';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

const Home = ({ navigation }) => {

    const [fontsLoaded] = useFonts({
        'Cabin-Medium': require('../assets/fonts/Cabin-Medium.ttf'),
    });

    const [daysPlayed, setDaysPlayed] = useState(0);
    const [suggestedGame, setSuggestedGame] = useState(null);
    const [lastPlayedGame, setLastPlayedGame] = useState(null);

    useEffect(()=>{
        checkAndUpdateStreak();
        selectGameOfTheDay();
    }, [])

    useEffect(() => {
        getLastPlayedGame();
    }, []);

    const getLastPlayedGame = async () => {
        try {
            const storedLastPlayedGame = await AsyncStorage.getItem('lastPlayedGame');
            if (storedLastPlayedGame) {
                setLastPlayedGame(JSON.parse(storedLastPlayedGame));
            }
        } catch (error) {
            console.error('Error getting last played game:', error);
        }
    };
    

    const selectGameOfTheDay = async () => {
        try {
            const today = new Date().toDateString();
            const storedGame = await AsyncStorage.getItem('suggestedGame');
            const storedDate = await AsyncStorage.getItem('suggestedGameDate');

            if (storedDate === today && storedGame) {
                // If a game has already been selected today, use it
                setSuggestedGame(JSON.parse(storedGame));
            } else {
                // If no game was selected today, choose a random game
                const randomGame = games[Math.floor(Math.random() * games.length)];
                setSuggestedGame(randomGame);
                
                // Store the selected game and today's date
                await AsyncStorage.setItem('suggestedGame', JSON.stringify(randomGame));
                await AsyncStorage.setItem('suggestedGameDate', today);
            }
        } catch (error) {
            console.error('Error selecting game of the day:', error);
        }
    };

    const checkAndUpdateStreak = async () => {
        try {
            const lastLoginDate = await AsyncStorage.getItem('lastLoginDate');
            const currentStreak = await AsyncStorage.getItem('currentStreak');

            const today = new Date().toDateString();

            if (lastLoginDate !== today) {
                if (lastLoginDate === new Date(Date.now() - 86400000).toDateString()) {
                    // User logged in yesterday, increase streak
                    const newStreak = currentStreak ? parseInt(currentStreak) + 1 : 1;
                    await AsyncStorage.setItem('currentStreak', newStreak.toString());
                } else {
                    // User didn't log in yesterday, reset streak
                    await AsyncStorage.setItem('currentStreak', '1');
                }
                await AsyncStorage.setItem('lastLoginDate', today);
            }

            // Update state with current streak
            const updatedStreak = await AsyncStorage.getItem('currentStreak');
            setDaysPlayed(parseInt(updatedStreak) || 0);
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    return (
        <SafeAreaView style={styles.BG}>
            <View style={styles.Navbar}>
                <Text style={styles.navText}>Welcome!</Text>
            </View>

            {suggestedGame && (
                <View style={styles.recommendedCont}>
                    <Text style={styles.titleText}>Today's Exercise</Text>
                    <Text style={styles.exerciseName}>{suggestedGame.name}</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate(suggestedGame.nav)}
                        style={styles.playButton}
                    >
                        <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>
                    <Image
                        source={require("../assets/yangaLook.png")}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
            )}

            <View style={styles.progressContainer}>
                <View style={styles.progressBox}>
                    <Text style={styles.progressTitle}>View Progress</Text>
                    <View style={styles.streakBox}>
                        <Text style={styles.streakText}>You've played {daysPlayed} days</Text>
                        <View style={styles.firesContainer}>
                            <Fires numFires={daysPlayed} />
                        </View>
                        <Text style={styles.streakText}>Keep it up!</Text>
                    </View>
                </View>
                <Image
                    source={require("../assets/megRun.png")}
                    style={styles.megImage}
                    resizeMode="contain"
                />
            </View>
            {lastPlayedGame && !isLargeScreen &&(
                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => {
                        navigation.navigate(lastPlayedGame.nav);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                    }}
                >
                    <View style={{width:"100%", paddingHorizontal:"10%", alignItems:"flex-start"}}>
                        <Text style={{fontFamily:"Cabin-Medium"}}>Continue Playing?</Text>
                    </View>
                    <Text style={styles.browseButtonText}>{lastPlayedGame.name}</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    BG: {
        flex: 1,
        backgroundColor: "#FFF3E9",
        flexDirection:"column",
        justifyContent:"space-around"
    },
    Navbar: {
        marginVertical: height * 0.01,
    },
    navText: {
        fontSize: width * 0.1,
        marginLeft: width * 0.05,
        fontFamily:"Cabin-Medium"
    },
    recommendedCont: {
        padding: width * 0.03,
        flexDirection: "column",
        alignSelf: "center",
        borderRadius: 12,
        width: width * 0.85,
        height: isLargeScreen?height*.4 :height * 0.33,
        borderWidth:3,
        backgroundColor: "turquoise",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    titleText: {
        fontSize: width * 0.05, 
        fontFamily:"Cabin-Medium"
    },
    exerciseName: {
        fontFamily:"Cabin-Medium",
        fontSize: width * 0.07,
        marginVertical: height * 0.01,
    },
    playButton: {
        marginVertical: height * 0.01,
        width: width * 0.3,
        height: height * 0.11,
        borderRadius: 6,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    playButtonText: {
        color: "orange",
        fontSize: width * 0.09,
        fontWeight: "bold",
        fontFamily:"Cabin-Medium"
    },
    image: {
        width: width * 0.5,
        height: isLargeScreen?height * 0.25:height * 0.2,
        position: "absolute",
        bottom: 5,
        right: 5,
    },
    progressContainer: {
        justifyContent:"space-around",
        alignItems:"center",
        flexDirection: "row",
        height: isLargeScreen?height * 0.35: height*0.29,
    },
    progressBox: {
        flexDirection: "column",
        marginLeft: width * 0.05,
    },
    progressTitle: {
        fontSize: width * 0.06,
        marginVertical: height * 0.01,
        fontFamily:"Cabin-Medium"
    },
    streakBox: {
        height: height * 0.23,
        width: width * 0.44,
        borderRadius: 10,
        backgroundColor: "orange",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        padding: width * 0.03,
    },
    streakText: {
        fontWeight: "bold",
        fontSize: width*0.04,
        fontFamily:"Cabin-Medium"
    },
    firesContainer: {
        flex: 1,
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 10,
        marginVertical: height * 0.01,
        padding: width * 0.01,
        justifyContent: "flex-end",
    },
    megImage: {
        width: width * 0.4,
        height: height * 0.25,
    },
    browseButton: {
        height: height * 0.10,
        width: width * 0.9,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#FF6F61",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    browseButtonText: {
        fontSize: width * 0.1,
        fontFamily:"Cabin-Medium"
    },
});

export default Home;
