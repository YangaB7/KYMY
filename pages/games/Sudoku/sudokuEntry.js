import {View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Image} from 'react-native';
import {useState} from 'react';
import Header from '../../../components/header';

const SudokuEntry = ({navigation}) => {
    const difficulty = ["Easy", "Medium", "Hard", "Expert"];
    const [showingDiff, setShowingDiff] = useState(0);
    
    function handleFrontPress() {
        if(showingDiff == difficulty.length - 1) {
            setShowingDiff(0);
        }        
        else(setShowingDiff(showingDiff+1))
    }

    function handleBackPress() {
        if(showingDiff == 0) {
            setShowingDiff(difficulty.length-1);
        }        
        else(setShowingDiff(showingDiff-1))
    }

    return (
        <SafeAreaView style={styles.BG}>
            <Header title={"SUDOKU"} handleGoHome={() => navigation.navigate("Home")}/>
            <View style={styles.display}>
                <Image source={require("../../../assets/Sudoku.png")} style={{width:"85%", height:"85%"}} resizeMode='contain'/>
            </View>
            <View style={styles.difficulty}>
                <Text style={{fontSize:30, fontWeight:"bold"}}>Set Difficulty</Text>
                <View style={{flexDirection:"row", height:"70%", alignItems:"center"}}>
                    <TouchableOpacity onPress={()=> handleBackPress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:50,height:50, transform:[{scaleX:-1}]}} resizeMode="contain"/>
                    </TouchableOpacity>
                    <View style={styles.difficultyView}>
                        <Text>Current Difficulty:</Text>
                        <View style={{height:"95%", justifyContent:"center"}}>
                            <Text style={{ fontFamily:'Cabin-Medium', fontSize:50}}>{difficulty[showingDiff]}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={()=> handleFrontPress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:50,height:50}} resizeMode="contain"/>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.play} onPress={()=> navigation.navigate("Sudoku", {setting: difficulty[showingDiff]})}>
                <Text style={{fontSize:100, fontFamily:'Cabin-Medium', fontWeight:"bold"}}>Play</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

styles = StyleSheet.create({
    BG: {
        flex: 1,
        backgroundColor: "#FFF3E9",
        flexDirection: "column",
        alignItems:"center",
        justifyContent:"space-between"
    },
    header: {
        width: "full",
        height: "15%",
        justifyContent:"center",
        flexDirection:"row",
    },
    headerText: {
        fontSize:30,
        fontWeight:"bold",
        textAlign:"center",
        padding:"7%"
    },
    display: {
        height:"45%",
        width:"100%",
        justifyContent:"center",
        alignItems:"center"
    },
    box: {
        height: "100%",
        width: "60%"
    },
    difficulty: {
        height:"20%",
        width:"95%",
        borderRadius:10,
        backgroundColor:"#f8a5a7",
        marginVertical:"2.5%",
        shadowColor: '#000',  
        shadowOffset: { width: 0, height: 2 },  
        shadowOpacity: 0.6,  
        shadowRadius: 4,  
        flexDirection:"column",
        justifyContent:"space-between",
        padding:"2%",
        justifyContent:"center",
        alignItems:"center"
    },
    difficultyView: {
        width:"55%",
        height:"100%",
        borderRadius:10,
        backgroundColor:"white",
        alignItems:"center",
        padding:"2%"
    },
    play:{
        height:"18%",
        width:"95%",
        backgroundColor:"#f8a5a7",
        shadowColor: '#000',  
        shadowOffset: { width: 0, height: 2 },  
        shadowOpacity: 0.6,  
        shadowRadius: 4,  
        borderRadius:10,
        justifyContent:"center",
        alignItems:"center"
    }
})

export default SudokuEntry