import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, Button, StyleSheet, Alert, Linking, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import default image and UPI QR code
import defaultImage from './images/food2.jpeg'; // Update this path
import upiQrCode from './images/qr.jpg'; // Update this path

const CartScreen = ({ navigation }) => {  // navigation prop added
  const [cartItems, setCartItems] = useState([]);
  const [showQrCode, setShowQrCode] = useState(false); // State to manage QR code visibility

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to view your cart.');
        return;
      }

      const response = await axios.get('http://192.168.228.68:8000/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        Alert.alert('Error', 'Unexpected data format received.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch cart items. Please try again later.');
    }
  };

  const removeItemFromCart = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to remove items from your cart.');
        return;
      }

      await axios.delete(`http://192.168.228.68:8000/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Success', 'Item removed from cart.');
      fetchCartItems(); // Refresh cart after removal
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
    }
  };

  const getImageSource = (imagePath) => {
    return defaultImage; // Always return the default image for now
  };

  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item?.item?.price || 0), 0) * 100; // Convert to paise
  };

  const handlePayment = async () => {
    try {
      const amount = calculateTotalAmount();
      const response = await axios.post('http://192.168.112.212:8000/create-order', { amount });
      const { paymentUrl } = response.data;

      if (!paymentUrl) {
        Alert.alert('Error', 'Failed to initiate payment. Please try again.');
        return;
      }

      Linking.openURL(paymentUrl).catch((err) => {
        Alert.alert('Error', 'Failed to open payment gateway. Please try again.');
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    }
  };

  const toggleQrCodeVisibility = () => {
    setShowQrCode((prev) => !prev); // Toggle the visibility state
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      
      {/* Home and Menu navigation buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}  // Navigate to Home screen
        >
          <Text style={styles.navButtonText}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Menu')}  // Navigate to Menu screen
        >
          <Text style={styles.navButtonText}>Go to Menu</Text>
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item, index) => (item?._id ? item._id.toString() : index.toString())}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image
                source={getImageSource(item?.item?.image)}
                style={styles.image}
                onError={() => console.error('Error loading image:', item?.item?.image)}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item?.item?.title || 'No Title Available'}</Text>
                <Text style={styles.itemPrice}>₹{item?.item?.price || 'N/A'}</Text>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeItemFromCart(item?._id)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      {cartItems.length > 0 && (
        <View style={styles.paymentContainer}>
          <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
            <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrButton} onPress={toggleQrCodeVisibility}>
            <Text style={styles.qrButtonText}>{showQrCode ? 'Hide QR Code' : 'Show QR Code'}</Text>
          </TouchableOpacity>
          {showQrCode && (
            <>
              <Text style={styles.qrTitle}>Pay using UPI</Text>
              <Image source={upiQrCode} style={styles.qrImage} />
              <Text style={styles.qrText}>Scan this QR code with your UPI app to make the payment.</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#343a40',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6c757d',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#343a40',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  paymentContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  paymentButton: {
    width: '80%',
    paddingVertical: 12,
    backgroundColor: '#28a745',
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrButton: {
    width: '80%',
    paddingVertical: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 10,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  qrTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#343a40',
  },
  qrImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default CartScreen;
