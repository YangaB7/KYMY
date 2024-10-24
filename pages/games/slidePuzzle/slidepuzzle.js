import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Dimensions, Modal, Animated } from 'react-native';
import Header from '../../../components/header';
import ExitModal from '../../../components/exitpage';
import * as Haptics from "expo-haptics";
import { Audio } from 'expo-av';

function isSolvable(board, size) {
  let inversions = 0;
  let emptyRow = 0;

  const flatBoard = board.flat();

  for (let i = 0; i < flatBoard.length; i++) {
    if (flatBoard[i] === null) {
      emptyRow = Math.floor(i / size) + 1; 
      continue;
    }
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[j] !== null && flatBoard[i] > flatBoard[j]) {
        inversions++;
      }
    }
  }

  if (size % 2 !== 0) {
    // Odd grid size
    return inversions % 2 === 0;
  } else {
    // Even grid size
    const emptyRowFromBottom = size - emptyRow + 1;
    return (
      (inversions % 2 === 0 && emptyRowFromBottom % 2 === 1) ||
      (inversions % 2 === 1 && emptyRowFromBottom % 2 === 0)
    );
  }
}

function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function shuffleBoard(size) {
  let board;
  do {
    board = createShuffledBoard(size);
  } while (!isSolvable(board, size));
  return board;
}

function createShuffledBoard(size) {
  let flatBoard = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
  flatBoard.push(null); // Add the empty space
  flatBoard = shuffle(flatBoard);

  return make2D(flatBoard, size, size);
}

function make2D(arr1D, numRows, numCols) {
  if (arr1D.length !== numRows * numCols) {
    console.error('Error: Insufficient elements in the 1D array to fill the 2D array.');
    return null;
  }

  let arr2D = [];

  for (let i = 0; i < numRows; i++) {
    arr2D.push([]);
    for (let j = 0; j < numCols; j++) {
      arr2D[i].push(arr1D[i * numCols + j]);
    }
  }

  return arr2D;
}

const windowWidth = Dimensions.get('window').width;

