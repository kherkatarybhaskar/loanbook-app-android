import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { ip } from '../config'; // Import IP address from config file
import Ionicons from '@expo/vector-icons/Ionicons';

const formatDateToIST = (date) => {
    let now = new Date(date);
    
    // Get the current UTC time and add 5 hours and 30 minutes for IST
    let istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
    let istTime = new Date(now.getTime() + istOffset);
    
    let day = ("0" + istTime.getUTCDate()).slice(-2);
    let month = ("0" + (istTime.getUTCMonth() + 1)).slice(-2); // Month is zero-indexed
    let year = istTime.getUTCFullYear();

    return `${day}/${month}/${year}`;
};

const Deposit = ({ route }) => {
    const navigation = useNavigation(); // Initialize navigation

    const { customerName, accountNumber, handler, phoneNo, address, issueDate } = route.params; // Get the parameters from route
    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
    const [amount, setAmount] = useState(''); // State for amount input
    const [date, setDate] = useState(new Date()); // State for the deposit date
    const [showDatePicker, setShowDatePicker] = useState(false); // State to show date picker
    const [deposits, setDeposits] = useState([]); // State to hold fetched deposits
    const [totalBalance, setTotalBalance] = useState(0);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Confirmation modal state
    const [deleteDepositVisible, setDeleteDepositVisible] = useState(false); // Confirmation modal state

    const [customerData, setCustomerData] = useState(null); // Initialize state for storing fetched customer data
    const [editAmountModalVisible, setEditAmountModalVisible] = useState(false);
    const [editingDate, setEditingDate] = useState();
    const [editingAmount, setEditingAmount] = useState(0);
    const [editingID, setEditingID] = useState();


    // Modify fetchCustomer to save customer data to state
    const fetchCustomer = async () => {
        const params = new URLSearchParams();
        params.append('accountNumber', accountNumber.trim());        
        try {
        const response = await fetch(`${ip}/api/customers/accountNumber?${params.toString()}`);
        // const response = await fetch(`${ip}/api/customers/accountNumber/${accountNumber.trim()}`);
    
        if (response.ok) {
            const data = await response.json();
            setCustomerData(data); // Save customer data to state
        } else {
            Alert.alert('Error', 'Failed to fetch customer data');
        }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            Alert.alert('Error', 'An error occurred while fetching customer data');
        }
    };

    // Function to fetch deposits for the given account number
    const fetchDeposits = async () => {
        const params = new URLSearchParams();
        params.append('accountNumber', accountNumber.trim()); // Add accountNumber to query parameters
        
        try {
            const response = await fetch(`${ip}/api/deposit/accountNumber?${params.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                setDeposits(data); // Update the deposits state with fetched data

                // Calculate the total balance by summing all the deposit amounts
                const total = data.reduce((sum, deposit) => sum + deposit.amount, 0);
                setTotalBalance(total); // Update the totalBalance state
            } else {
                const errorResponseText = await response.text();
                const errorResponse = JSON.parse(errorResponseText);
                Alert.alert('Error', errorResponse.message || 'Failed to fetch deposits');
            }
        } catch (error) {
            console.error('Error fetching deposits:', error);
            Alert.alert('Error', 'An error occurred while fetching deposits: ' + error.message);
        }
    };
  
  useEffect(() => {
    fetchCustomer();  // Fetch customer data when the component mounts
    fetchDeposits();
  }, []); // Empty dependency array means this runs once on mount
  
  // Function to handle the deposit action
  const handleDeposit = () => {
    setModalVisible(true); // Open the modal
  };

  // Function to handle deposit form submission
  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount'); // Basic validation
      return;
    }

    const formattedDate = formatDateToIST(date); // No need to call toISOString() here
    
    // Prepare data to be sent to the server
    const depositData = {
      accountNumber: accountNumber,
      date: formattedDate,
      amount: Number(amount), // Ensure amount is a number
    };

    try {
        const response = await fetch(`${ip}/api/deposit/addDeposit`, {
    //   const response = await fetch(`http://${ip}:5000/api/deposited`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData), // Send the deposit data
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Deposit submitted:', responseData); // Log response from server
            Alert.alert('Success', 'Deposit submitted successfully!'); // Show success message

        } else {
            const errorResponseText = await response.text(); // Get the response text
            const errorResponse = JSON.parse(errorResponseText); // Parse it as JSON
            Alert.alert('Error', errorResponse.message || 'Failed to submit deposit');
        }
    } catch (error) {
        console.error('Error submitting deposit:', error);
        Alert.alert('Error', 'An error occurred while submitting the deposit: ' + error.message);
    } finally {
        // Close the modal and reset amount input
        setModalVisible(false);
        setAmount('');
        fetchDeposits();
    }
  };

  // Function to handle date change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false); // Close the date picker
    setDate(currentDate); // Set the selected date
  };

    const deleteCustomerAndDeposits = async () => {
        try {
            const response = await fetch(`${ip}/api/customers/deleteCustomerAndDepositeds`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accountNumber }), // Pass accountNumber in the body
            });

            const responseData = await response.json();

            if (response.ok) {
            Alert.alert('Success', 'Deposit deleted successfully');
            } else {
            Alert.alert('Error', responseData.message || 'Failed to delete loan');
            }
        } catch (error) {
            console.error('Error deleting loan:', error);
            Alert.alert('Error', 'An error occurred while deleting the loan');
        }
        setConfirmDeleteVisible(false); // Hide the modal after deletion
        navigation.navigate('Depositor');
    }; 


    
    const showDeleteDeposit = async (id) => {
        setDeleteDepositVisible(true); // Open the edit modal
        setEditingID(id);
    }
    const deleteDeposit = async () => {
        const params = new URLSearchParams();
        params.append('id', editingID.trim()); // Add accountNumber to query parameters
        try {
            const response = await fetch(`${ip}/api/deposit/deleteDepositById?${params.toString()}`, {
                method: 'DELETE', // Using PUT for the update operation
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log('Deposit deleted:', responseData); // Log the server response
                Alert.alert('Success', 'Deposit deleted successfully!'); // Success alert
    
                fetchDeposits(); // Refresh the deposits list
            } else {
                const errorResponseText = await response.text(); // Get the error response
                const errorResponse = JSON.parse(errorResponseText); // Parse it as JSON
                Alert.alert('Error', errorResponse.message || 'Failed to delete deposit'); // Show error message
            }
        } catch (error) {
            console.error('Error updating deposit:', error);
            Alert.alert('Error', 'An error occurred while deleting the deposit: ' + error.message); // Error alert
        } finally {
            setDeleteDepositVisible(false); // Close the edit modal after submission
            fetchDeposits();
        }
    }
    
    const showUpdateAmountForm = async (id, date, amount) => {
        setEditAmountModalVisible(true); // Open the edit modal
        setEditingID(id);
        setEditingDate(date); // Set the date to be edited
        setEditingAmount(amount); // Set the amount to be edited
    }
    const updateAmount = async () => {
        // Prepare the updated deposit data to be sent to the server
        const depositUpdateData = {
            accountNumber: accountNumber, // Account number for the deposit
            date: editingDate, // The date of the deposit
            amount: Number(editingAmount), // The updated amount (ensure it's a number)
        };
    
        const params = new URLSearchParams();
        params.append('id', editingID.trim()); // Add accountNumber to query parameters

        try {
            const response = await fetch(`${ip}/api/deposit/updateAmount?${params.toString()}`, {
                method: 'PUT', // Using PUT for the update operation
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(depositUpdateData), // Send the updated data as JSON
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log('Deposit updated:', responseData); // Log the server response
                Alert.alert('Success', 'Deposit updated successfully!'); // Success alert
    
                fetchDeposits(); // Refresh the deposits list
            } else {
                const errorResponseText = await response.text(); // Get the error response
                const errorResponse = JSON.parse(errorResponseText); // Parse it as JSON
                Alert.alert('Error', errorResponse.message || 'Failed to update deposit'); // Show error message
            }
        } catch (error) {
            console.error('Error updating deposit:', error);
            Alert.alert('Error', 'An error occurred while updating the deposit: ' + error.message); // Error alert
        } finally {
            setEditAmountModalVisible(false); // Close the edit modal after submission
        }
    };
    

    const renderDeposits = () => {
        if (!deposits || deposits.length === 0) return null; // Handle cases where deposits are not available
    
        const depositItems = deposits.map((item) => (
            <View key={item._id} style={styles.depositItem}>
                <Text style={styles.cell}>{item.date}</Text>
                <Text style={[styles.cell, item.amount >= 0 ? styles.positiveAmount : styles.negativeAmount]}>
                    {item.amount}
                </Text>
                <TouchableOpacity onPress={() => showUpdateAmountForm(item._id, item.date, item.amount)}>
                    <Ionicons name="pencil" size={22} color="green" />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => showDeleteDeposit(item._id)}>
                    <Ionicons name="trash" size={22} color="red" />
                </TouchableOpacity>
            </View>
        ));
    
        return (
            <View style={styles.tableContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerCell}>Date</Text>
                    <Text style={styles.headerCell}>Amount</Text>
                </View>
                {depositItems}
            </View>
        );
    };
    
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Deposit Information</Text>
      <View style={styles.infoContainerMain}>
        <View style={styles.infoContainerSecondary}>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Name: {customerName}</Text>
                <Text style={styles.label}>AccountNo: {accountNumber}</Text>
                <Text style={styles.label}>Agent: {handler}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>PhoneNo: {phoneNo}</Text>
                <Text style={styles.label}>Address: {address}</Text>
                <Text style={styles.label}>Total Balance: {totalBalance}</Text>    
                <Text></Text>    
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Issue Date: {issueDate}</Text>    
            </View>
        </View>
        <View style={styles.infoContainerButton}>      
            <Button title="Deposit" onPress={handleDeposit} />
        </View>
      </View>

      {/* Display the list of deposits */}
      <View style={styles.depositsContainer}>
        <Text style={styles.depositTitle}>Deposits:</Text>
        {renderDeposits()}
      </View>

      {/* Modal for deposit form */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close the modal on back button press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deposit Form</Text>

            {/* Customer Name and Account No display */}
            <Text>Customer Name: {customerName}</Text>
            <Text>Account Number: {accountNumber}</Text>

            {/* Date Picker */}
            <Text style={styles.label}>Date:</Text>
            <TextInput
              style={styles.input}
              value={date.toLocaleDateString()} // Display the date in a readable format
              editable={false} // Make it non-editable, show as text
            />
            <Button title="Change Date" onPress={() => setShowDatePicker(true)} /> 
            {/* Date Time Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            {/* Amount input */}
            <Text style={styles.amount}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>


        {/* Modal for update amount form */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={editAmountModalVisible}
            onRequestClose={() => setEditAmountModalVisible(false)} // Close the modal on back button press
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Update Amount</Text>

                    {/* Date Picker */}
                    <Text style={styles.label}>Date:</Text>
                    <TextInput
                        style={styles.input}
                        value={editingDate} // Display the date in a readable format
                        editable={false} // Make it non-editable, show as text
                    />

                    {/* Amount input */}
                    <Text style={styles.amount}>Amount</Text>
                    <TextInput
                        style={styles.input}
                        value={String(editingAmount)}
                        onChangeText={setEditingAmount}
                        keyboardType="numeric"
                    />

                    <Button title="Submit" onPress={updateAmount} />
                    <Button title="Cancel" onPress={() => setEditAmountModalVisible(false)} color="red" />
                </View>
            </View>
        </Modal>

        {/* Confirmation Modal for Deleting Deposit */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={deleteDepositVisible}
            onRequestClose={() => setDeleteDepositVisible(false)}
        >
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Deposit Deletion</Text>
                <Text>Are you sure you want to delete this Deposit?</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <Button title="Yes" onPress={deleteDeposit}  color="red"/>
                <Button title="No" onPress={() => setDeleteDepositVisible(false)}  />
                </View>
            </View>
            </View>
        </Modal>

        {/* Confirmation Modal for Deleting Account */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={confirmDeleteVisible}
            onRequestClose={() => setConfirmDeleteVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
                <Text>Are you sure you want to delete this Account?</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button title="Yes" onPress={deleteCustomerAndDeposits}  color="red"/>
                    <Button title="No" onPress={() => setConfirmDeleteVisible(false)}  />
                </View>
                </View>
            </View>
        </Modal>

        {/* Close Loan Button */}
        <TouchableOpacity style={styles.deleteLoanButton}
        onPress={() => setConfirmDeleteVisible(true)} // Show confirmation modal on press
        >
            <Text style={{color: 'white'}}>Close Account</Text>
        </TouchableOpacity>
    </ScrollView>
  );
};

export default Deposit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: 'red'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainerMain: {
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: 'black',
  },
  infoContainerSecondary: {
    // borderWidth: 1,
    // borderColor: 'red',
    flexDirection: 'column',
    flex: 1

    // width: '90%'
  },
  infoContainer: {
    flexDirection: 'row', // Arrange elements in a row
    justifyContent: 'space-between', // Space out the elements
    alignItems: 'center', // Center items vertically
  },
  infoContainerButton: {
    // alignItems: 'flex-end'
    // flexDirection: 'row', // Arrange elements in a row
    // justifyContent: 'flex-end'
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    flex: 1, // Allow the text to take available space
  },
  depositsContainer: {
    marginTop: 20, // Space above deposits section
  },
  depositTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 50
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  depositItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    marginLeft: 50
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
  amount: {
    marginTop: 10,
  },
  positiveAmount: {
    color: 'green', // Green color for positive amounts
  },
  negativeAmount: {
    color: 'red', // Red color for negative amounts
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
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
  deleteLoanButton: {
    marginBottom: 50,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'crimson', 
    borderRadius: 5, 
    paddingVertical: 5,
    paddingHorizontal: 15,
  }
});
