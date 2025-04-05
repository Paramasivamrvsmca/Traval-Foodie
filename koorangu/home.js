import React from 'react';
import { View, Text, Image, Button, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const foodItems = [
    { title: '', image: require('./images/foods/food4.jpg') },
    { title: '', image: require('./images/foods/food2.jpg') },
    { title: '', image: require('./images/foods/food3.jpg') },
  ];

  const categories = [
    { title: 'Food', image: require('./images/dp/foodsdp.jpg') },
    { title: 'Snacks', image: require('./images/dp/snaksdp.jpg') },
    { title: 'Desserts', image: require('./images/dp/dessertsdp.jpg') },
    { title: 'Drinks', image: require('./images/dp/drinksdp.jpg') },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF5F6D', '#FFC371']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerText}>Traval Foodie</Text>
      </LinearGradient>
      
      {/* Carousel */}
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        autoplay={true}
        autoplayTimeout={3}
        loop={true}
      >
        {foodItems.map((item, index) => (
          <View style={styles.slide} key={index}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.text}>{item.title}</Text>
          </View>
        ))}
      </Swiper>

      {/* Category Section */}
      <View style={styles.categoriesWrapper}>
        {categories.map((category, index) => (
         <TouchableOpacity
         key={index}
         style={styles.categoryCard}
         onPress={() => navigation.navigate('Menu', { category: category.title })} // Pass the category
       >
         <Image source={category.image} style={styles.categoryImage} />
         <Text style={styles.categoryText}>{category.title}</Text>
       </TouchableOpacity>
       
        ))}
         {/* Cart Icon */}
      <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartIcon}>
        <Icon name="cart" size={30} color="#fff" />
      </TouchableOpacity>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navBarText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.navBarText}>Menu</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.navBarText}>Orders</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffe4c4',
  },
  header: {
    width: '100%',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginTop:'15%'
  },
  wrapper: {
    height: 250,
    marginBottom: 20,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:'10%'
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 10,
  },
  image: {
    width: width * 0.9,
    height: 200,
    borderRadius: 10,
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 11,
  marginTop :'10%'
    
    
  },
  categoryCard: {
    width: width * 0.45,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop :'-10%'

  },
  categoryImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navBarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5F6D',
  },
  cartIcon: {
    position: 'absolute', // Position it to your desired location
    top: '-114%', // Adjust as needed
    right: 20, // Adjust as needed
  },
});

export default HomeScreen;
