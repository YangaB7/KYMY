import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const fontSize = width * 0.08; 

const Header = ({ title, handleGoHome }) => {

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); 
        if (handleGoHome) {
            handleGoHome(); 
        }
    };
  return (
    <View style={styles.header}>
        <View>
            <Text 
            style={styles.headerText}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            >{title}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}onPress={handlePress}>
            <Image source={require("../assets/home.png")} style={{width:50,height:50}} resizeMode="contain"/>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 5,
        paddingHorizontal: "5%",
        borderBottomColor: "#FDA758",
        justifyContent: 'space-between', 
        alignItems: 'center',
        height:"10%",
        width:"100%",
        flexDirection: "row"
    },
    headerButton: {
        borderRadius:100, 
        backgroundColor:"#FDA758",
        padding:"1.5%"

    },
    headerText: {
        fontFamily:"Cabin-Medium",
        fontSize: fontSize,
        fontWeight:"bold",
        textAlign:"center",
    },
});
export default Header;