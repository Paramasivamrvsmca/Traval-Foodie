import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importing screens
import HomeScreen from './home';          
import LoginScreen from './Login';        
import RegisterScreen from './Register';  
import MenuScreen from './menu';          
import OrdersScreen from './order';       
import CartScreen from './carts';         
import AdminHome from './adminhome';      
import OrderDetails from './orderdata';   

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF5F6D',  // Change header background color
          },
          headerTintColor: '#fff',        // Text color for header
          headerTitleStyle: {
            fontWeight: 'bold',           // Customize header title style
          },
        }}
      >
        {/* Home Screen */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />

        {/* Login Screen */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        {/* Register Screen */}
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        {/* Menu Screen */}
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ title: 'Menu' }} 
        />

        {/* Orders Screen */}
        <Stack.Screen 
          name="Orders" 
          component={OrdersScreen} 
          options={{ title: 'Your Orders' }} 
        />

        {/* Cart Screen */}
        <Stack.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ title: 'Cart' }} 
        />

        {/* Admin Dashboard */}
        <Stack.Screen 
          name="AdminHome" 
          component={AdminHome} 
          options={{ title: 'Admin Dashboard' }} 
        />

        {/* Order Details Screen */}
        <Stack.Screen 
          name="OrderDetails" 
          component={OrderDetails} 
          options={{ title: 'Order Details' }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
