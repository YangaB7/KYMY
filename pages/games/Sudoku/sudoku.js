    import { getSudoku } from 'sudoku-gen';
    import React, { useState, useEffect, useRef } from 'react';
    import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
    import GridTwo from './sudokuGrid';
    import Header from '../../../components/header';
    import ExitModal from '../../../components/exitpage';
    import * as Haptics from "expo-haptics"
    import { Audio } from 'expo-av';

    const NumBank = (props) => {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", height: "50%" }}>
                    {nums.slice(0, 5).map((value, i) => (
                        <TouchableOpacity key={i} onPress={() => props.setTileValue(value)} style={styles.numButton}>
                            <Text style={styles.numText}>{value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", height: "50%" }}>
                    {nums.slice(5).map((value, i) => (
                        <TouchableOpacity key={i + 5} onPress={() => props.setTileValue(value)} style={styles.numButton}>
                            <Text style={styles.numText}>{value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const Sudoku = ({ navigation, route }) => {
        const [rows] = useState(9);
        const [cols] = useState(9);
        const [grid, setGrid] = useState(null);
        const [pressedIndex, setPressedIndex] = useState(null);
        const [emptyIndices, setEmptyIndices] = useState([]);
        const [diff] = useState(route.params.setting);
        const handleDiff = diff.toLowerCase();
        const [sudoku,setSudoku] = useState(getSudoku(handleDiff));
        const [modalVisible, setModalVisible] = useState(false);

        const [gameOverModalVisible, setGameOverModalVisible] = useState(false);
        const [hintsUsed, setHintsUsed] = useState(0);
        const [hintedCells, setHintedCells] = useState([]);
        const [elapsedTime, setElapsedTime] = useState(0);
        const [timer, setTimer] = useState(0);
        const timerRef = useRef(null);

        const [victorySound, setVictorySound] = useState();

        useEffect(() => {
            const loadSounds = async () => {
              try {
                const { sound: victory } = await Audio.Sound.createAsync(require("../../../assets/audios/successMatch.mp3"));
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

        const closeModal = () => {
            setModalVisible(false);
        };

        const openModal = () => {
            setModalVisible(true);
        };

        const isCellEmpty = (row, col) => {
            return emptyIndices.some(index => index[0] === row && index[1] === col);
        };

        useEffect(() => {
            updateGrid();
            startTimer();
            return () => {
                clearInterval(timerRef.current);
            };
        }, []);

        useEffect(() => {
            if (grid) {
                checkWon();
            }
        }, [grid]);

        const IsPressed = (row, col) => {
            if (!isCellEmpty(row, col)) {
                return;
            }
            setPressedIndex([row, col]);
        };

        const updateGrid = () => {
            const temp = Array.from({ length: rows }, () => Array(cols).fill(""));
            const blankIndices = [];

            for (let i = 0; i < sudoku.puzzle.length; i++) {
                const row = Math.floor(i / 9);
                const col = i % 9;

                if (sudoku.puzzle[i] !== "-") {
                    temp[row][col] = sudoku.puzzle[i];
                } else {
                    blankIndices.push([row, col]);
                }
            }

            setGrid(temp);
            setEmptyIndices(blankIndices);
        };

        const setTileValue = (value) => {
            if (pressedIndex !== null) {
                const [row, col] = pressedIndex;
                const updatedGrid = [...grid];
                updatedGrid[row][col] = value.toString();
                setGrid(updatedGrid);
                setPressedIndex(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
            }
        };

        const useHint = () => {
            if (emptyIndices.length === 0) return;

            const randomIndex = Math.floor(Math.random() * emptyIndices.length);
            const [row, col] = emptyIndices[randomIndex];

            const correctValue = sudoku.solution[row * 9 + col];

            const updatedGrid = [...grid];
            updatedGrid[row][col] = correctValue;
            setGrid(updatedGrid);

            const updatedEmptyIndices = [...emptyIndices];
            updatedEmptyIndices.splice(randomIndex, 1);
            setEmptyIndices(updatedEmptyIndices);

            setHintedCells([...hintedCells, `${row}-${col}`]);

            setHintsUsed(hintsUsed + 1);
        };

        const checkWon = () => {
            const currentGridString = grid.flat().join('');
            if (currentGridString === sudoku.solution) {
                stopTimer();
                setElapsedTime(timer);

                setGameOverModalVisible(true);
                return true;
            }
            return false;
        };

        const restartGame = () => {
            setGrid(null);
            setPressedIndex(null);
            setEmptyIndices([]);
            setHintsUsed(0);
            setHintedCells([]);
            setElapsedTime(0);
            setGameOverModalVisible(false);
            setTimer(0);
            updateGrid();
            startTimer();
        };

        const startTimer = () => {
            timerRef.current = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        };

        const stopTimer = () => {
            clearInterval(timerRef.current);
        };

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60)
                .toString()
                .padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };

        return (
            <SafeAreaView style={styles.container}>
                <Header title={"SUDOKU"} handleGoHome={() => openModal()} />
                <ExitModal canSee={modalVisible} closeModal={() => closeModal()} handleGoHome={() => navigation.navigate("Home")} />

                <View style={styles.infoContainer}>
                    <Text style={styles.timerText}>Time: {formatTime(timer)}</Text>
                    <TouchableOpacity onPress={useHint} style={styles.hintButton}>
                        <Text style={styles.hintButtonText}>Hint</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.gridContainer}>
                    {grid && emptyIndices ? (
                        <GridTwo
                            grid={grid}
                            pressedIndex={pressedIndex}
                            onCellPress={IsPressed}
                            emptyIndices={emptyIndices}
                            hintedCells={hintedCells}
                        />
                    ) : (
                        <ActivityIndicator size="large" color="#0000ff" />
                    )}
                </View>
                <View style={styles.numBankContainer}>
                    <NumBank setTileValue={setTileValue} />
                </View>

                {/* Game Over*/}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={gameOverModalVisible}
                    onShow={async () => {
                        if (victorySound) {
                          await victorySound.replayAsync();}}}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Congratulations!</Text>
                            <Text style={styles.modalMessage}>You solved the puzzle!</Text>
                            <Text style={styles.modalInfo}>Time Taken: {formatTime(elapsedTime)}</Text>
                            <Text style={styles.modalInfo}>Difficulty: {diff}</Text>
                            <Text style={styles.modalInfo}>Hints Used: {hintsUsed}</Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
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
            backgroundColor: "#FFF3E9",
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
        },
        infoContainer: {
            width: "100%",
            height:"10%",
            flexDirection: 'row',
            justifyContent: "space-around",
            alignItems: 'center',
            paddingHorizontal: 20,
            marginTop: 10,
        },
        timerText: {
            fontSize: "40%",
            fontWeight: 'bold',
        },
        hintButton: {
            padding: 10,
            backgroundColor: '#333333',
            height:"70%",
            width:"30%",
            justifyContent:"center",
            borderRadius: 10,
            alignItems: "center",
        },
        hintButtonText: {
            color: '#ffcccc',
            fontSize: "25%",
            fontWeight: "bold",
        },
        gridContainer: {
            height: "55%",
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 10,
        },
        numBankContainer: {
            height: "20%",
            width: "90%",
            marginBottom: 10,
        },
        numButton: {
            height: "90%",
            width: "20%",
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            margin: 3,
            backgroundColor: '#ddd',
        },
        numText: {
            fontSize: "40%",
            fontFamily: "Cabin-Medium",
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
        modalMessage: {
            fontSize: 20,
            marginBottom: 10,
        },
        modalInfo: {
            fontSize: 18,
            marginBottom: 5,
        },
        modalButton: {
            width: '100%',
            padding: 15,
            backgroundColor: '#f8a5a7',
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 10,
        },
        modalButtonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
        },
    });

    export default Sudoku;
