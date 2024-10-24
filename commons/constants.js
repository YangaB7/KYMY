import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
  }

export function make2D(arr1D, numRows, numCols) {
    if (arr1D.length !== numRows * numCols) {
        console.error("Error: Insufficient elements in the 1D array to fill the 2D array.");
        return null;
    }

    let arr2D = [];

    for (let i = 0; i < numRows; i++) {
        arr2D.push([]);
        for (let j = 0; j < numCols; j++) {
            arr2D[i].push(arr1D[i * numCols + j]);
        }
    }
}

export const vowels = ["A","E","I","O","U"]
export const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Y', 'Z']

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

export const checkAndUpdateStreak = async () => {
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


export const games = [
    { id: 1, name: 'Matching Tiles', category: ["Visual Memory","Attention","Working Memory"], description: 'Get ready for a challenge! Match highlighted tiles in a grid that keeps getting bigger. Test your memory and speed as the grid expands with each level!', nav: 'Matching' },
    { id: 2, name: 'Slide Puzzle', category:["Visual-Spatial Memory","Problem-Solving Skills","Working Memory"], description: 'Rearrange the tiles in a 3x3 or 4x4 grid until they\'re in numerical order. Slide them around and see how quickly you can solve the puzzle!', nav: 'SlideEntry' },
    { id: 3, name: 'Decrypt', category:  ["Pattern Recognition","Analytical Thinking","Working Memory"], description: 'Unravel the mystery by decrypting a quote! Tackle varying difficulty levels and see if you can crack the code.', nav: 'Crypt'},
    { id: 4, name: 'Color Sequence', category: ["Sequential Memory","Working Memory","Attention and Focus"], description: 'Test your memory by matching a sequence of button presses after they\'ve been shown to you. Can you remember the pattern and get it right before the time runs out?', nav: 'OrderEntry'},
    { id: 5, name: 'Sudoku', category: ["Logical Reasoning","Working Memory","Visual-Spatial Memory"], description: 'Enjoy a classic game of Sudoku! Fill the grid so every row, column, and box contains the numbers 1 to 9. Simple, yet endlessly engaging!', nav: 'SudokuEntry'},
    { id: 6, name: 'Grid Match', category: ["Visual Memory","Attention to Detail","Working Memory"], description: 'Get ready for a challenge! Match highlighted tiles in a grid that keeps getting bigger. Test your memory and speed as the grid expands with each level!', nav: 'TileEntry' },
    { id: 7, name: 'Word Scramble', category: ["Verbal Memory", "Lexical Access","Processing Speed"], description: 'Race against the clock to create as many words as possible from a jumbled collection of letters. How many words can you find before time runs out?', nav: 'WordScramble'},
    {id: 8, name: 'Crossword', category: ["Verbal Memory", "Semantic Memory", "Working Memory"], description: 'Challenge yourself with a customizable crossword puzzle! Pick your favorite topic and fill in the grid with the right words.', nav: 'Crossword'},
    {id: 9, name: 'Memory Maze', category: ["Working Memory", "Visual-Spatial Memory", "Sequential Memory"], description:'Can oyu remember all the steps before the lights go out?', nav:'MazeGame'}
];


    //CROSSWORD TILE ADJUSTMENT IDEA
    // const MAX_COLUMNS = 9;
    // const MAX_ATTEMPTS = 100;
    // function generateCrossword() {
    //     if (selectedWords.length > 0) {
    //         var clg = require("crossword-layout-generator");

    //         let bestLayout = null;
    //         let attempts = 0;

    //         while (!bestLayout && attempts < MAX_ATTEMPTS) {
    //             const layout = clg.generateLayout(selectedWords);
    //             if (layout.cols <= MAX_COLUMNS) {
    //                 bestLayout = layout;
    //                 break;
    //             }
    //             attempts++;
    //         }

    //         if (bestLayout) {
    //             setTable(bestLayout.table);
    //             setGrid(bestLayout.table.map(row => row.map(cell => cell === '-' ? null : '')));
    //             setGridInfo(bestLayout.result);

    //             const across = [];
    //             const down = [];
    //             bestLayout.result.forEach((word) => {
    //                 if (word.orientation === 'across') {
    //                     across.push({ position: word.position, clue: word.clue });
    //                 } else if (word.orientation === 'down') {
    //                     down.push({ position: word.position, clue: word.clue });
    //                 }
    //             });
    //             setAcrossClues(across);
    //             setDownClues(down);

    //             setIsCrosswordCreated(true);
    //         } else {
    //             alert("Unable to generate a compact crossword within the width limit. Please try again or select fewer words.");
    //         }
    //     }
    // }