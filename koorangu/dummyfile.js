import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const OrderScreen = ({ route, navigation }) => {
  const { item } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(item.price);

  useEffect(() => {
    console.log('Item data:', item);
    if (item && item.price) {
      setTotalPrice(item.price * quantity);
    }
  }, [item, quantity]);

  if (!item || !item.title || !item.price || (!item.image && !item.imagePlaceholder)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid item data. Please go back and try again.</Text>
      </View>
    );
  }

  const placeOrder = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log("Retrieved Token:", token);
  
      if (!token) {
        Alert.alert('Error', 'No access token found. Please log in again.');
        return;
      }
  
      // Create form data to send image as file
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('price', totalPrice);
      formData.append('quantity', quantity);
      formData.append('type', item.category || 'food');
  
      // If image is a local file (require), we need to attach it as a file in the form data
      if (typeof item.image === 'string' && item.image.trim() !== '') {
        formData.append('image', {
          uri: item.image,
          type: 'image/jpeg', // adjust according to your image type
          name: 'order-image.jpg',
        });
      } else {
        formData.append('image', 'default-image-url');  // If it's a URL, just send the URL
      }
  
      console.log('Form Data:', formData);
  
      const response = await axios.post('http://192.168.228.68:8000/orders', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',  // Ensure multipart/form-data is set for file uploads
        },
      });
  
      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Order placed successfully!');
        navigation.navigate('Cart');
      } else {
        Alert.alert('Failed', 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        Alert.alert('Error', error.response.data.message || 'An error occurred.');
      } else if (error.request) {
        console.error('Request data:', error.request);
        Alert.alert('Error', 'No response received from the server.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', 'An error occurred while placing the order.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      {item.image && typeof item.image === 'string' ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <Image source={require('./images/foods/food2.jpg')} style={styles.image} />
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>Unit Price: ${item.price.toFixed(2)}</Text>
      <Text style={styles.price}>Total Price: ${totalPrice.toFixed(2)}</Text>

      <Picker
        selectedValue={quantity}
        style={styles.picker}
        onValueChange={(itemValue) => setQuantity(itemValue)}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <Picker.Item key={num} label={`Quantity: ${num}`} value={num} />
        ))}
      </Picker>

      <Button title={loading ? 'Placing Order...' : 'Place Order'} onPress={placeOrder} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '80%',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OrderScreen;