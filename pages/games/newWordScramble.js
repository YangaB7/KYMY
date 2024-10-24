import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { vowels, consonants, shuffle } from "../../commons/constants";
import Header from '../../components/header';
import ExitModal from '../../components/exitpage';
import { ScrollView } from 'react-native-gesture-handler';
import * as Haptics from "expo-haptics";
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
const VOWELS = 2;
const words = require('../../realOutput.json');

function firstElementsToWord(array) {
  let word = "";
  for (let i = 0; i < array.length; i++) {
    if (array[i] != null) {
      word += array[i].letter;
    }
  }
  return word;
}

function isVowel(letter) {
  const upper = letter.toUpperCase();
  return ["A", "E", "I", "O", "U"].includes(upper);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveNullsToBack(arr) {
  let nonNulls = arr.filter(element => element !== null);
  let nulls = arr.filter(element => element === null);
  return nonNulls.concat(nulls);
}

const consonantFrequencies = {
  B: 1.5, C: 2.7, D: 4.3, F: 2.2, G: 2.0, H: 6.1, J: 0.15, K: 0.77, L: 4.0, M: 2.4,
  N: 6.7, P: 1.9, Q: 0.095, R: 6.0, S: 6.3, T: 9.1, V: 1.0, W: 2.4, X: 0.15, Y: 2.0, Z: 0.074,
};

const vowelFrequencies = {
  A: 8.2, E: 12.7, I: 7.0, O: 7.5, U: 2.8,
};

function generateWeightedArray(frequencies) {
  let weightedArray = [];
  for (let letter in frequencies) {
    let count = Math.floor(frequencies[letter] * 10); 
    for (let i = 0; i < count; i++) {
      weightedArray.push(letter);
    }
  }
  return weightedArray;
}

const weightedConsonants = generateWeightedArray(consonantFrequencies);
const weightedVowels = generateWeightedArray(vowelFrequencies);

function fillBank() {
  let output = [];
  let usedConsonants = new Set();

  for (let i = 0; i < VOWELS; i++) {
    const vowel = weightedVowels[Math.floor(Math.random() * weightedVowels.length)];
    const randomValue = getRandomInt(1, 3);
    output.push({ letter: vowel, uses: randomValue, index: i, used: false });
  }

  while (output.length < 6) {
    const consonant = weightedConsonants[Math.floor(Math.random() * weightedConsonants.length)];
    if (!usedConsonants.has(consonant)) {
      const randomValue = getRandomInt(1, 3);
      output.push({ letter: consonant, uses: randomValue, index: output.length, used: false });
      usedConsonants.add(consonant);
    }
  }

  output = shuffle(output);

  for (let i = 0; i < output.length; i++) {
    output[i].index = i;
  }

  return output;
}

function isWord(word, key) {
  return key.includes(word);
}

function fillTable() {
  return Array(6).fill(null);
}


const { width, height } = Dimensions.get('window');
const letterSize = width * 0.13; 
const WordScramble = ({ navigation }) => {
  const [wordBank, setWordBank] = useState([]);
  const [table, setTable] = useState([]);
  const [currentEmptyWord, setCurrentEmptyWord] = useState(0);
  const [usedWords, setUsedWords] = useState(new Set());
  const [usedWordsList, setUsedWordsList] = useState([]);
  const [score, setScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
  };

  const [lastWord, setLastWord] = useState('');
  const [lastPoints, setLastPoints] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isEndGameModalVisible, setIsEndGameModalVisible] = useState(false);

  const [victorySound, setVictorySound] = useState();
  const [matchSound, setMatchSound] = useState();
  const [errorSound, setErrorSound] = useState();

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: victory } = await Audio.Sound.createAsync(require('../../assets/audios/successMatch.mp3'));
        const { sound: match } = await Audio.Sound.createAsync(require('../../assets/audios/madeWord.mp3'));
        const { sound: error } = await Audio.Sound.createAsync(require('../../assets/audios/error.mp3'));
        setVictorySound(victory);
        setMatchSound(match);
        setErrorSound(error)
      } catch (err) {
        console.warn("Error loading sounds:", err);
      }
    };
    loadSounds();

    // Cleanup on unmount
    return () => {
      if (victorySound) {
        victorySound.unloadAsync();
      }
      if (matchSound) {
        matchSound.unloadAsync();
      }
      if(errorSound) {
        errorSound.unloadAsync();
      }
    };
  }, []);

  
  const handlePlayGame = async () => {
    try {
      const gameInfo = {
        name: 'Word Scramble',
        nav: 'WordScramble',  
      };
      await AsyncStorage.setItem('lastPlayedGame', JSON.stringify(gameInfo));
    } catch (error) {
      console.error('Error saving last played game:', error);
    }
  };    
  

  useEffect(() => {
    setWordBank(fillBank());
    setTable(fillTable());
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else if (countdown === 0 && !isTimerMode) {
      setIsTimerMode(true);
    }

    handlePlayGame();
  }, [countdown]);

  useEffect(() => {
    let timer;
    if (isTimerMode && timeLeft > 0 && !isGameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isTimerMode && timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
      setIsEndGameModalVisible(true);
    }
    return () => clearInterval(timer);
  }, [isTimerMode, timeLeft, isGameOver]);

  function checkWord(word) {
    if (!isTimerMode || isGameOver) return;

    const lowerCaseWord = word.toLowerCase();

    if (usedWords.has(lowerCaseWord)) {
      setLastWord(word);
      setLastPoints(-1); //dupe word
      setShowMessage(true);
      fadeAnim.setValue(1);

      errorAudio = async () => {
        if (errorSound) {
          await errorSound.replayAsync();
        }
      }
      errorAudio();

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setShowMessage(false);
      });
      clearTable(table, wordBank, false);
      return;
    }

    const yesItIsAWord = isWord(lowerCaseWord, words);
    let pointsGained = 0;
    if (yesItIsAWord) {
      setUsedWords((prevUsedWords) => new Set(prevUsedWords).add(lowerCaseWord));

      if (word.length === 3) {
        pointsGained = 100;
      } else if (word.length === 4) {
        pointsGained = 400;
      } else if (word.length === 5) {
        pointsGained = 1200;
      } else if (word.length === 6) {
        pointsGained = 2000;
      }

      successAudio = async () => {
        if (matchSound) {
          await matchSound.replayAsync();
        }
      }
      successAudio();

      setScore(prevScore => prevScore + pointsGained);

      setUsedWordsList(prevList => [...prevList, { word: word, points: pointsGained }]);

      setLastWord(word);
      setLastPoints(pointsGained);
      setShowMessage(true);
      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setShowMessage(false);
      });
    } else {
      setLastWord(word);
      setLastPoints(0);
      setShowMessage(true);

      errorAudio = async () => {
        if (errorSound) {
          await errorSound.replayAsync();
        }
      }
      errorAudio();
      
      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setShowMessage(false);
      });
    }
    clearTable(table, wordBank, yesItIsAWord);
  }

  function handleBankTouch(index) {
    if (!isTimerMode || isGameOver || wordBank[index].used) return;

    let bankClone = JSON.parse(JSON.stringify(wordBank));
    let tableClone = JSON.parse(JSON.stringify(table));

    tableClone[currentEmptyWord] = bankClone[index];
    bankClone[index].used = true;
    setCurrentEmptyWord(currentEmptyWord + 1);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    setWordBank(bankClone);
    setTable(tableClone);
  }

  function clearTable(tableParam, bankParam, isWord) {
    let bankClone = JSON.parse(JSON.stringify(bankParam));
    let tableClone = JSON.parse(JSON.stringify(tableParam));

    for (let i = 0; i < tableClone.length; i++) {
      if (tableClone[i] !== null) {
        let ReturnIndex = tableClone[i].index;
        bankClone[ReturnIndex].used = false;
        if (isWord) {
          bankClone[ReturnIndex].uses -= 1;
          if (bankClone[ReturnIndex].uses === 0) {
            if (isVowel(bankClone[ReturnIndex].letter)) {
              const newVowel = weightedVowels[Math.floor(Math.random() * weightedVowels.length)];
              bankClone[ReturnIndex] = {
                letter: newVowel,
                uses: getRandomInt(1, 3),
                index: ReturnIndex,
                used: false,
              };
            } else {
              const newConsonant = weightedConsonants[Math.floor(Math.random() * weightedConsonants.length)];
              bankClone[ReturnIndex] = {
                letter: newConsonant,
                uses: getRandomInt(1, 3),
                index: ReturnIndex,
                used: false,
              };
            }
          }
        }
        tableClone[i] = null;
      }
    }
    setCurrentEmptyWord(0);
    setTable(tableClone);
    setWordBank(bankClone);
  }

  function handleTableTouch(index) {
    if (!isTimerMode || isGameOver) return;

    let bankClone = JSON.parse(JSON.stringify(wordBank));
    let tableClone = JSON.parse(JSON.stringify(table));
    if (tableClone[index] == null) {
      console.log("No letter here");
    } else {
      let ReturnIndex = tableClone[index].index;
      bankClone[ReturnIndex].used = false;
      tableClone[index] = null;
      tableClone = moveNullsToBack(tableClone);
      setCurrentEmptyWord(currentEmptyWord - 1);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      setTable(tableClone);
      setWordBank(bankClone);
    }
  }

  const renderLetter = (value, index, onPress, isTable, isEmptySlot) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPress(index)}
        style={[
          styles.letter,
          isEmptySlot && styles.emptySlot,
          !isTable && value && value.used && styles.letterUsed,
        ]}
      >
        {value && (
          <Text style={styles.letterText}>
            {value.letter}
          </Text>
        )}
        {!isTable && value && (
          <View style={styles.uses}>
            <Text style={styles.usesText}>{value.uses}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const restartGame = () => {
    setScore(0);
    setWordBank(fillBank());
    setTable(fillTable());
    setCurrentEmptyWord(0);
    setIsGameOver(false);
    setIsTimerMode(false);
    setTimeLeft(60);
    setCountdown(3);
    setUsedWords(new Set());
    setUsedWordsList([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="WORD SCRAMBLE" handleGoHome={() => setModalVisible(true)} />
      <ExitModal canSee={modalVisible} closeModal={() => closeModal()} handleGoHome={() => navigation.navigate("Home")} />

      {countdown > 0 ? (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      ) : (
        <>
          <View style={styles.infoArea}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.timerText}>Time Left: {timeLeft}s</Text>
          </View>
          <View style={styles.gameArea}>
            <View style={styles.tableContainer}>
              {table.map((value, index) =>
                renderLetter(value, index, handleTableTouch, true, value === null)
              )}
            </View>
            <View style={styles.bankContainer}>
              {wordBank.map((value, index) =>
                renderLetter(value, index, handleBankTouch, false, false)
              )}
            </View>
            <TouchableOpacity style={styles.checkButton} onPress={() => checkWord(firstElementsToWord(table))}>
              <Text style={styles.checkButtonText}>Check Word</Text>
            </TouchableOpacity>
          </View>

          {/* Display the message when a word is formed */}
          {showMessage && (
            <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
              {lastPoints > 0 ? (
                <Text style={styles.messageText}>You formed "{lastWord}"! +{lastPoints} points</Text>
              ) : lastPoints === 0 ? (
                <Text style={styles.messageText}>"{lastWord}" is not a valid word.</Text>
              ) : (
                <Text style={styles.messageText}>"{lastWord}" has already been used.</Text>
              )}
            </Animated.View>
          )}
        </>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isEndGameModalVisible}
        onShow={async () => {
          if (victorySound) {
            await victorySound.replayAsync();
          }
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Time's up!</Text>
            <Text style={styles.modalText}>Your final score: {score}</Text>

            {usedWordsList.length > 0 && (
                <>
                <Text style={styles.modalSubTitle}>Words You Found:</Text>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                  {usedWordsList.map((item, index) => (
                    <View key={index} style={styles.wordItem}>
                      <Text style={styles.wordText}>{item.word}</Text>
                      <Text style={styles.pointsText}>+{item.points}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsEndGameModalVisible(false);
                restartGame();
              }}
            >
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.modalButtonText}>Return Home</Text>
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
    infoArea: {
      height: "15%",
      alignItems: 'center',
      justifyContent: 'center',
    },
    gameArea: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingVertical: 20,
    },
    tableContainer: {
      flexDirection: "row",
      justifyContent:"space-around", 
      width:"100%",
      marginBottom: 20,
      height: letterSize,
    },
    scrollView: {
        width: '100%',
        marginBottom: 10,
      },
      scrollViewContent: {
        alignItems: 'center',
      },
    bankContainer: {
      flexDirection: "row",
      flexWrap: "nowrap", 
      width: "100%", 
      justifyContent: 'space-evenly', 
      marginBottom: 20,
    },
    letter: {
      height: letterSize,
      width: letterSize,
      backgroundColor: '#4ECDC4',
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    emptySlot: {
      backgroundColor: '#D3D3D3',
    },
    letterUsed: {
      backgroundColor: '#ccc',
    },
    letterText: {
      fontSize: letterSize * 0.4,
      fontWeight: 'bold',
      color: 'white',
    },
    uses: {
      position: 'absolute',
      top: letterSize * 0.02, 
      right: letterSize * 0.02, 
      height: letterSize * 0.3, 
      width: letterSize * 0.3,   
      backgroundColor: '#FF6B6B',
      borderRadius: (letterSize * 0.3) / 2,
      justifyContent: "center",
      alignItems: "center",
    },
    usesText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: letterSize * 0.18,
    },
    scoreText: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    checkButton: {
      backgroundColor: '#45B7D1',
      paddingHorizontal: width * 0.05,
      paddingVertical: width * 0.03,
      borderRadius: 25,
      marginTop: 20,
    },
    checkButtonText: {
      color: 'white',
      fontSize: width * 0.045,
      fontWeight: 'bold',
    },
    messageContainer: {
      position: 'absolute',
      bottom: height * 0.15,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    messageText: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      color: '#2C3E50',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: 10,
      borderRadius: 10,
    },
    modalCenteredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '80%',
      maxHeight: '80%',
      backgroundColor: '#FFF',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: width * 0.07,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#2C3E50',
      textAlign: 'center',
    },
    modalSubTitle: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 10,
      color: '#2C3E50',
      textAlign: 'center',
    },
    wordsList: {
      width: '100%',
      maxHeight: height * 0.3,
      marginBottom: 10,
    },
    wordItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
    },
    wordText: {
      fontSize: width * 0.045,
      color: '#2C3E50',
    },
    pointsText: {
      fontSize: width * 0.045,
      color: '#2C3E50',
      fontWeight: 'bold',
    },
    modalText: {
      fontSize: width * 0.05,
      marginBottom: 10,
      color: '#2C3E50',
      textAlign: 'center',
    },
    modalButton: {
      backgroundColor: '#f8a5a7',
      padding: 10,
      borderRadius: 10,
      marginVertical: 5,
      width: '80%',
      alignItems: 'center',
    },
    modalButtonText: {
      color: 'white',
      fontSize: width * 0.045,
      fontWeight: 'bold',
    },
    countdownContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    countdownText: {
      fontSize: width * 0.25,
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    timerText: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      color: '#2C3E50',
    },
  });

export default WordScramble;
