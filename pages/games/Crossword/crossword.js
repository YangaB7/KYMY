import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Dimensions, StyleSheet, SafeAreaView, Modal } from 'react-native';
import categories from "../../../commons/crosswordList.json";
import { Audio } from 'expo-av';
import Header from '../../../components/header';
import ExitModal from '../../../components/exitpage';

const Crossword = ({navigation}) => {
    const [grid, setGrid] = useState([]);
    const [table, setTable] = useState([]);
    const [cellSize, setCellSize] = useState(30);
    const [gridInfo, setGridInfo] = useState([]);
    const [isCrosswordCreated, setIsCrosswordCreated] = useState(false);
    const [acrossClues, setAcrossClues] = useState([]);
    const [downClues, setDownClues] = useState([]);
    const [selectedWords, setSelectedWords] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [revealedCells, setRevealedCells] = useState([]);
    const closeModal = () => {
        setModalVisible(false)
    }

    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [isWinModalVisible, setIsWinModalVisible] = useState(false);


    const selectCategory = (category) => {
        const allWords = categories[category];
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        let selectedWords = shuffled.slice(0, 10);
        setSelectedWords(selectedWords);
        setSelectedCategory(category);
    };

    const [victorySound, setVictorySound] = useState();
    const [errorSound, setErrorSound] = useState();
  
    useEffect(() => {
      const loadSounds = async () => {
        try {
          const { sound: victory } = await Audio.Sound.createAsync(require('../../../assets/audios/successMatch.mp3'));
          const { sound: error } = await Audio.Sound.createAsync(require('../../../assets/audios/error.mp3'));
          setVictorySound(victory);
          setErrorSound(error);
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
      };
    }, []);

    const handleInputChange = (row, col, value) => {
        const updatedGrid = [...grid];
        updatedGrid[row][col] = value;
        setGrid(updatedGrid);

        if (checkWin()) {
            setIsWinModalVisible(true);
        }
    };


    function clearTnOnG() {
        setSelectedWords([]);
        setRevealedCells([]);
        setGrid([]);
        setSelectedCategory("")
        setIsCrosswordCreated(false);
    }


    function generateCrossword() {
        if (selectedWords.length > 0) {
            var clg = require("crossword-layout-generator");
            var layout = clg.generateLayout(selectedWords);
            var rows = layout.rows;
            var cols = layout.cols;
            var table = layout.table;
            var output_json = layout.result;
            
            setTable(table);
            setGrid(Array.from({ length: rows }, () => Array(cols).fill('')));
            setGridInfo(output_json);

            const screenWidth = Dimensions.get('window').width;
            const padding = 0;
            const extraSize = 200;
            const newCellSize = Math.floor((screenWidth + extraSize - padding) / cols);
            setCellSize(newCellSize);
            setIsCrosswordCreated(true);

            const across = [];
            const down = [];
            output_json.forEach((word) => {
                if (word.orientation === "across") {
                    across.push({ position: word.position, clue: word.clue });
                } else if (word.orientation === "down") {
                    down.push({ position: word.position, clue: word.clue });
                }
            });
            setAcrossClues(across);
            setDownClues(down);

            setStartTime(Date.now());
            setHintsUsed(0);
            setRevealedCells([]); 
            setElapsedTime(0);
        }
    }

    function isStartingTile(row, col) {
        const word = gridInfo.find(word => word.startx - 1 === col && word.starty - 1 === row && word.orientation != "none");
        return word ? word.position : null;
    }


  // Timer useEffect
  useEffect(() => {
    let timer;
    if (isCrosswordCreated && !isWinModalVisible) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCrosswordCreated, startTime, isWinModalVisible]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleHint = () => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const correctLetter = table[i][j];
        if (correctLetter !== "-" && correctLetter !== "") {
          const userLetter = grid[i][j];
          if (userLetter.toUpperCase() !== correctLetter.toUpperCase()) {
    
            const updatedGrid = [...grid];
            updatedGrid[i][j] = correctLetter.toUpperCase();
            setGrid(updatedGrid);

            setHintsUsed(hintsUsed + 1);
            setRevealedCells([...revealedCells, { row: i, col: j }]);

            if (checkWin()) {
                setIsWinModalVisible(true);
            }
            return;
          }
        }
      }
    }
  };

    const checkWin = () => {
        for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const correctLetter = table[i][j];
            if (correctLetter !== "-" && correctLetter !== "") {
            const userLetter = grid[i][j];
            if (userLetter.toUpperCase() !== correctLetter.toUpperCase()) {
                return false;
            }
            }
        }
        }
        return true;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title={"Crossword"} handleGoHome={() => setModalVisible(true)}/>
            <ExitModal canSee={modalVisible} closeModal={()=>closeModal()} handleGoHome={()=>navigation.navigate("Home")}/>

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
                    <Text style={styles.modalText}>Time to Complete: {formatTime(elapsedTime)}</Text>
                    <Text style={styles.modalText}>Hints Used: {hintsUsed}</Text>
                    <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                        setIsWinModalVisible(false);
                        clearTnOnG(); // Reset the game
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
            {!isCrosswordCreated ? (
                <View style={styles.crossEntry}>
                    <Text style={styles.title}>Choose a Topic</Text>
                    <View style={styles.categoryContainer}>
                        {Object.keys(categories).map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.categoryButton, 
                                    selectedCategory === category ? styles.selectedCategory : null
                                ]}
                                onPress={() => selectCategory(category)}
                            >
                                <Text style={styles.categoryButtonText}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.button} onPress={()=> generateCrossword()}>
                        <Text style={styles.buttonText}>Create Crossword</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity style={styles.hintButton} onPress={handleHint}>
                        <Text style={styles.hintButtonText}>Hint</Text>
                        </TouchableOpacity>
                        <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>Time: {formatTime(elapsedTime)}</Text>
                        <Text style={styles.hintsUsedText}>Hints Used: {hintsUsed}</Text>
                        </View>
                    </View>
                    <ScrollView horizontal={true} style={styles.gridContainer}>
                        <View>
                            {grid.map((row, i) => (
                                <View key={i} style={styles.row}>
                                    {row.map((value, j) => {
                                        const position = isStartingTile(i, j);
                                        const isRevealed = revealedCells.some(cell => cell.row === i && cell.col === j);
                                        return table[i][j] === "-" ? (
                                            <View
                                                key={`${i}-${j}`}
                                                style={[styles.cell, { width: cellSize, height: cellSize, backgroundColor: 'black' }]}
                                            />
                                        ) : (
                                            <View
                                                key={`${i}-${j}`}
                                                style={[
                                                styles.cell,
                                                { width: cellSize, height: cellSize, position: 'relative' },
                                                isRevealed && styles.revealedCell 
                                                ]}
                                            >
                                                {position && (
                                                    <Text style={styles.positionText}>{position}</Text>
                                                )}
                                                <TextInput
                                                    value={value}
                                                    style={[styles.inputCell, { width: cellSize, height: cellSize }]}
                                                    onChangeText={(text) => handleInputChange(i, j, text.replace(/[^A-Za-z]/g, '').toUpperCase())}  
                                                    maxLength={1}
                                                    autoCorrect={false} 
                                                    autoCapitalize="characters"
                                                    keyboardType="default" 
                                                    editable={!isRevealed} 
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                    <View style={styles.clueContainer}>
                        <Text style={styles.clueTitle}>Across</Text>
                        {acrossClues.map((clue, index) => (
                            <Text key={index} style={styles.clueText}>{clue.position}. {clue.clue}</Text>
                        ))}

                        <Text style={styles.clueTitle}>Down</Text>
                        {downClues.map((clue, index) => (
                            <Text key={index} style={styles.clueText}>{clue.position}. {clue.clue}</Text>
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#FFF3E9",  
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    crossEntry: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    revealedCell: {
        backgroundColor: '#ccffcc', 
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#f85a5a",
        marginBottom: 20,
        fontFamily: 'Cabin-Medium',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 10,
      },
      hintButton: {
        backgroundColor: '#333333',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
      },
      hintButtonText: {
        color: '#ffcccc',
        fontSize: 18,
        fontFamily: 'Cabin-Medium',
      },
      timerContainer: {
        alignItems: 'flex-end',
      },
      timerText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'Cabin-Medium',
      },
      hintsUsedText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'Cabin-Medium',
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
        fontFamily: 'Cabin-Medium',
      },
      modalText: {
        fontSize: 20,
        marginBottom: 10,
        color: '#2C3E50',
        fontFamily: 'Cabin-Medium',
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
        fontFamily: 'Cabin-Medium',
      },
      newGameButton: {
        backgroundColor: '#f85a5a',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 20,
        elevation: 3,
        alignSelf: 'center',
        marginVertical: 20,
      },
      newGameButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Cabin-Medium',
      },
    categoryButton: {
        width: "45%", 
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        borderRadius: 15,
        backgroundColor: '#f8a5a7',  
        padding: 10,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCategory: {
        backgroundColor: '#f85a5a',
    },
    categoryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: 'Cabin-Medium',
    },
    button: {
        backgroundColor: '#f85a5a',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Cabin-Medium',
    },
    gridContainer: {
        marginBottom: 20,
        backgroundColor: "#FFF3E9",  
    },
    row: {
        flexDirection: 'row',
    },
    categoryContainer: {
        width: "90%",
        flexDirection: "row",  
        flexWrap: "wrap",  
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 20,  
    },
    cell: {
        borderWidth: 1,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    inputCell: {
        textAlign: 'center',
        padding: 0,
        fontFamily:"Cabin-Medium",
        fontSize:"30%",
    },
    positionText: {
        position: 'absolute',
        top: 2,
        left: 2,
        fontSize: 10,
        fontWeight: 'bold',
        color: 'red',
    },
    clueContainer: {
        padding: 10,
        marginTop: 20,
        backgroundColor: '#FFF3E9',  
    },
    clueTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f85a5a',
        marginVertical: 5,
    },
    clueText: {
        fontSize: 16,
        marginVertical: 2,
        color: '#000', 
    },
    playButtonText: {
        fontFamily: 'Cabin-Medium',
        fontSize: 18,
        color: 'white',
        fontWeight: "bold",
    },
});

export default Crossword;
