import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { shuffle } from '../../commons/constants';
import Header from '../../components/header';
import { Ionicons } from '@expo/vector-icons';
import ExitModal from '../../components/exitpage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

function getOccurrence(array, value) {
  return array.filter(v => v === value).length;
}

const Matching = ({ navigation }) => {
  const [isWinModalVisible, setIsWinModalVisible] = useState(false);

  const [key, setKey] = useState([]);
  const [display, setDisplay] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [score, setScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
  };

  // Timer stuff
  const [timeLeft, setTimeLeft] = useState(60); //60 seconds timer
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [countdown, setCountdown] = useState(3); //Countdown before the game starts

  useEffect(() => {
    initializeGame();
  }, []);

  //Countdown before the game starts
  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else if (countdown === 0 && !isTimerMode) {
      setIsTimerMode(true);
    }
  }, [countdown]);

  // Timer stuff
  useEffect(() => {
    let timer;
    if (isTimerMode && timeLeft > 0 && !isGameOver) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isTimerMode && timeLeft === 0 && !isWinModalVisible) {
      setIsGameOver(true);
    }
    return () => clearInterval(timer);
  }, [isTimerMode, timeLeft, isGameOver, isWinModalVisible]);

  useEffect(() => {
    const revealedCount = revealed.filter(r => r && r !== 'X').length;
    if (revealedCount === 2) {
      const revealedIndices = revealed.reduce((acc, r, index) => (r && r !== 'X' ? [...acc, index] : acc), []);
      if (key[revealedIndices[0]] === key[revealedIndices[1]]) {
        setTimeout(() => {
          setScore((prevScore) => prevScore + 1);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          matchAudio = async () => {
            if (matchSound) {
              await matchSound.replayAsync();
            }
          }
          matchAudio();
          setRevealed((prev) => {
            const newRevealed = prev.map((r, i) =>
              i === revealedIndices[0] || i === revealedIndices[1] ? 'X' : r
            );
            // Check win condition after updating revealed state
            if (newRevealed.every((r) => r === 'X')) {
              setIsWinModalVisible(true);
              setIsGameOver(true);
            }
            return newRevealed;
          });
        }, 500);
      } else {
        setTimeout(() => {
          setRevealed((prev) =>
            prev.map((r, i) => (i === revealedIndices[0] || i === revealedIndices[1] ? null : r))
          );
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          errorAudio = async () => {
            if (errorSound) {
              await errorSound.replayAsync();
            }
          }
          errorAudio();
        }, 1000);
      }
    }
  }, [revealed, key]);

  const [victorySound, setVictorySound] = useState();
  const [errorSound, setErrorSound] = useState();
  const [matchSound, setMatchSound] = useState();
  
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: victory } = await Audio.Sound.createAsync(require('../../assets/audios/successMatch.mp3'));
        const { sound: error } = await Audio.Sound.createAsync(require('../../assets/audios/error.mp3'));
        const { sound: match } = await Audio.Sound.createAsync(require('../../assets/audios/gmLevelUp.mp3'))
        setVictorySound(victory);
        setErrorSound(error);
        setMatchSound(match);
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
      if (errorSound) {
        errorSound.unloadAsync();
      }
      if (matchSound) {
        matchSound.unloadAsync();
      }
    };
  }, []);

  //helpers
  const restartGame = () => {
    setScore(0);
    initializeGame();
  };

  const initializeGame = () => {
    let values = [];
    let value = 1;
    for (let i = 0; i < 16; i += 2) {
      values[i] = value;
      values[i + 1] = value;
      value++;
    }
    values = shuffle(values);
    setKey(values);
    setDisplay(Array(16).fill('O'));
    setRevealed(Array(16).fill(null));
    setIsWinModalVisible(false);

    // Timer stuff
    setTimeLeft(60);
    setIsTimerMode(false);
    setIsGameOver(false);
    setCountdown(3);
  };

  function handlePress(index) {
    if (!isTimerMode || isGameOver || revealed[index] || getOccurrence(revealed, true) === 2) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
    setRevealed((prev) => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'TILE MATCH'} handleGoHome={() => setModalVisible(true)} />
      <ExitModal
        canSee={modalVisible}
        closeModal={() => closeModal()}
        handleGoHome={() => navigation.navigate('Home')}
      />
      {countdown > 0 ? (
        <>
          <View style={styles.countdownContainer}>
            <View style={{ width: "90%" }}>
              <Text style={styles.gameTitle}>Get ready to Match the Tiles!</Text>
            </View>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Time left: {timeLeft}s</Text>
          </View>
          <View style={styles.score}>
            <Text style={styles.scoreText}>Matches Found: {score}/8</Text>
          </View>
          <View style={styles.matchingContainer}>
            {display.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tile,
                  revealed[index] === 'X'
                    ? styles.matchedTile
                    : revealed[index]
                    ? styles.revealedTile
                    : styles.hiddenTile,
                ]}
                onPress={() => handlePress(index)}
              >
                {revealed[index] === 'X' ? (
                  <Ionicons name="checkmark-circle" size={40} color="white" />
                ) : revealed[index] ? (
                  <Text style={styles.tileText}>{key[index]}</Text>
                ) : (
                  <Ionicons name="help-outline" size={40} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isWinModalVisible}
        onRequestClose={() => setIsWinModalVisible(false)}
        onShow={async () => {
          if (victorySound) {
            await victorySound.replayAsync();
          }
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalText}>You won the game!</Text>
            <Text style={styles.modalText}>Your score: {score}</Text>
            <Text style={styles.modalText}>Time to Complete: {60-timeLeft}s</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsWinModalVisible(false);
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={isGameOver && !isWinModalVisible}
        onRequestClose={() => setIsGameOver(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Time's up!</Text>
            <Text style={styles.modalText}>Your score: {score}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsGameOver(false);
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
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E9',
  },
  matchingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFF3E9',
  },
  tile: {
    flexBasis: '22%', 
    margin: 5,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenTile: {
    backgroundColor: '#4ECDC4',
  },
  revealedTile: {
    backgroundColor: '#FF6B6B',
  },
  matchedTile: {
    backgroundColor: '#98D8C8',
  },
  tileText: {
    fontSize: 20,
    fontFamily:"Cabin-Medium",
    fontWeight: 'bold',
    color: 'white',
  },
  score: {
    height: '10%',
  },
  scoreText: {
    fontSize: "40%",
    fontWeight: 'bold',
    fontFamily:"Cabin-Medium",
    marginTop: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: "40%",
    fontWeight: 'bold',
    fontFamily:"Cabin-Medium",
    color: '#2C3E50',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 100,
    fontWeight: 'bold',
    fontFamily:"Cabin-Medium",
    color: '#2C3E50',
    marginTop: 20,
  },
  gameTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily:"Cabin-Medium",
    color: '#2C3E50',
    textAlign: 'center',
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    width: '80%',
    backgroundColor: '#FFF', 
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
    fontFamily:"Cabin-Medium",
  },
  modalText: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily:"Cabin-Medium",
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
    fontSize: 18,
    fontFamily:"Cabin-Medium",
    fontWeight: 'bold',
  },
});

export default Matching;