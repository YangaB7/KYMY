import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';

const ExitModal = ({ canSee, closeModal, handleGoHome}) => {
        
    const [fontsLoaded] = useFonts({
        'Cabin-Medium': require('../assets/fonts/Cabin-Medium.ttf'),
    });
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={canSee}
        >
            <View style={styles.overlay}>
                <View style={styles.center}>
                    <Text style={styles.text}>If you leave this page, your progress will not be saved...</Text>
                    <TouchableOpacity onPress={handleGoHome} style={styles.option}>
                        <Text style={styles.buttonText}>Return Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeModal} style={styles.option}>
                        <Text style={styles.buttonText}>Continue Playing</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    option: {
        justifyContent:"center",
        borderRadius:5,
        backgroundColor:'turquoise',
        paddingTop:10,
        paddingBottom:4,
        margin:5,
        paddingHorizontal:7,
    },
    center: {
        width: "70%",
        padding: 20,
        backgroundColor: "#FDA758",
        alignItems: "center",
        borderRadius: 10,
    },
    text: {
        color: 'white',
        marginBottom: 20,
        fontWeight:"bold",
        fontFamily:"Cabin-Medium",
        fontSize:20,
        textAlign: 'center',
    },
    buttonText: {
        color:"white",
        fontSize:24,
        fontFamily:"Cabin-Medium",
        fontWeight:"bold",
        textAlign: 'center',
    }
});

export default ExitModal;
