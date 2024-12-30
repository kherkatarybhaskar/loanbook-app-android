import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AllCustomers from './screens/AllCustomers';
import CustomersInfo from './screens/CustomersInfo';
import AddCustomer from './screens/AddCustomer';  // Import the AddCustomer screen
import Depositor from './screens/Depositor';
import Loans from './screens/Loans';
import Deposit from './screens/Deposit';
import Installments from './screens/Installments';
import AddLoan from './screens/AddLoan';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AllCustomers" 
        component={AllCustomers} 
        options={{ 
          title: 'All Customers', 
          headerShown: true, 
          statusBarColor: '#021C55',
          // headerRight: () => (
          //   <Button
          //     onPress={() => navigation.navigate('AddCustomer')}  // Navigate to AddCustomer screen
          //     title="Add Customer"
          //     color="#021C55"
          //   />
          // ),
        }} 
      />
      <Stack.Screen 
        name="CustomersInfo" 
        component={CustomersInfo} 
        options={{ 
          title: 'Customers Info', 
          headerShown: true, 
          statusBarColor: '#021C55' 
        }} 
      />
      <Stack.Screen 
        name="AddCustomer"  // Add the AddCustomer screen to the stack
        component={AddCustomer} 
        options={{ 
          title: 'Add Customer', 
          headerShown: true, 
          statusBarColor: '#021C55' ,
        }} 
      />
      <Stack.Screen 
        name="AddLoan"  // Add the AddCustomer screen to the stack
        component={AddLoan} 
        options={{ 
          title: 'Add Loan', 
          headerShown: true, 
          statusBarColor: '#021C55' ,
        }} 
      />
      <Stack.Screen 
        name="Depositor"  // Add the AddCustomer screen to the stack
        component={Depositor} 
        options={{ 
          title: 'Depositor', 
          headerShown: true, 
          statusBarColor: '#021C55' ,
          headerRight: () => (
            <Button
              onPress={() => navigation.navigate('AddCustomer')}  // Navigate to AddCustomer screen
              title="Add Depositor"
              color="#021C55"
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="Loans"  // Add the AddCustomer screen to the stack
        component={Loans} 
        options={{ 
          title: 'Loans', 
          headerShown: true, 
          statusBarColor: '#021C55' ,
          headerRight: () => (
            <Button
              onPress={() => navigation.navigate('AddLoan')}  // Navigate to AddCustomer screen
              title="Add Loan"
              color="#021C55"
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="Deposit"  // Add the AddCustomer screen to the stack
        component={Deposit} 
        options={{ 
          title: 'Deposit', 
          headerShown: true, 
          statusBarColor: '#021C55' 
        }} 
      />
      <Stack.Screen 
        name="Installments"  // Add the AddCustomer screen to the stack
        component={Installments} 
        options={{ 
          title: 'Installments', 
          headerShown: true, 
          statusBarColor: '#021C55' 
        }} 
      />
    </Stack.Navigator>
  );
}

function App() {
  return (
    // <SafeAreaView>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Loan Book" 
            component={HomeScreen} 
            options={{ 
              title: 'Welcome', 
              headerShown: false, 
              statusBarColor: '#021C55' 
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;


//Build command "eas build --profile preview --platform android"