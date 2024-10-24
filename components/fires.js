import { View, Text, TouchableOpacity, FlatList, Modal,StyleSheet, SafeAreaView, Image } from 'react-native';

const Fires = ({ numFires }) => {
    let content = [];
    for (let i = 0; i < Math.min(7, numFires); i++) {
        content.push(
            <Image
                key={i}
                source={require('../assets/fire.png')} 
                style={{ width: 40, height: 40, resizeMode: "contain", margin: 2 }}
            />
        );
    }

    const calculateFontSize = (number) => {
        if (number < 10) return 30;   
        if (number < 100) return 24;  
        return 18;                   
    };

    if (numFires > 7) {
        content.push(
            <Text key="plus" style={{ fontSize: calculateFontSize(numFires - 7), marginLeft: 5 }}>
                +{numFires - 7}
            </Text>
        );
    }

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            {content}
        </View>
    );
};

export default Fires;