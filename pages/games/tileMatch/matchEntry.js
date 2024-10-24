import React, { useState } from 'react';
import { View, Text, TouchableOpacity,StyleSheet, SafeAreaView, Image } from 'react-native';
import Header from '../../../components/header';



const TileEntry = ({navigation}) => {

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
            <Header title={"TILE MATCH"} handleGoHome={() => navigation.navigate("Home")}/>
            <View style={styles.display}>
                <Image source={require("../../../assets/tilematch.png")} style={{width:"120%", height:"120%"}} resizeMode='contain'/>
            </View>
            <View style={styles.difficulty}>
                <Text style={{fontSize:30, fontWeight:"bold"}}>Set Difficulty</Text>
                <View style={{flexDirection:"row", height:"70%", alignItems:"center"}}>
                    <TouchableOpacity onPress={()=> handlePress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:50,height:50, transform:[{scaleX:-1}]}} resizeMode="contain"/>
                    </TouchableOpacity>
                    <View style={styles.difficultyView}>
                        <Text>Current Difficulty:</Text>
                        <View style={{height:"95%", justifyContent:"center"}}>
                            <Text style={{ fontFamily:'Cabin-Medium', fontSize:50}}>{difficulty}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={()=> handlePress()}>
                        <Image source={require("../../../assets/arrow.png")} style={{width:50,height:50}} resizeMode="contain"/>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.play} onPress={()=> navigation.navigate("TileMatch", {setting: difficulty})}>
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
        justifyContent: "space-between",
        alignItems:"center"
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

export default TileEntry