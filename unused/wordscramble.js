import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { vowels, consonants, make2D, shuffle } from "../commons/constants";

const VOWELS = 2;
const words = require('../realOutput.json');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillArr() {
    let output = [];
    let usedConsonants = new Set();

    for (let i = 0; i < VOWELS; i++) {
        const vowel = vowels[Math.floor(Math.random() * vowels.length)];
        const randomValue = getRandomInt(1, 3);
        output.push([vowel, randomValue]);
    }

    while (output.length < 6) {
        const consonant = consonants[Math.floor(Math.random() * consonants.length)];
        if (!usedConsonants.has(consonant)) {
            const randomValue = getRandomInt(1, 3);
            output.push([consonant, randomValue]);
            usedConsonants.add(consonant);
        }
    }

    output = shuffle(output);

    for (let i = 0; i < output.length; i++) {
        output[i].push(i); 
    }

    return output;
}


function isWord(word, key) {
    for (let i = 0; i < key.length; i++) {
        if (word === key[i]) {
            return true;
        }
    }
    return false;
}

const ScrambleView = () => {
    const [wordBank, setWordBank] = useState([]);
    const [table, setTable] = useState([]);
    const [unfilledVal, setUnfilledVal] = useState(0);
    const empty = ["", 0, 0]

    useEffect(() => {
        setWordBank(fillArr([]));  // Start with an empty array
        setTable([empty,empty,empty,empty,empty,empty])
    }, []);

    function handleBankTouch(element) {
        if(element == []) {
            return;
        }
        tempTable = JSON.parse(JSON.stringify(table));
        tempBank = JSON.parse(JSON.stringify(wordBank));

        tempTable[unfilledVal] = element;
        setUnfilledVal(unfilledVal+1)
        tempBank[element[2]] = [];

        setTable(tempTable)
        setWordBank(tempBank)

    }

    function handleTableTouch(element, index) {
        tempTable = JSON.parse(JSON.stringify(table));
        tempBank = JSON.parse(JSON.stringify(wordBank));

        tempBank[element[2]] = element;
        for(i = index+1; i < tempTable.length; i++) {
            console.log("working");
            tempBank[i-1] = tempBank[i];
        }
        setUnfilledVal(unfilledVal-1);

        setWordBank(wordBank);
        setTable(table);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text>{unfilledVal}</Text>
                <TouchableOpacity onPress={()=> setUnfilledVal(0)}><Text>reset</Text></TouchableOpacity>
            </View>
            <View style={{ width: 200, height: 20, flexDirection: "row"}}>
            {table.map((value, index) => (
                    <TouchableOpacity onPress={()=>handleTableTouch()} key={index} style={{ height: 20, width: 20, backgroundColor: "red", justifyContent:"center" }}>
                        <Text>
                            {value[0]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ width: 200, height: 20, flexDirection: "row"}}>
                {wordBank.map((value, index) => (
                    <TouchableOpacity key={index} style={{ height: 20, width: 20, backgroundColor: "red", justifyContent:"center" }} onPress={()=>handleBankTouch(value)}>
                        <Text>
                            {value[0]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity onPress={() => console.log(wordBank)}>
                <Text>button</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF3E9",
        justifyContent: "center",
        alignItems: "center"
    },
    letter: {
        height: 50,
        width: 50,
        marginHorizontal: 3,
        backgroundColor: 'teal',
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center"
    },
    bank: {
        marginVertical: 10,
        flexDirection: "row"
    },
    uses: {
        height: 20,
        width: 50,
        marginHorizontal: 3,
        backgroundColor: 'yellow',
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default ScrambleView;
