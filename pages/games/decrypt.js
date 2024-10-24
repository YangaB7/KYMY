import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal } from 'react-native';
import Header from "../../components/header";
import ExitModal from '../../components/exitpage';
import quotes from '../../commons/quotes.json';
import * as Haptics from "expo-haptics";
import { Audio } from 'expo-av';

function shuffleAlphabet() {
    let shuffledAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for (let i = shuffledAlphabet.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledAlphabet[i], shuffledAlphabet[j]] = [shuffledAlphabet[j], shuffledAlphabet[i]];
    }
    return shuffledAlphabet;
}

function splitPhraseIntoArray(phrase) {
    let words = phrase.split(" ");
    let result = [];
    words.forEach(word => {
        let characters = word.split("");
        result.push(characters);
    });
    return result;
}

function shuffleWords(arr, difficulty) {
    let shuffledAlpha = shuffleAlphabet();
    let output = arr.map(wordArray => [...wordArray]);

    function diffMeter(difficulty) {
        switch (difficulty) {
            case "easy":
                return 0.333;
            case "med":
                return 0.4;
            case "hard":
                return 0.6;
            default:
                return 0;
        }
    }
    
    for(let i = 0; i < arr.length; i++) {
        let currentWord = arr[i];
        let chosenNums = [];
        if(currentWord.length < 2) {
            continue;
        }
        let numToShuffle = Math.ceil(currentWord.length * diffMeter(difficulty));
        while (chosenNums.length < numToShuffle) {
            let index = Math.floor(Math.random() * currentWord.length);
            if (!chosenNums.includes(index)) {
                chosenNums.push(index);
            }
        }
        for(let k = 0; k < chosenNums.length; k++) {
            let char = output[i][chosenNums[k]];
            if(/[a-zA-Z]/.test(char)) {
                let isUpperCase = char === char.toUpperCase();
                let originalLetter = char.toLowerCase();
                let indexInAlphabet = 'abcdefghijklmnopqrstuvwxyz'.indexOf(originalLetter);
                let shuffledLetter = shuffledAlpha[indexInAlphabet];
                output[i][chosenNums[k]] = isUpperCase ? shuffledLetter.toUpperCase() : shuffledLetter;
            }
        }
    }
    return output;
}

