import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, SafeAreaView, Dimensions, Image } from 'react-native';
import { useFonts } from 'expo-font';
import Header from '../components/header';

const articles = [
  {
    id: '1',
    title: 'Tips for Cognitive Health',
    url: 'https://www.nia.nih.gov/health/cognitive-health-and-older-adults',
    readingTime: '8 min',
    source: 'National Institute on Aging',
  },
  {
    id: '2',
    title: 'Understanding the Types of Memory',
    url: 'https://www.alzheimers.org.uk/get-support/staying-independent/understanding-types-memory',
    readingTime: '7 min',
    source: 'Alzheimer\'s Society UK',
  },
  {
    id: '3',
    title: 'How to Keep Your Brain Healthy',
    url: 'https://www.uhc.com/news-articles/healthy-living/brain-health',
    readingTime: '6 min',
    source: 'UnitedHealthcare',
  },
  {
    id: '4',
    title: 'How your Brain Works',
    url: 'https://www.mayoclinic.org/diseases-conditions/epilepsy/in-depth/brain/art-20546821',
    readingTime: '7 min',
    source: 'Mayo Clinic',
  },
  {
    id: '5',
    title: 'Understanding Memory Loss',
    url: 'https://my.clevelandclinic.org/health/symptoms/11826-memory-loss',
    readingTime: '20 min',   
    source: 'Cleveland Clinic',
  },
  {
    id:'6',
    title:'12 Ways to Keep your Brain Young',
    url:'https://www.health.harvard.edu/mind-and-mood/12-ways-to-keep-your-brain-young',
    readingTime:'8 min',
    source: 'Harvard Health'
  }
];

const { width, height } = Dimensions.get('window');
const isLargeScreen = width >= 768; 

const Learn = ({ navigation }) => {
  const openArticle = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.articleItem} onPress={() => openArticle(item.url)}>
      <Text style={styles.articleTitle}>{item.title}</Text>
      <View style={styles.articleInfo}>
        <Text style={styles.articleSource}>{item.source}</Text>
        <Text style={styles.articleReadingTime}>{item.readingTime} read</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Learn" handleGoHome={() => navigation.navigate('Home')} />
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <View style={{height: isLargeScreen? height * 0.28:height * 0.22, width: "100%", flexDirection:"row", justifyContent:"space-around", alignItems:"center",}}>
        <View style={{height:"90%", width:"55%", backgroundColor:"#FF6F61", borderRadius:"10%", padding:10, justifyContent:"center", alignContent:"center", borderWidth:3}}><Text style={{fontSize:isLargeScreen?"40%":"20%", fontFamily:"Cabin-Medium", textAlign:"center"}}>Learning about your brain is just as important as keeping it strong!</Text></View>
        <Image
        source={require("../assets/boyTwo.png")}
        style={styles.image}
        resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E9',
  },
  image: {
    height:"100%",
    width:width*0.4,
},
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  articleItem: {
    backgroundColor: '#FDA758',
    padding: isLargeScreen?20:15,
    borderRadius: 10,
    marginVertical: isLargeScreen?8:4,
  },
  articleTitle: {
    fontSize: "18%",
    fontFamily: 'Cabin-Medium',
    color: '#FFFFFF',
  },
  articleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  articleSource: {
    fontSize: 14,
    fontFamily: 'Cabin-Medium',
    color: '#FFFFFF',
  },
  articleReadingTime: {
    fontSize: 14,
    fontFamily: 'Cabin-Medium',
    color: '#FFFFFF',
  },
});

export default Learn;
