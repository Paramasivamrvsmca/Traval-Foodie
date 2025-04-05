import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Updated import

const OrderScreen = ({ route, navigation }) => {
  const { item } = route.params || {}; // Safe check for route.params
  const [accessToken, setAccessToken] = useState(null); // State to hold the access token
  const [quantity, setQuantity] = useState(1); // State to hold selected quantity
  const [totalPrice, setTotalPrice] = useState(item.price * 83); // State to hold total price

  // Effect to retrieve access token from AsyncStorage
  useEffect(() => {
    const getToken = async () => {0
      const token = await AsyncStorage.getItem('accessToken');
      console.log("Retrieved Token:", token);
      setAccessToken(token); // Set the token in state
    };
    
    getToken();
  }, []);

  // Update the total price whenever quantity changes
  useEffect(() => {
    if (item) {
      const updatedPrice = item.price * 83 * quantity; // Calculate the total price based on quantity
      setTotalPrice(updatedPrice);
    }
  }, [quantity, item]);

  const handleOrder = async () => {
    if (!accessToken) {
      alert('No access token found. Please log in again.');
      return;
    }

    // Prepare order data
    const orderData = {
      title: item.title,
      price: totalPrice, // Send the total price
      image: item.image,
      type: item.category,
    };

    try {
      // Send order data to the backend
      const response = await fetch('http://192.168.228.68:8000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Use retrieved token
        },
        body: JSON.stringify({
          orderData: orderData,
          quantity: quantity, // Send selected quantity
        }),
      });

      if (response.ok) {
        alert('Order placed successfully!');
        navigation.navigate('Cart'); // Navigate back to the cart
      } else {
        const errorData = await response.json(); // Get error data for more info
        alert('Failed to place order: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No item data available. Please try again.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      
      {/* Handle both local and remote images */}
      {typeof item.image === 'number' ? (
        <Image source={item.image} style={styles.image} /> 
      ) : (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      {/* Dropdown to select quantity */}
      <Text style={styles.label}>Select Quantity:</Text>
      <Picker
        selectedValue={quantity}
        style={styles.picker}
        onValueChange={(value) => setQuantity(value)} // Update quantity
      >
        {[1, 2, 3, 4, 5].map(qty => (
          <Picker.Item key={qty} label={qty.toString()} value={qty} />
        ))}
      </Picker>

      {/* Display updated price based on quantity */}
      <Text style={styles.price}>Price: ₹{totalPrice.toFixed(2)}</Text>

      <Button title="Confirm Order" onPress={handleOrder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    backgroundColor: '#f7f7f7', // Light background color for better contrast
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333', // Darker text color for better readability
    marginBottom: 20,
    textAlign: 'center', // Center the title text
  },
  image: {
    width: 220,
    height: 160,
    borderRadius: 12, // Slightly larger border radius
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#555', // Softer color for label
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: 200,
    backgroundColor: '#fff', // Background color to make the picker stand out
    borderRadius: 8, // Rounded corners
    marginBottom: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: '600', // Slightly bolder text for the price
    color: '#1E90FF', // Use a highlight color for the price (blue in this case)
    marginBottom: 20,
  },
});

export default OrderScreen;
