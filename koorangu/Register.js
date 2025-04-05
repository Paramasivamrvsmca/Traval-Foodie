import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ImageBackground, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (firstName && lastName && email && mobileNumber && password) {
      console.log('Sending registration request with data:', {
        firstName,
        lastName,
        email,
        mobileNumber,
        password,
      });

      fetch('http://192.168.228.68:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobileNumber,
          password,
        }),
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.message || 'Registration failed.');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Registration successful:', data);
          navigation.navigate('Login');
        })
        .catch(error => {
          console.error('Error during registration:', error);
          Alert.alert('Registration Failed', `Error: ${error.message}`);
        });
    } else {
      Alert.alert('Validation Error', 'Please fill out all fields.');
    }
  };

  return (
    <ImageBackground
      source={require('./images/backgorund-img1.jpeg')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput} // Change style for the password input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Toggle the secure text entry based on the state
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
            <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <Button title="Register" onPress={handleRegister} />
        <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
          Already have an account? Login
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds a dark overlay to make text stand out
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white', // Makes the title text visible against the dark overlay
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: 'white', // Ensures inputs are visible against the background
    opacity: 0.8, // Makes inputs slightly transparent
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingRight: 40, // Add padding to the right to avoid text overlap with the icon
    paddingHorizontal: 10,
    backgroundColor: 'white',
    opacity: 0.8,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: 8, // Adjust the positioning to center the icon vertically in the input field
  },
  linkText: {
    marginTop: 10,
    textAlign: 'center',
    color: 'white', // Makes the link text visible
  },
});

export default RegisterScreen;
