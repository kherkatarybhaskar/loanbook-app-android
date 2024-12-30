import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

import { ip } from '../config'; // Import IP address from config file
import profile from '../assets/profile.png'; // Adjust the path to your image file


const Depositor = () => {
  const [customers, setCustomers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [filterAccountNumber, setFilterAccountNumber] = useState(''); // State for filter inputs
  const [filterCustomerName, setFilterCustomerName] = useState(''); // State for filter inputs
  const [filterArea, setFilterArea] = useState('');
  const [filterHandler, setFilterHandler] = useState('');

  const screenWidth = Dimensions.get('window').width; // Get the screen width
  const navigation = useNavigation(); // Get the navigation object

  // Fetch depositors function
  const fetchDepositors = async () => {
    try {
      const response = await fetch(`${ip}/api/customers/depositors`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching depositors:', error);
    }
  };

    const fetchfilteredDepositors = async (filters) => {
        const { accountNumber, customerName, area, handler } = filters;

        // Create an object to hold the query parameters
        const params = new URLSearchParams();

        if (accountNumber && accountNumber.trim() !== '') {
            params.append('accountNumber', accountNumber.trim());
        }
        if (customerName && customerName.trim() !== '') {
            params.append('customerName', customerName.trim());
        }
        if (area && area.trim() !== '') {
            params.append('area', area.trim());
        }
        if (handler && handler.trim() !== '') {
            params.append('handler', handler.trim());
        }

        try {
            const response = await fetch(`${ip}/api/customers/depositors/filtered?${params.toString()}`);
            // const response = await fetch(`http://${ip}:5000/api/customers/depositors/filtered?${params.toString()}`);
            const data = await response.json();
            // console.log(data); // Log the response data
            setCustomers(data);

        } catch (error) {
            console.error('Error fetching filtered depositors:', error);
        }
    };


  // Fetch all depositors when the component first mounts
  useEffect(() => {
    fetchDepositors();
  }, []);

  // Reload depositors every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDepositors(); // Re-fetch depositors whenever the screen is focused
    }, [])
  );

  // Render each depositor in a card format
  const renderCustomerCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { width: screenWidth / 3 - 20 }]}
        onPress={() => {
          // Navigate to Deposit component with customerName and accountNo as params
          navigation.navigate('Deposit', {
            customerName: item.customerName,
            accountNumber: item.accountNumber,
            handler: item.handler,
            phoneNo: item.phoneNo,
            address: item.area,
            issueDate: item.issueDate
          });
        }}
      >
        {item.customerImage === 'none' ? (
            <Image source={profile} style={styles.image} />
        ) : (
            <Image source={{ uri: item.customerImage }} style={styles.image} />
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.accountNumber}>Account Number: {item.accountNumber}</Text>
          <Text style={styles.accountNumber}>Area: {item.area}</Text>
          <Text style={styles.accountNumber}>Agent: {item.handler}</Text>
          <Text style={styles.accountNumber}>Issue Date: {item.issueDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Handle filter submit
  const handleFilterSubmit = () => {
    // Create an object to hold the filter criteria
    const filters = {
        accountNumber: filterAccountNumber,
        customerName: filterCustomerName,
        area: filterArea,
        handler: filterHandler,
    };

    // Fetch depositors with the filters
    fetchfilteredDepositors(filters);

    // Close modal
    setModalVisible(false);
  };


  const renderInputFields = () => {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="Account Number"
          value={filterAccountNumber}
          onChangeText={setFilterAccountNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Customer Name"
          value={filterCustomerName}
          onChangeText={setFilterCustomerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={filterArea}
          onChangeText={setFilterArea}
        />
        <TextInput
          style={styles.input}
          placeholder="Agent"
          value={filterHandler}
          onChangeText={setFilterHandler}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)} // Open the filter modal
      >
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

      {/* FlatList to display customers */}
      <FlatList
        data={customers}
        renderItem={renderCustomerCard}
        keyExtractor={(item) => item._id} // Assuming _id is the unique identifier from MongoDB
        contentContainerStyle={styles.listContainer}
        numColumns={3} // Fixed number of columns
        key={customers.length} // Use length of customers array as key to force re-render
      />

      {/* Modal for Filters */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close modal on back button press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Customers</Text>

            {renderInputFields()}

            <View style={styles.buttonContainer}>
              <Button title="Submit" onPress={handleFilterSubmit} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Depositor;

// Add your styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    backgroundColor: '#021C55',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 50,
  },
  card: {
    margin: 5,
    borderRadius: 10,
    borderColor: '#021C55',
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#F0F0F0',
    flexDirection: 'row', // Arrange children in a row
    alignItems: 'center', // Center contents vertically
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10, // Space between image and text
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#ccc', // Placeholder color
    marginRight: 10, // Space between image and text
  },
  infoContainer: {
    flex: 1, // Take up remaining space
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountNumber: {
    fontSize: 16,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
