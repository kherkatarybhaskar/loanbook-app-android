import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import myImage from '../assets/loanbook.png'; // Adjust the path to your image file

const AllCustomers = () => {
  const navigation = useNavigation(); // Initialize navigation
  return (
    <View style={styles.container}>
      {/* Add two buttons: Depositor and Borrower */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Depositor')}>
          <Text style={styles.buttonText}>Depositor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Loans')}>
          <Text style={styles.buttonText}>Loans</Text>
        </TouchableOpacity>
      </View>

      {/* Add the image below the buttons */}
      <Image source={myImage} style={styles.image}/>

    </View>
  );
};

export default AllCustomers;

// Add your styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row', // Arrange buttons in a row
    justifyContent: 'space-between',
    // marginBottom: 20,
  },
  button: {
    flex: 0.48, // Take 48% of the width for each button to create space between them
    backgroundColor: '#021C55',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '35%', // Set width to 100% of the container
    height: undefined, // Set height to undefined to maintain aspect ratio
    aspectRatio: 1, // Set aspect ratio to keep it square (or change this to maintain a different aspect ratio)
    alignSelf: 'center', // Center the image
  },
});