const Slide = ({ navigation, route }) => {

  const diff = route.params.setting;
  const handleDiff = diff.toLowerCase() === 'easy' ? 3 : 4;

  const tileMargin = 5;
  const paddingHorizontal = 20;

  const gridSize = windowWidth - paddingHorizontal * 2;
  const tileSize = (gridSize - tileMargin * 2 * handleDiff) / handleDiff;

  const [victorySound, setVictorySound] = useState();

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: victory } = await Audio.Sound.createAsync(require('../../../assets/audios/successMatch.mp3'));
        setVictorySound(victory);
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
    };
  }, []);

  const [board, setBoard] = useState([]);
  const [tilePositions, setTilePositions] = useState({});
  const [moves, setMoves] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
  };

  const [isWinModalVisible, setIsWinModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const newBoard = shuffleBoard(handleDiff);
    setBoard(newBoard);

    const positions = {};
    newBoard.forEach((row, rowIndex) => {
      row.forEach((num, colIndex) => {
        if (num !== null) {
          positions[num] = new Animated.ValueXY({
            x: colIndex * (tileSize + tileMargin * 2),
            y: rowIndex * (tileSize + tileMargin * 2), 
          });
        }
      });
    });
    setTilePositions(positions);

    setStartTime(Date.now());
    setIsWinModalVisible(false);
    setIsGameOver(false);
    setElapsedTime(0);
  };

  useEffect(() => {
    let interval;
    if (startTime && !isGameOver) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else if (isGameOver) {
      setElapsedTime(Date.now() - startTime);
    }
    return () => clearInterval(interval);
  }, [startTime, isGameOver]);

  const checkWin = (grid) => {
    let flattened = [].concat(...grid);
  
    const size = grid.length;
    const totalTiles = size * size;

    const tilesToCheck = totalTiles - size; 
    for (let i = 0; i < tilesToCheck; i++) {
      if (flattened[i] !== i + 1) {
        return false; 
      }
    }
  
    const lastRowTiles = flattened.slice(tilesToCheck);
    const expectedNumbers = [];
    for (let i = tilesToCheck + 1; i <= totalTiles - 1; i++) {
      expectedNumbers.push(i);
    }
    expectedNumbers.push(null); 

    const sortedExpected = expectedNumbers.slice().sort((a, b) => (a === null ? 1 : b === null ? -1 : a - b));
    const sortedLastRow = lastRowTiles.slice().sort((a, b) => (a === null ? 1 : b === null ? -1 : a - b));
  
    for (let i = 0; i < size; i++) {
      if (sortedLastRow[i] !== sortedExpected[i]) {
        return false;
      }
    }

    const numberedTiles = lastRowTiles.filter((n) => n !== null);
    for (let i = 0; i < numberedTiles.length - 1; i++) {
      if (numberedTiles[i] > numberedTiles[i + 1]) {
        return false;
      }
    }

    return true;
  };
  

  
  const handlePress = (i, j) => {
    const currentNum = board[i][j];
    if (currentNum === null) {
      return;
    }

    let emptyI, emptyJ;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === null) {
          emptyI = row;
          emptyJ = col;
          break;
        }
      }
    }

    const isAdjacent =
      (i === emptyI && Math.abs(j - emptyJ) === 1) ||
      (j === emptyJ && Math.abs(i - emptyI) === 1);

    if (isAdjacent) {
      setMoves(moves+1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

      Animated.timing(tilePositions[currentNum], {
        toValue: {
          x: emptyJ * (tileSize + tileMargin * 2),
          y: emptyI * (tileSize + tileMargin * 2),
        },
        duration: 200,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        const newBoard = board.map((row) => row.slice());
        newBoard[emptyI][emptyJ] = currentNum;
        newBoard[i][j] = null;
        setBoard(newBoard);

        if (checkWin(newBoard)) {
          const timeTaken = Date.now() - startTime;
          setElapsedTime(timeTaken);
          setIsWinModalVisible(true);
          setIsGameOver(true);
        }
      }, 200);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString();
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <SafeAreaView style={styles.window}>
      <Header title={'SLIDE PUZZLE'} handleGoHome={() => setModalVisible(true)} />
      <ExitModal
        canSee={modalVisible}
        closeModal={() => closeModal()}
        handleGoHome={() => navigation.navigate('Home')}
      />
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Time: {formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.gameContainer}>
          {Object.keys(tilePositions).map((num) => {
            const position = tilePositions[num];
            return (
              <Animated.View
                key={num}
                style={[
                  styles.tile,
                  {
                    backgroundColor: '#45B7D1',
                    width: tileSize,
                    height: tileSize,
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    margin: tileMargin,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.tileContent}
                  onPress={() => {
                    let rowIndex, colIndex;
                    for (let i = 0; i < board.length; i++) {
                      for (let j = 0; j < board[i].length; j++) {
                        if (board[i][j] === parseInt(num)) {
                          rowIndex = i;
                          colIndex = j;
                          break;
                        }
                      }
                    }
                    handlePress(rowIndex, colIndex);
                  }}
                >
                  <Text style={styles.tileText}>{num}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
      {/* Win Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isWinModalVisible}
        onShow={async () => {
          if (victorySound) {
            await victorySound.replayAsync();
          }
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalText}>You solved the puzzle!</Text>
            <Text style={styles.modalText}>Time Taken: {formatTime(elapsedTime)}</Text>
            <Text style={styles.modalText}>Moves Used: {moves}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                startGame();
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
  window: {
    flex: 1,
    backgroundColor: '#FFF3E9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, 
    paddingVertical: 10,   
    justifyContent:"space-around",
    alignItems:"center",
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5%',
  },
  timerText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#2C3E50',
    fontFamily: 'Cabin-Medium',
  },
  gameContainer: {
    width: windowWidth - 40,
    height: windowWidth - 40, 
    alignSelf: 'center',   
    position: 'relative',    
  },
  tile: {
    position: 'absolute',
    backgroundColor: '#45B7D1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: "65%",
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cabin-Medium',
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 24,
    marginBottom: 10,
    color: '#2C3E50',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#f8a5a7',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default Slide;
