import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet, FlatList } from 'react-native';

// Food items categorized by type
const foodItems = [
  { title: 'Pizza', image: require('./images/foods/pizza.jpg'), category: 'Food', price: 830.00 },
  { title: 'Burger', image: require('./images/foods/burger.jpg'), category: 'Food', price: 664.00 },
  { title: 'Pasta', image: require('./images/foods/pasta.jpg'), category: 'Food', price: 788.50 },
  { title: 'Water Bottle', image: require('./images/foods/water-bottle.jpg'), category: 'Drinks', price: 124.50 },
  { title: 'Coca-Cola', image: require('./images/foods/coco-cola.jpg'), category: 'Drinks', price: 145.25 },
  { title: 'Pepsi', image: require('./images/foods/pepsi.jpg'), category: 'Drinks', price: 145.25 },
  { title: 'Fries', image: require('./images/foods/fries.jpg'), category: 'Snacks', price: 207.50 },
  { title: 'Onion Rings', image: require('./images/foods/onion-rings.jpg'), category: 'Snacks', price: 249.00 },
  { title: 'Salad', image: require('./images/foods/salad.jpg'), category: 'Food', price: 581.00 },
  { title: 'Noodles', image: require('./images/foods/noodles.jpg'), category: 'Food', price: 539.50 },
  { title: 'Grilled Chicken', image: require('./images/foods/grilled-chicken.jpg'), category: 'Food', price: 913.00 },
  { title: 'Ice Cream', image: require('./images/foods/ice-cream.jpg'), category: 'Desserts', price: 332.00 },
  { title: 'Brownie', image: require('./images/foods/brownie.jpg'), category: 'Desserts', price: 290.50 },
  { title: 'Lemonade', image: require('./images/foods/lemonade.jpg'), category: 'Drinks', price: 166.00 },
  { title: 'Sprite', image: require('./images/foods/sprite.jpg'), category: 'Drinks', price: 145.25 },
  { title: 'Tacos', image: require('./images/foods/tacos.jpg'), category: 'Desserts', price: 290.50 },
  { title: 'Sandwich', image: require('./images/foods/sandwich.jpg'), category: 'Food', price: 415.00 },
  { title: 'Hot Dog', image: require('./images/foods/hot-dog.jpg'), category: 'Food', price: 373.50 },
  { title: 'Sushi', image: require('./images/foods/sushi.jpg'), category: 'Desserts', price: 664.00 },
  { title: 'Muffin', image: require('./images/foods/muffin.jpg'), category: 'Snacks', price: 207.50 },
];

// Function to format the price in INR currency format
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
};

// MenuScreen Component
const MenuScreen = ({ navigation, route }) => {
  const { category } = route.params || {}; // Fallback to avoid undefined error

  // Filter food items based on selected category or show all items if no category
  const filteredItems = category ? foodItems.filter(item => item.category === category) : foodItems;

  // Render each food item as a touchable card
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Orders', { item })} // Ensure 'Orders' matches the defined screen name
      style={styles.itemContainer}
    >
      <Image source={item.image} style={styles.image} />
      <Text style={styles.text}>{item.title}</Text>
      <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{category ? category : 'All Foods'}</Text>
      {filteredItems.length === 0 ? ( // Check if there are no items for the selected category
        <Text style={styles.noItemsText}>No items available in this category.</Text>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer} // Add padding to FlatList items
        />
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffe4c4',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 15,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 180,
    height: 130,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  priceText: {
    fontSize: 16,
    color: '#FF6347',
    marginTop: 5,
  },
  noItemsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20, // Add padding at the bottom to avoid cutoff items
  },
});

export default MenuScreen;
