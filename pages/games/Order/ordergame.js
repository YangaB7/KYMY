import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, Animated, StyleSheet, Modal } from 'react-native';
import Header from '../../../components/header';
import ExitModal from '../../../components/exitpage';
import * as Haptics from "expo-haptics";
import { Audio } from 'expo-av';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 
}
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FF69B4', '#BA55D3', '#20B2AA'];

const squareSize = windowHeight / 10; 

const ColorSquare = ({ Id, color, onPress, activeId, animationTrigger }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    const [tileSound, setTileSound] = useState();

    useEffect(() => {
        const loadSounds = async () => {
          try {
            const { sound: tileTouch } = await Audio.Sound.createAsync(require('../../../assets/audios/orderPress.mp3'));
            setTileSound(tileTouch);
          } catch (err) {
            console.warn("Error loading sounds:", err);
          }
        };
    
        loadSounds();

        return () => {
          if (tileSound) {
            tileSound.unloadAsync();
          }
        };
      }, []);

    useEffect(() => {
        if (Id === activeId) {
            scaleAnim.setValue(1);
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [activeId, animationTrigger]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(pressAnim, {
                toValue: 0.9,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(pressAnim, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const playTileSound = async () => {
            if (tileSound) {
              await tileSound.replayAsync();
            }
          };
          playTileSound();
        onPress(Id);
    };

    const changeColor = Id === activeId ? '#800080' : color; // Purple when active

    return (
        <TouchableOpacity onPress={handlePress}>
            <Animated.View style={{
                backgroundColor: changeColor,
                height: squareSize,
                width: squareSize,
                borderRadius: squareSize / 5,
                justifyContent: "center",
                alignItems: "center",
                margin: 5,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                transform: [
                    { scale: Animated.multiply(scaleAnim, pressAnim) }
                ]
            }}>
                <Text style={styles.squareText}>{Id}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const OrderGame = ({ navigation, route }) => {
    const [sequence, setSequence] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [gameState, setGameState] = useState('countdown');
    const [countdown, setCountdown] = useState(3);
    const [modalVisible, setModalVisible] = useState(false);
    const closeModal = () => {
        setModalVisible(false)
    }
    const [score, setScore] = useState(0);
    const [animationTrigger, setAnimationTrigger] = useState(0);
    const difficulty = route.params.setting;
    const [gameOverModalVisible, setGameOverModalVisible] = useState(false);

    const gridConfig = {
        "Easy": { rows: 2, cols: 2, total: 4 },
        "Medium": { rows: 2, cols: 3, total: 6 },
        "Hard": { rows: 3, cols: 3, total: 9 }
    };

    const currentGrid = gridConfig[difficulty];

    const [victorySound, setVictorySound] = useState(); 
    const [gameResponse, setGameResponse] = useState();
        
    useEffect(() => {
      const loadSounds = async () => {
        try {
          const { sound: victory } = await Audio.Sound.createAsync(require('../../../assets/audios/successMatch.mp3'));
          const { sound: gameTouch } = await Audio.Sound.createAsync(require('../../../assets/audios/gridTilePressTwo.mp3'));
          setVictorySound(victory);
          setGameResponse(gameTouch);
        } catch (err) {
          console.warn("Error loading sounds:", err);
        }
      };
  
      loadSounds();

      return () => {
        if (victorySound) {
          victorySound.unloadAsync();
        }
        if (gameResponse) {
          gameResponse.unloadAsync();
        }
      };
    }, []);

    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('showSequence');
                generateSequence();
            }
        }
    }, [countdown, gameState]);

    useEffect(() => {
        if (gameState === 'showSequence') {
            handleCycle(sequence);
        }
    }, [gameState, sequence]);

    function generateSequence() {
        const newSequence = [...sequence, getRandomIntInclusive(1, currentGrid.total).toString()];
        setSequence(newSequence);
    }

    function handlePress(number) {
        if (gameState !== 'userInput') return;
    
        const newInput = [...userInput, number];
        setUserInput(newInput);
    
        if (!checkSequence(newInput)) {
            endGame();  
        } else if (newInput.length === sequence.length) {
            nextRound();
        }
    }

    function restartGame() {
        setSequence([]);
        setUserInput([]);
        setActiveId(null);
        setGameState('countdown');
        setCountdown(3);
        setScore(0);
    }

    function endGame() {
        setGameOverModalVisible(true);
    }

    function checkSequence(input) {
        for (let i = 0; i < input.length; i++) {
            if (input[i] !== sequence[i]) {
                return false;
            }
        }
        return true;
    }

    function handleCycle(array) {
        setGameState('showing');
        let counter = 0;
        function iterate() {
            setActiveId(array[counter]);
            setAnimationTrigger(prev => prev + 1); 
            counter += 1;
        }
        let myInterval = setInterval(() => {
            if (counter < array.length) {
                iterate();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const playGameSound = async () => {
                    if (gameResponse) {
                      await gameResponse.replayAsync();
                    }
                  };
                  playGameSound();
            } else {
                setActiveId(null);
                clearInterval(myInterval);
                setGameState('userInput');
            }
        }, 700);
    }

    function nextRound() {
        setScore(score + 1);
        setUserInput([]);
        setGameState('showSequence');
        generateSequence();
    }

    const renderGrid = () => {
        const grid = [];
        let count = 1;
        for (let i = 0; i < currentGrid.rows; i++) {
            const row = [];
            for (let j = 0; j < currentGrid.cols; j++) {
                row.push(
                    <ColorSquare 
                        key={count}
                        onPress={handlePress} 
                        Id={count.toString()} 
                        color={colors[count - 1]} 
                        activeId={activeId} 
                        animationTrigger={animationTrigger} 
                    />
                );
                count++;
            }
            grid.push(<View key={i} style={styles.squareRow}>{row}</View>);
        }
        return grid;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="COLOR SEQUENCE" handleGoHome={() => setModalVisible(true)}/>
            <ExitModal canSee={modalVisible} closeModal={()=>closeModal()} handleGoHome={()=>navigation.navigate("Home")}/>
            <View style={styles.infoArea}>
                {gameState === 'countdown' && <Text style={styles.countdownText}>Starting in: {countdown}</Text>}
                {gameState === 'userInput' && <Text style={styles.instructionText}>Your turn!</Text>}
                {gameState === 'showing' && <Text style={styles.instructionText}>Watch carefully!</Text>}
                <Text style={styles.scoreText}>Score: {score}</Text>
            </View>
            <View style={styles.gameArea}>
                {renderGrid()}
            </View>

            {/* Game Over*/}
            <Modal
                animationType="fade"
                transparent={true}
                visible={gameOverModalVisible}
                onShow={async () => {
                    if (victorySound) {
                      await victorySound.replayAsync();
                    }
                  }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Game Over</Text>
                        <Text style={styles.modalScore}>Your Score: {score}</Text>
                        <Text style={styles.modalMessage}>
                            {score >= 10 ? 'Amazing memory!' : score >= 5 ? 'Great job!' : 'Good try!'}
                        </Text>
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => {
                                setGameOverModalVisible(false);
                                restartGame();
                            }}
                        >
                            <Text style={styles.modalButtonText}>Play Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => {
                                setGameOverModalVisible(false);
                                navigation.navigate("Home");
                            }}
                        >
                            <Text style={styles.modalButtonText}>Go Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F3F4",
    },
    gameArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },  
    squareRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    infoArea: {
        height: "20%",
        alignItems: 'center',
        justifyContent:'center',
    },
    countdownText: {
        fontSize: 32,
        fontFamily:"Cabin-Medium",
        fontWeight: 'bold',
        color: '#34495E',
    },
    instructionText: {
        fontSize: "40%",
        fontFamily:"Cabin-Medium",
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    scoreText: {
        fontSize: "35",
        fontFamily:"Cabin-Medium",
        fontWeight: 'bold',
        marginTop: 15,
        color: '#2C3E50',
    },
    squareText: {
        fontSize: 24,
        fontFamily:"Cabin-Medium",
        fontWeight: 'bold',
        color: 'white',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalScore: {
        fontSize: 20,
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#f8a5a7',
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OrderGame;
