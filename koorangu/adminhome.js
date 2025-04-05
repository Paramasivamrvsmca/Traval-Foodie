import React from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AdminHome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('OrderDetails')}
      >
        <Text style={styles.buttonText}>View Orders</Text>
      </TouchableOpacity>

      {/* Uncomment these buttons for future features
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('ManageMenu')}
      >
        <Text style={styles.buttonText}>Manage Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.buttonText}>View/Edit Cart</Text>
      </TouchableOpacity>
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#deb887', // Light background color for better contrast
    padding: 20,
  },
  title: {
    fontSize: 28, // Larger font size for emphasis
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30, // Added space below title
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50', // Green button color for positive action
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20, // Space between buttons
    width: '80%', // Button width takes most of the screen for better mobile experience
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // White text for contrast
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AdminHome;
