    import React, { useState, useEffect, useRef      } from 'react';
    import { View, Text, TouchableOpacity, Alert, StyleSheet, Animated, SafeAreaView, Image, Dimensions, Modal } from 'react-native';
    import { shuffle } from '../../../commons/constants';
    import Header from '../../../components/header';
    import ExitModal from '../../../components/exitpage';
    import * as Haptics from 'expo-haptics';
    import { Audio } from 'expo-av';


    function improvedFill(grid, tilesToFill) {
        const rows = grid.length;
        const cols = grid[0].length;
        const totalCells = rows * cols;

        let filledGrid = JSON.parse(JSON.stringify(grid));

        let availableCells = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                availableCells.push([i, j]);
            }
        }

        availableCells = shuffle(availableCells);

        let filledCount = 0;
        while (filledCount < tilesToFill && availableCells.length > 0) {
            let clusterSize = Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 2;
            clusterSize = Math.min(clusterSize, tilesToFill - filledCount, availableCells.length);

            let [startRow, startCol] = availableCells.pop();
            filledGrid[startRow][startCol] = 1;
            filledCount++;

            for (let i = 1; i < clusterSize; i++) {
                let neighborFound = false;
                for (let [dRow, dCol] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                    let newRow = startRow + dRow;
                    let newCol = startCol + dCol;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && filledGrid[newRow][newCol] === 0) {
                        filledGrid[newRow][newCol] = 1;
                        filledCount++;
                        availableCells = availableCells.filter(cell => !(cell[0] === newRow && cell[1] === newCol));
                        neighborFound = true;
                        break;
                    }
                }
                if (!neighborFound) break;
            }
        }

        return filledGrid;
    }

    function fillGrid(size, content) {
        let output = [];
        for (let i = 0; i < size; i++) {
            output[i] = [];
            for (let j = 0; j < size; j++) {
                output[i][j] = content;
            }
        }
        return output;
    }

    const { width, height } = Dimensions.get('window');

    const TileMatch = ({ navigation }) => {
      const [countdown, setCountdown] = useState(3);
      const [justEntered, setJustEntered] = useState(true);
      const [gridSize, setGridSize] = useState(3);
      const [grid, setGrid] = useState([]);
      const [filledTiles, setFilledTiles] = useState(3);
      const [lives, setLives] = useState(3);
      const [lastGrid, setLastGrid] = useState([]);
      const [isUsersTurn, setIsUsersTurn] = useState(null);
      const [gridInitialized, setGridInitialized] = useState(false);
      const [start, setStart] = useState(false);
      const [modalVisible, setModalVisible] = useState(false);
      const [gameOverModalVisible, setGameOverModalVisible] = useState(false);
      const [startTime, setStartTime] = useState(null);
      const [elapsedTime, setElapsedTime] = useState(0);
      const [errorMessage, setErrorMessage] = useState('');
      const opacityAnim = useRef(new Animated.Value(0)).current;

      const [victorySound, setVictorySound] = useState(); 
      const [newLevelSound, setNewLevelSound] = useState();
      const [tileSound, setTileSound] = useState();
          
      useEffect(() => {
        const loadSounds = async () => {
          try {
            const { sound: victory } = await Audio.Sound.createAsync(require('../../../assets/audios/gmLevelUp.mp3'));
            const { sound: newLevel } = await Audio.Sound.createAsync(require('../../../assets/audios/gmNewGrid.mp3'));
            const { sound: tileTouch } = await Audio.Sound.createAsync(require('../../../assets/audios/gridTilePressTwo.mp3'));
            setVictorySound(victory);
            setNewLevelSound(newLevel);
            setTileSound(tileTouch);
          } catch (err) {
            console.warn("Error loading sounds:", err);
          }
        };
    
        loadSounds();
    
        //Cleanup on unmount
        return () => {
          if (victorySound) {
            victorySound.unloadAsync();
          }
          if (newLevelSound) {
            newLevelSound.unloadAsync();
          }
          if (tileSound) {
            tileSound.unloadAsync();
          }
        };
      }, []);

      const [cellSize, setCellSize] = useState(0);
    
      useEffect(() => {
        if (gridSize > 0) {
          setGrid(fillGrid(gridSize, 0));
          setGridInitialized(true);
    
          //cell size calculation
          const maxGridWidth = width * 0.9;
          const maxGridHeight = height * 0.6;
          const calculatedCellSize = Math.min(
            (maxGridWidth - (gridSize - 1) * 4) / gridSize,
            (maxGridHeight - (gridSize - 1) * 4) / gridSize
          );
          setCellSize(calculatedCellSize);
        }
      }, [gridSize]);
    
      useEffect(() => {
        if (gridInitialized && justEntered) {
          const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
              if (prevCountdown === 1) {
                clearInterval(timer);
                setJustEntered(false);
                setStart(true);
                setStartTime(Date.now());
                return 3;
              }
              return prevCountdown - 1;
            });
          }, 1000);
    
          return () => clearInterval(timer);
        }
      }, [justEntered, gridInitialized]);
    
      useEffect(() => {
        if (start) {
          runGame();
        }
      }, [start]);
    
      useEffect(() => {
        if (isUsersTurn) {
          checkState();
        }
      }, [grid]);
    
      useEffect(() => {
        if (isUsersTurn === false) {
          runGame();
        }
      }, [isUsersTurn]);
    
      useEffect(() => {
        if (lives === 0) {
          endGame();
        }
      }, [lives]);
    
      useEffect(() => {
        let timer;
        if (start && !gameOverModalVisible) {
          timer = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
          }, 1000);
        }
        return () => clearInterval(timer);
      }, [start, gameOverModalVisible]);
    
      const closeModal = () => {
        setModalVisible(false);
      };
    
      const openModal = () => {
        setModalVisible(true);
      };
    
      function runGame() {
        const newGrid = fillGrid(gridSize, 0);
        const temp = improvedFill(newGrid, filledTiles);
        setGrid(temp);
        setLastGrid(temp);
        setTimeout(() => {
          setGrid(fillGrid(gridSize, 0));
          setIsUsersTurn(true);
        }, 2000);
      }
    
      function checkState() {
        if (JSON.stringify(grid) === JSON.stringify(lastGrid)) {
          const newFilledTiles = filledTiles + 1;
          setFilledTiles(newFilledTiles);
    
          if (newFilledTiles >= (gridSize * gridSize) / 2) {
            setGridSize(gridSize + 1);
            const playNewLevelSound = async () => {
              if (newLevelSound) {
                await newLevelSound.replayAsync();
              }
            };
            playNewLevelSound();
          } else {
            const playVictorySound = async () => {
              if (victorySound) {
                await victorySound.replayAsync();
              }
            };
            playVictorySound();
          }

          setGrid(fillGrid(gridSize, 0));
          setLastGrid(fillGrid(gridSize, 2));
          setIsUsersTurn(false);
        }
      }
    
      function showMessage(message) {
        setErrorMessage(message);
        opacityAnim.setValue(1);
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }).start(() => {
          setErrorMessage('');
        });
      }
    
      function handlePress(row, col) {
        if (!isUsersTurn) {
          return;
        }
        let map = JSON.parse(JSON.stringify(lastGrid));
        let output = JSON.parse(JSON.stringify(grid));
        if (map[row][col] === 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          
          output[row][col] = 1;
          setGrid(output);
          tileAudio = async () => {
            if (tileSound) {
              await tileSound.replayAsync();
            }
          }
          tileAudio();
        } else {
          const newLife = lives - 1;
          setLives(newLife);
          if (newLife > 0) {
            showMessage('Not a Tile!');
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }

      }
    
      function endGame() {
        setGameOverModalVisible(true);
      }
    
      function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
      }
    
      function resetGame() {
        setCountdown(3);
        setJustEntered(true);
        setGridSize(3);
        setGrid([]);
        setFilledTiles(3);
        setLives(3);
        setLastGrid([]);
        setIsUsersTurn(null);
        setGridInitialized(false);
        setStart(false);
        setGameOverModalVisible(false);
        setElapsedTime(0);
        setErrorMessage('');
        opacityAnim.setValue(0);
    
        setGrid(fillGrid(3, 0));
        setGridInitialized(true);
        setStartTime(null);
      }
    
      return (
        <SafeAreaView style={styles.container}>
          <Header title="GRID MATCH" handleGoHome={openModal} />
          <ExitModal
            canSee={modalVisible}
            closeModal={closeModal}
            handleGoHome={() => navigation.navigate('Home')}
          />
          <View style={styles.header}>
            <View style={styles.livesContainer}>
              <Text style={styles.livesText}>Lives:</Text>
              <View style={styles.imageWrapper}>
                {Array.from({ length: lives }).map((_, index) => (
                  <Image
                    key={index}
                    source={require('../../../assets/heart_Icon.png')}
                    style={styles.image}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.levelText}>Level: {filledTiles - 2}</Text>
            {justEntered && (
              <View style={styles.countdown}>
                <Text style={styles.countdownText}>{countdown === 0 ? 'Go!' : countdown}</Text>
              </View>
            )}
          </View>
    
          {errorMessage !== '' && (
            <Animated.View style={[styles.errorMessageContainer, { opacity: opacityAnim }]}>
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </Animated.View>
          )}
    
          <View style={styles.gameContent}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: 'row' }}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={colIndex}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 7,
                      margin: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: cell === 0 ? '#FF69B4' : '#FFDD57',
                    }}
                    onPress={() => handlePress(rowIndex, colIndex)}
                  />
                ))}
              </View>
            ))}
          </View>
    
          {/* Game Over*/}
          <Modal
            animationType="fade"
            transparent={true}
            visible={gameOverModalVisible}
            onRequestClose={() => {}}
          >
            <View style={styles.modalCenteredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Game Over</Text>
                <Text style={styles.modalText}>Level Reached: {filledTiles - 3}</Text>
                <Text style={styles.modalText}>Time Played: {formatTime(elapsedTime)}</Text>
                <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
                  <Text style={styles.modalButtonText}>Play Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => navigation.navigate('Home')}>
                  <Text style={styles.modalButtonText}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#FFF3E9',
        flex: 1,
      },
      header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'center',
      },
      livesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      livesText: {
        fontSize: "40%",
        fontWeight: 'bold',
        color: 'black',
        marginRight: 10,
      },
      imageWrapper: {
        flexDirection: 'row',
      },
      image: {
        width: 50,
        height: 50,
        marginHorizontal: 2,
      },
      levelText: {
        fontSize: "50%",
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
      },
      countdown: {
        marginTop: 20,
      },
      countdownText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'black',
      },
      errorMessageContainer: {
        position: 'absolute',
        top: height * 0.2,
        left: 0,
        right: 0,
        alignItems: 'center',
      },
      errorMessageText: {
        fontSize: 20,
        color: '#ff3333',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 5,
      },
      gameContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalCenteredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', 
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
      },
      modalText: {
        fontSize: 20,
        marginBottom: 10,
        color: '#2C3E50',
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
        fontWeight: 'bold',
      },
    });
    
    export default TileMatch;