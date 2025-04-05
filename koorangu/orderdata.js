import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Function to format the price in INR currency format
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
};

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to view your orders.');
        return;
      }
      const response = await axios.get('http://192.168.228.68:8000/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });+

      console.log('Order items response:', response.data);

      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.error('Expected an array of orders but received:', response.data);
        Alert.alert('Error', 'Unexpected data format received.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching orders: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Details</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.userId.toString()} // Ensure unique key with toString()
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.userText}>User: {item.name}</Text>
            <Text style={styles.ordersText}>Orders:</Text>
            {item.orders.map((orderItem, index) => (
              <View key={index} style={styles.cartItem}>
                <Text style={styles.itemText}>Item: {orderItem.item.title}</Text>
                <Text style={styles.priceText}>Price: {formatPrice(orderItem.item.price)}</Text>
                <Text style={styles.quantityText}>Quantity: {orderItem.quantity}</Text>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.listContainer} // Padding around the list
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(189, 97, 22)',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  orderItem: {
    padding: 15,
    backgroundColor: '#f4f4f4',
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cartItem: {
    backgroundColor: '#eaeaea',
    padding: 10,
    marginTop: 8,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  userText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  ordersText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  priceText: {
    fontSize: 16,
    color: '#FF6347',
  },
  quantityText: {
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20, // Padding at the bottom to avoid cutoff
  },
});

export default OrderDetails;