const Crypt = ({navigation}) => {
    const [cryptedPhrase, setCryptedPhrase] = useState([]);
    const [originalPhrase, setOriginalPhrase] = useState([]);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [assignedLetters, setAssignedLetters] = useState(new Map());
    const [revealedLetters, setRevealedLetters] = useState(new Set());
    const [solutionMapping, setSolutionMapping] = useState(new Map());
    const [modalVisible, setModalVisible] = useState(false);
    const closeModal = () => {
        setModalVisible(false)
    }

    const [hintsUsed, setHintsUsed] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isGameWon, setIsGameWon] = useState(false);
    const [authorName, setAuthorName] = useState('');
    const [quoteText, setQuoteText] = useState('');
    const [showQuote, setShowQuote] = useState(false);

    const [victorySound, setVictorySound] = useState();

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    function onMount() {
         // Pick a random quote
         const randomIndex = Math.floor(Math.random() * quotes.length);
         const selectedQuote = quotes[randomIndex];
         const { quote, author } = selectedQuote;
         setAuthorName(author);
         setQuoteText(quote);
 
         const original = splitPhraseIntoArray(quote);
         const crypted = shuffleWords(original, "easy");
         setOriginalPhrase(original);
         setCryptedPhrase(crypted);
 
         // Build solutionMapping
         const mapping = new Map();
         for(let i = 0; i < original.length; i++) {
             for(let j = 0; j < original[i].length; j++) {
                 const originalLetter = original[i][j];
                 const scrambledLetter = crypted[i][j];
                 if(originalLetter !== scrambledLetter && /[a-zA-Z]/.test(originalLetter)) {
                     mapping.set(scrambledLetter, originalLetter);
                 }
             }
         }
         setSolutionMapping(mapping);
         setStartTime(Date.now());
    }

    useEffect(() => {
       onMount()
    }, []);

    useEffect(() => {
        const loadSound = async () => {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/audios/successMatch.mp3')
          );
          setVictorySound(sound);
        };
      
        loadSound();
      
        return () => {
          if (victorySound) {
            victorySound.unloadAsync();
          }
        };
      }, []);

    useEffect(() => {
        let timer;
        if (!isGameWon) {
            timer = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [startTime, isGameWon]);

    const handleKeyPress = (letter) => {
        if (selectedLetter) {
            if (revealedLetters.has(selectedLetter)) {
                return;
            }
            const scrambledLetter = selectedLetter;
            const assignedLetter = letter;

            const newAssignedLetters = new Map(assignedLetters);

            newAssignedLetters.set(scrambledLetter, assignedLetter);

            setAssignedLetters(newAssignedLetters);
            setSelectedLetter(null);

            checkWinCondition(newAssignedLetters);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handleLetterSelect = (letter) => {
        if (revealedLetters.has(letter)) {
            return;
        }
        setSelectedLetter(letter === selectedLetter ? null : letter);
    };

    const handleHint = () => {
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const unsolvedLetters = new Set();

        for(let [scrambledLetter, originalLetter] of solutionMapping.entries()) {
            const assignedLetter = assignedLetters.get(scrambledLetter);
            if(assignedLetter && assignedLetter.toUpperCase() === originalLetter.toUpperCase()) {
                continue; // Already correct
            }
            unsolvedLetters.add(scrambledLetter);
        }

        const unsolvedLettersArray = Array.from(unsolvedLetters);

        if(unsolvedLettersArray.length > 0) {
            const scrambledLetterToReveal = unsolvedLettersArray[0]; // or random
            const correctLetter = solutionMapping.get(scrambledLetterToReveal);

            const newAssignedLetters = new Map(assignedLetters);
            newAssignedLetters.set(scrambledLetterToReveal, correctLetter);

            const newRevealedLetters = new Set(revealedLetters);
            newRevealedLetters.add(scrambledLetterToReveal);

            setAssignedLetters(newAssignedLetters);
            setRevealedLetters(newRevealedLetters);
            setHintsUsed(hintsUsed + 1);

            checkWinCondition(newAssignedLetters);
        } else {
            Alert.alert("No more hints available");
        }
    };

    const checkWinCondition = (currentAssignedLetters) => {
        for(let [scrambledLetter, originalLetter] of solutionMapping.entries()) {
            const assignedLetter = currentAssignedLetters.get(scrambledLetter);
            if (!assignedLetter) {
                return; //Not solved yet, letter not assigned
            }
            if (assignedLetter.toUpperCase() !== originalLetter.toUpperCase()) {
                return; //Not solved yet
            }
        }
        //All letters match
        setIsGameWon(true);
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const renderLetter = (letter, originalLetter, wordIndex, letterIndex) => {
        const scrambledLetter = letter;
        const isEncrypted = originalLetter !== letter;
        const isSelected = scrambledLetter === selectedLetter;
        const isRevealed = revealedLetters.has(scrambledLetter);

        if (isEncrypted) {
            const assignedLetter = assignedLetters.get(scrambledLetter) || scrambledLetter;
            const displayLetter = (scrambledLetter === scrambledLetter.toUpperCase()) ? assignedLetter.toUpperCase() : assignedLetter.toLowerCase();

            return (
                    <TouchableOpacity 
                        key={`${wordIndex}-${letterIndex}`} 
                        style={[
                            styles.encryptedLetter,
                            isSelected && styles.selectedLetter,
                            isRevealed && styles.revealedLetter
                        ]}
                        onPress={() => {
                            if(!isRevealed){
                                handleLetterSelect(letter)
                            }
                        }}
                    >
                        <Text style={styles.letter}>
                            {displayLetter}
                        </Text>
                    </TouchableOpacity>
            );
        } else {
            return (
                <Text 
                    key={`${wordIndex}-${letterIndex}`} 
                    style={styles.letter}
                >
                    {letter}
                </Text>
            );
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title={"DECRYPT"} handleGoHome={() => setModalVisible(true)}/>
            <ExitModal canSee={modalVisible} closeModal={()=>closeModal()} handleGoHome={()=>navigation.navigate("Home")}/>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.phraseContainer}>
                    {cryptedPhrase.map((word, wordIndex) => (
                        <View key={wordIndex} style={styles.wordContainer}>
                            {word.map((letter, letterIndex) => 
                                renderLetter(letter, originalPhrase[wordIndex][letterIndex], wordIndex, letterIndex)
                            )}
                            {wordIndex < cryptedPhrase.length - 1 && <Text style={styles.letter}> </Text>}
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.keyboard}>
                {alphabet.map((letter) => (
                    <TouchableOpacity 
                        key={letter} 
                        style={styles.key}
                        onPress={() => handleKeyPress(letter)}
                    >
                        <Text style={styles.keyText}>{letter}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.hintButton} onPress={handleHint}>
                <Text style={styles.hintButtonText}>Hint</Text>
            </TouchableOpacity>

            {/* Win*/}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isGameWon}
                onShow={async () => {
                    if (victorySound) {
                      await victorySound.replayAsync();
                    }
                  }}
            >
                <View style={styles.modalCenteredView}>
                    <View style={styles.modalView}>
                        {showQuote ? (
                            <View style={styles.quoteContainer}>
                                <Text style={styles.modalQuote}>{quoteText}</Text>
                                <Text style={styles.modalText}>Author: {authorName}</Text>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setShowQuote(false)}
                                >
                                    <Text style={styles.modalButtonText}>Back</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Congratulations!</Text>
                                <Text style={styles.modalText}>You solved the puzzle!</Text>
                                <Text style={styles.modalText}>Time Taken: {formatTime(elapsedTime)}</Text>
                                <Text style={styles.modalText}>Hints Used: {hintsUsed}</Text>
                                <Text style={styles.modalText}>Author: {authorName}</Text>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setShowQuote(true)}
                                >
                                    <Text style={styles.modalButtonText}>View Quote</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        setAssignedLetters(new Map());
                                        setRevealedLetters(new Set());
                                        setHintsUsed(0);
                                        setIsGameWon(false);
                                        setShowQuote(false);
                                        onMount()
                                        setSelectedLetter(null)
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Play Again</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => navigation.navigate("Home")}
                                >
                                    <Text style={styles.modalButtonText}>Exit</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 20,
        alignItems:"center"
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    keyboard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 20,
    },
    key: {
        width: '12%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        margin: '1%',
        borderRadius: 8,
    },
    keyText: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily:"Cabin-Medium",
    },
    phraseContainer: {
        width:"90%",
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf:"center",
        justifyContent: 'center',
    },
    wordContainer: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    letter: {
        fontSize: 26,
        fontFamily:"Cabin-Medium",
    },
    encryptedLetter: {
        backgroundColor: '#ffcccc',
        borderRadius: 3,
        padding: 2,
        width:25,
        margin: 1,
        alignItems:'center'
    },
    selectedLetter: {
        backgroundColor: '#ffff00', 
    },
    revealedLetter: {
        backgroundColor: '#ccffcc', 
    },
    hintButton: {
        backgroundColor: '#333333',
        padding: 10,
        width:"80%",
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    hintButtonText: {
        color: '#ffcccc',
        fontSize: 18,
         fontFamily:"Cabin-Medium"
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
        fontFamily:"Cabin-Medium"
    },
    modalText: {
        fontSize: 20,
        marginBottom: 10,
        color: '#2C3E50',
        fontFamily:"Cabin-Medium"
    },
    modalQuote: {
        fontSize: 22,
        marginBottom: 15,
        textAlign: 'center',
        color: '#34495E',
         fontFamily:"Cabin-Medium"
    },
    quoteContainer: {
        alignItems: 'center',
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
         fontFamily:"Cabin-Medium"
    },
});

export default Crypt;
