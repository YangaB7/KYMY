import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Alert,Dimensions,TouchableOpacity,Text, Modal,SafeAreaView} from 'react-native';
import Svg, { Rect, Circle, Defs, Mask } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';


import Header from '../../components/header';
import ExitModal from '../../components/exitpage';

function generateMaze(width, height) {
    const maze = [];
    for (let x = 0; x < width; x++) {
      maze[x] = [];
      for (let y = 0; y < height; y++) {
        maze[x][y] = {
          x,
          y,
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true },
        };
      }
    }
  
    function carvePassagesFrom(cx, cy) {
      const directions = ['top', 'right', 'bottom', 'left'];
      shuffleArray(directions);
  
      directions.forEach((direction) => {
        const [nx, ny] = getNeighbor(cx, cy, direction);
  
        if (
          nx >= 0 &&
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !maze[nx][ny].visited
        ) {
          maze[cx][cy].walls[direction] = false;
          maze[nx][ny].walls[getOppositeDirection(direction)] = false;
          maze[nx][ny].visited = true;
          carvePassagesFrom(nx, ny);
        }
      });
    }
  
    maze[0][0].visited = true;
    carvePassagesFrom(0, 0);
  
    return maze;
  }
  
  function getNeighbor(x, y, direction) {
    switch (direction) {
      case 'top':
        return [x, y - 1];
      case 'right':
        return [x + 1, y];
      case 'bottom':
        return [x, y + 1];
      case 'left':
        return [x - 1, y];
    }
  }
  
  function getOppositeDirection(direction) {
    switch (direction) {
      case 'top':
        return 'bottom';
      case 'right':
        return 'left';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
    }
  }
  
  function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5);
  }  

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function MazeGame({ navigation }) {
  const mazeWidth = 8;
  const mazeHeight = 8;
  const tileSize = Math.floor(screenWidth / (mazeWidth + 2)); 

  const [maze, setMaze] = useState(() => generateMaze(mazeWidth, mazeHeight));
  const [gamePhase, setGamePhase] = useState('observation'); 
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [hintAvailable, setHintAvailable] = useState(true);
  const [hintActive, setHintActive] = useState(false);

  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  //exit modal stuff
  const [modalVisible, setModalVisible] = useState(false);

  const [isWinModalVisible, setIsWinModalVisible] = useState(false);
  const [victorySound, setVictorySound] = useState();
  const closeModal = () => {
    setModalVisible(false);
  };

  const exitPosition = { x: mazeWidth - 1, y: mazeHeight - 1 };

  useEffect(() => {
    if (gamePhase === 'memory') {
      setCharacterPosition({ x: 0, y: 0 });
      setStartTime(new Date());           
      setHintsUsed(0);   
    }
  }, [gamePhase]);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: victory } = await Audio.Sound.createAsync(
          require('../../assets/audios/successMatch.mp3')
        );
        setVictorySound(victory);
      } catch (err) {
        console.warn('Error loading victory sound:', err);
      }
    };

    loadSounds();

    return () => {
      if (victorySound) {
        victorySound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (gamePhase === 'memory') {
      if (
        characterPosition.x === exitPosition.x &&
        characterPosition.y === exitPosition.y
      ) {
        setIsWinModalVisible(true);
        setGamePhase('completed');
        const endTime = new Date();
        setEndTime(endTime);
        const timeDiff = (endTime - startTime) / 1000; 
        setTimeTaken(timeDiff);
      }
    }
  }, [characterPosition]);

  const playVictorySound = async () => {
    if (victorySound) {
      await victorySound.replayAsync();
    }
  };

  function handleReady() {
    setGamePhase('memory');
  }

  function handleMove(direction) {
    if (hintActive) return;

    const { x, y } = characterPosition;
    let newX = x;
    let newY = y;

    // Check walls before moving
    const cell = maze[x][y];
    if (direction === 'up' && !cell.walls.top) newY -= 1;
    if (direction === 'down' && !cell.walls.bottom) newY += 1;
    if (direction === 'left' && !cell.walls.left) newX -= 1;
    if (direction === 'right' && !cell.walls.right) newX += 1;

    if (
      newX >= 0 &&
      newX < mazeWidth &&
      newY >= 0 &&
      newY < mazeHeight &&
      (newX !== x || newY !== y)
    ) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      setCharacterPosition({ x: newX, y: newY });
    }
    else {
      setMistakes(mistakes+1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}min ${remainingSeconds}sec`;
  }  

  function handleRestart() {
    setMaze(generateMaze(mazeWidth, mazeHeight));
    setGamePhase('observation');
    setHintAvailable(true);
    setHintActive(false);
    setHintsUsed(0);     
    setStartTime(null);   
    setEndTime(null);   
    setTimeTaken(0);   
  }

  function handleHint() {
    if (hintAvailable) {
      setHintAvailable(false);
      setHintActive(true);
      setHintOpacity(0.5);
      setHintsUsed(prevHintsUsed => prevHintsUsed + 1);
      setTimeout(() => {
        setHintOpacity(1);
        setHintAvailable(true);
        setHintActive(false);
      }, 2000);
    }
  }

  const [hintOpacity, setHintOpacity] = useState(1);

  const mazeGridContainerStyle = {
    position: 'relative',
    width: tileSize * mazeWidth,
    height: tileSize * mazeHeight,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="MAZE MEMORY" handleGoHome={() => setModalVisible(true)} />
      <ExitModal
        canSee={modalVisible}
        closeModal={() => closeModal()}
        handleGoHome={() => navigation.navigate('Home')}
      />

      <View style={styles.scrollContainer}>
        <View style={styles.mazeContainer}>
          <MazeGrid
            maze={maze}
            tileSize={tileSize}
            characterPosition={characterPosition}
            gamePhase={gamePhase}
            startPosition={{ x: 0, y: 0 }}
            exitPosition={exitPosition}
            mazeGridContainerStyle={mazeGridContainerStyle}
          />
          {gamePhase === 'memory' && (
            <VisionMask
              characterPosition={characterPosition}
              tileSize={tileSize}
              hintOpacity={hintOpacity}
            />
          )}
        </View>
        {gamePhase === 'observation' ? (
        <>
          <TouchableOpacity style={styles.readyButton} onPress={handleReady}>
            <Text style={styles.readyButtonText}>Ready</Text>
          </TouchableOpacity>
          <View style={styles.infoView}><View style={styles.iWrapper}><View style={styles.I}><Text style={styles.Itext}>i</Text></View></View><Text style={styles.infoText}>Try to memorize the route from the green square to the red square! Whenever you feel ready, click the ready button to begin.</Text></View>
        </>
        ) : gamePhase === 'memory' ? (
          <>
            <MovementControls
              onMove={handleMove}
              hintActive={hintActive}
              style={styles.movementControls}
            />
            <TouchableOpacity
              style={styles.hintButton}
              onPress={handleHint}
              disabled={!hintAvailable || hintActive}
            >
              <Text style={styles.hintButtonText}>Hint</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.readyButton} onPress={handleRestart}>
            <Text style={styles.readyButtonText}>Play Again</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isWinModalVisible}
        onRequestClose={() => setIsWinModalVisible(false)}
        onShow={async () => {
          await playVictorySound();
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalText}>You completed the maze!</Text>
            <Text style={styles.modalText}>Hints used: {hintsUsed}</Text>
            <Text style={styles.modalText}>Mistakes: {mistakes}</Text>
            <Text style={styles.modalText}>Time taken: {formatTime(timeTaken)}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsWinModalVisible(false);
                handleRestart();
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
}

function MazeGrid({maze,tileSize,characterPosition,gamePhase,startPosition,exitPosition,mazeGridContainerStyle}) {
  return (
    <View style={mazeGridContainerStyle}>
      {maze.map((column, x) =>
        column.map((cell, y) => {
          return (
            <View
              key={`${x}-${y}`}
              style={[
                {
                  position: 'absolute',
                  left: x * tileSize,
                  top: y * tileSize,
                  width: tileSize,
                  height: tileSize,
                  backgroundColor:
                    x === startPosition.x && y === startPosition.y
                      ? '#b3ffb3' // Start tile color
                      : x === exitPosition.x && y === exitPosition.y
                      ? '#ffb3b3' // Exit tile color
                      : 'white',
                },
              ]}
            >
              {/* Draw walls */}
              {cell.walls.top && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: tileSize,
                    height: 2,
                    backgroundColor: 'black',
                  }}
                />
              )}
              {cell.walls.right && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 2,
                    height: tileSize,
                    backgroundColor: 'black',
                  }}
                />
              )}
              {cell.walls.bottom && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: tileSize,
                    height: 2,
                    backgroundColor: 'black',
                  }}
                />
              )}
              {cell.walls.left && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 2,
                    height: tileSize,
                    backgroundColor: 'black',
                  }}
                />
              )}
              {/* Render character */}
              {gamePhase !== 'observation' &&
                x === characterPosition.x &&
                y === characterPosition.y && (
                  <View
                    style={{
                      width: tileSize * 0.6,
                      height: tileSize * 0.6,
                      backgroundColor: 'blue',
                      borderRadius: 5,
                      position: 'absolute',
                      left: (tileSize - tileSize * 0.6) / 2,
                      top: (tileSize - tileSize * 0.6) / 2,
                    }}
                  />
                )}
            </View>
          );
        })
      )}
    </View>
  );
}

function VisionMask({
  characterPosition,
  tileSize,
  hintOpacity,
}) {
  const radius = tileSize * 0.6;
  const offset = tileSize;

  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Mask id="mask">
          <Rect width="100%" height="100%" fill="white" />
          <Circle
            cx={characterPosition.x * tileSize + tileSize / 2 + offset}
            cy={characterPosition.y * tileSize + tileSize / 2}
            r={radius}
            fill="black"
          />
        </Mask>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        fill="black"
        mask="url(#mask)"
        fillOpacity={hintOpacity}
      />
    </Svg>
  );
}

function MovementControls({ onMove, hintActive }) {
  return (
    <View style={styles.controls}>
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => onMove('up')}
          disabled={hintActive}
        >
          <Text style={styles.controlText}>↑</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => onMove('left')}
          disabled={hintActive}
        >
          <Text style={styles.controlText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => onMove('down')}
          disabled={hintActive}
        >
          <Text style={styles.controlText}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => onMove('right')}
          disabled={hintActive}
        >
          <Text style={styles.controlText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#FFF3E9",
    justifyContent:"space-around"
  },
  iWrapper: {
    width:"100%",
    padding:10
  },    
  I: {
    width: screenWidth * 0.05,
    height: screenWidth * 0.05,
    borderRadius: (screenWidth * 0.1) / 2,
    backgroundColor: 'turquoise',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  Itext: {
    fontSize: screenWidth * 0.03,
    color: 'white',
    fontWeight: 'bold',
  },
  infoView: {
    borderRadius: 6,
    width: '90%',
    backgroundColor: '#FDA758',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: "30%",
    fontFamily: 'Cabin-Medium',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  mazeContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  controlButton: {
    backgroundColor: '#ddd',
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  controlText: {
    color: '#000',
    fontSize: 18,
    fontFamily:"Cabin-Medium",
  },
  hintContainer: {
    marginTop: 10,
  },
  hintButton: {
    backgroundColor: '#333333',
    padding: 10,
    width: '80%',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  hintButtonText: {
    color: '#ffcccc',
    fontSize: 18,
    fontFamily:"Cabin-Medium",
  },
  readyButton: {
    backgroundColor: '#333333',
    padding: 10,
    width: '80%',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
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
    fontFamily: 'Cabin-Medium',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'Cabin-Medium',
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
    fontFamily: 'Cabin-Medium',
    fontWeight: 'bold',
  },  
  readyButtonText: {
    color: '#ffcccc',
    fontSize: "30%",
    fontFamily:"Cabin-Medium",
  },
  movementControls: {
    marginTop: 20,
  },
});

export default MazeGame;
