import {Animated, View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Touchable, Image} from 'react-native';
import {useState, useEffect} from 'react';
import Header from '../../../components/header';

const SlideEntry = ({navigation}) => {

    const [difficulty, setDifficulty] = useState("Easy");

    function handlePress() {
        diff = JSON.parse(JSON.stringify(difficulty))
        if(diff == "Easy") {
            setDifficulty("Hard")
        }
        else(
            setDifficulty("Easy")
        )
    }

    return (
        <SafeAreaView style={styles.BG}>
            <Header title={"SLIDE PUZZLE"} handleGoHome={() => navigation.navigate("Home")} />
            <View style={styles.display}>
                <Image source={require("../../../assets/slidePuzzle.png")} style={{width:"80%", height:"80%"}} resizeMode='contain'/>
            </View>
            <View style={styles.difficulty}>
                <Text style={{fontSize:30, fontWeight:"bold", fontFamily:"Cabin-Medium"}}>Set Difficulty</Text>
                <View style={{flexDirection:"row", height:"70%", alignItems:"center"}}>
                    <TouchableOpacity onPress={()=> handlePress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:60,height:60, transform:[{scaleX:-1}]}} resizeMode="contain"/>
                    </TouchableOpacity>
                    <View style={styles.difficultyView}>
                        <Text style={{fontFamily:'Cabin-Medium', fontSize:"20%"}}>Current Difficulty:</Text>
                        <View style={{height:"70%", justifyContent:"center"}}>
                            <Text style={{ fontFamily:'Cabin-Medium', fontSize:"55%", fontFamily:"Cabin-Medium"}}>{difficulty}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={()=> handlePress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:60,height:60}} resizeMode="contain"/>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.play} onPress={()=> navigation.navigate("SlidePuzzle", {setting: difficulty})}>
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
        justifyContent:"space-around"
    },
    display: {
        height:"40%",
        width:"100%",
        justifyContent:"center",
        alignItems:"center"
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

export default SlideEntry