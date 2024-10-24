import {Animated, View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Touchable, Image} from 'react-native';
import {useState, useEffect} from 'react';
import Header from '../../../components/header';
import GameRepresentation from '../../../components/gameRep';

const colors = {
    background: "#FFF3E9",
    primary: "#f8a5a7",
    secondary: "#FFD700",
    text: "#333333",
    white: "#FFFFFF"
  };


const OrderEntry = ({navigation}) => {
    
    const [difficulty, setDifficulty] = useState("Easy");
    
    function handleRightPress() {
        switch(difficulty) {
            case "Easy":
                setDifficulty("Medium");
                break;
            case "Medium":
                setDifficulty("Hard");
                break;
            case "Hard":
                setDifficulty("Easy");
                break;
        }
    }

    function handleLeftPress() {
        switch(difficulty) {
            case "Easy":
                setDifficulty("Hard");
                break;
            case "Medium":
                setDifficulty("Easy");
                break;
            case "Hard":
                setDifficulty("Medium");
                break;
        }
    }


    return (
        <SafeAreaView style={styles.BG}>
            <Header title={"COLOR SEQUENCE"} handleGoHome={() => navigation.navigate("Home")} />
            <View style={styles.display}>
                <GameRepresentation/>
            </View>
            <View style={styles.difficulty}>
                <Text style={{fontSize:30, fontWeight:"bold", color:"white",fontFamily:"Cabin-Medium"}}>Set Difficulty</Text>
                <View style={{flexDirection:"row", height:"70%", alignItems:"center"}}>
                    <TouchableOpacity onPress={()=> handleLeftPress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:60,height:60, transform:[{scaleX:-1}]}} resizeMode="contain"/>
                    </TouchableOpacity>
                    <View style={styles.difficultyView}>
                        <Text style={{fontFamily:"Cabin-Medium", fontSize:"20%"}}>Current Difficulty:</Text>
                        <View style={{height:"75%", justifyContent:"center"}}>
                            <Text style={{ fontFamily:'Cabin-Medium', fontSize:"50%"}}>{difficulty}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={()=> handleRightPress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:60,height:60}} resizeMode="contain"/>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.playButton} onPress={()=> navigation.navigate("OrderGame", {setting: difficulty})}>
                <Text style={styles.playButtonText}>Play</Text>
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
        justifyContent:"space-evenly"
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
        marginTop:12,
        height:"40%",
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
        width:"100%",
        backgroundColor:"#f8a5a7",
        marginVertical:"2.5%",
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.6, 
        shadowRadius: 4,
        flexDirection:"column",
        justifyContent:"space-between",
        padding:"2%",
        alignItems:"center"
    },
    difficultyView: {
        width:"55%",
        height:"100%",
        borderRadius:10,
        backgroundColor:colors.background,
        alignItems:"center",
        padding:"2%"
    },
    playButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        elevation: 3,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
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
    },
    playButtonText: {
        fontFamily: 'Cabin-Medium',
        fontSize: 100,
        color: colors.white,
        fontWeight:"bold"
      },
})

export default OrderEntry