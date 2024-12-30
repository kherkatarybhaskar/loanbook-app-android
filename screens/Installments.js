import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, Alert, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ip } from '../config';

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

const Installments = ({ route }) => {
  const navigation = useNavigation(); // Initialize navigation
  const { customerName, accountNumber, interest, loanAmount, duration, phoneNo, area, issueDate } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editDurationModalVisible, setEditDurationModalVisible] = useState(false); 
  const [editInstallment, setEditInstallment] = useState(null); // State to hold the installment being edited
  const [installment, setInstallmentAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [installments, setInstallments] = useState([]);
  const [newDuration, setNewDuration] = useState(duration); 
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Confirmation modal state
  const [loanData, setLoanData] = useState([]);
  const [deletingId, setDeletingId] = useState();
  const [deleteInstallmentVisible, setDeleteInstallmentVisible] = useState(false); // Confirmation modal state


  useEffect(() => {
    fetchInstallments();
    fetchLoan();
  }, []);

  const fetchInstallments = async () => {
    const params = new URLSearchParams();
    params.append('accountNumber', accountNumber.trim());
    try {
      const response = await fetch(`${ip}/api/installment?${params.toString()}`);
      // const response = await fetch(`http://${ip}:5000/api/loan/account?${params.toString()}`);
      if (response.ok) {
        const loanEntries = await response.json();
        setInstallments(loanEntries);
        console.log(loanEntries);
        
        // console.log(installments[0].duration);
      } else {
        Alert.alert('Error', 'Failed to fetch installments');
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
      Alert.alert('Error', 'An error occurred while fetching installments');
    } finally {
      console.log(calculateTotalInstallments());
    }
  };

  const fetchLoan = async () => {
    const params = new URLSearchParams();
    params.append('accountNumber', accountNumber.trim());
    try {
      const response = await fetch(`${ip}/api/loan/account?${params.toString()}`);
      // const response = await fetch(`http://${ip}:5000/api/loan/account?${params.toString()}`);
      if (response.ok) {
        const loanData = await response.json();
        setLoanData(loanData);
        
        // console.log(loanData[0]);
      } else {
        Alert.alert('Error', 'Failed to fetch loan data');
      }
    } catch (error) {
      console.error('Error fetching loan data:', error);
      Alert.alert('Error', 'An error occurred while fetching loan data');
    }
  };

  const handleInstallmentSubmit = async () => {
    if (!installment) {
      Alert.alert('Error', 'Please enter an installment amount');
      return;
    }

    const formattedDate = formatDateToIST(date); // No need to call toISOString() here

    const installmentData = {
      accountNumber: accountNumber,
      amount: installment,
      date: formattedDate,
    };
    console.log(date.toISOString());
    
    try {
      const response = await fetch(`${ip}/api/installment`, {
      // const response = await fetch(`http://${ip}:5000/api/loan/account/addInstallment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(installmentData),
      });

      if (response.ok) {
        const responseData = await response.json();
        Alert.alert('Success', 'Installment added successfully!');
        fetchInstallments(); // Re-fetch installments after adding an installment
      } else {
        const errorResponseText = await response.text();
        const errorResponse = JSON.parse(errorResponseText);
        Alert.alert('Error', errorResponse.message || 'Failed to add installment');
      }
    } catch (error) {
      console.error('Error submitting installment:', error);
      Alert.alert('Error', 'An error occurred while submitting the installment: ' + error.message);
    } finally {
      setModalVisible(false);
      setInstallmentAmount('');
    }
  };

  const handleDurationSubmit = async () => {
    if (!newDuration || isNaN(newDuration)) {
        Alert.alert('Error', 'Please enter a valid duration');
        return;
    }

    const updateData = {
        accountNumber,
        newDuration,
    };

    try {
        const response = await fetch(`${ip}/api/loan/account/updateDuration`, {
        // const response = await fetch(`http://${ip}:5000/api/loan/account/updateDuration`, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (response.ok) {
            Alert.alert('Success', 'Duration updated successfully!');
            fetchInstallments(); // Re-fetch installments after updating duration
            setEditDurationModalVisible(false);  
        } else {
            const errorData = await response.json();
            Alert.alert('Error', errorData.message || 'Failed to update duration');
        }
    } catch (error) {
        console.error('Error updating duration:', error);
        Alert.alert('Error', 'An error occurred while updating the duration: ' + error.message);
    } finally {
      fetchLoan();
    }
  };

  const handleEditInstallmentSubmit = async () => {
    if (!editInstallment) {
      Alert.alert('Error', 'No installment selected');
      return;
    }

    try {
      const response = await fetch(`${ip}/api/installment/updateInstallment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber,
          date: editInstallment.date,
          newAmount: editInstallment.amount,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Installment updated successfully!');
        fetchInstallments(); // Refresh installments after updating the installment
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to update installment');
      }
    } catch (error) {
      console.error('Error updating installment:', error);
      Alert.alert('Error', 'An error occurred while updating the installment');
    } finally {
      setEditModalVisible(false);
      setEditInstallment(null); // Reset the selected installment
      fetchInstallments();
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const calculateAmountWithInterest = (amount, interest, duration) => {
    return parseFloat(amount) + ((parseFloat(amount) * (parseFloat(interest) / 100)) * parseFloat(duration));
  };

  const calculateTotalInstallments = () => {
    if (installments.length === 0) {        
        return 0; // No installments available
    }
    return installments.reduce((total, installment) => {
        return total + parseFloat(installment.amount || 0);
    }, 0);
  }; 

  const deleteLoan = async () => {
    try {
      const response = await fetch(`${ip}/api/loan/account/deleteLoan`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountNumber }), // Pass accountNumber in the body
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', 'Loan deleted successfully');
      } else {
        Alert.alert('Error', responseData.message || 'Failed to delete loan');
      }
    } catch (error) {
      console.error('Error deleting loan:', error);
      Alert.alert('Error', 'An error occurred while deleting the loan');
    }
    setConfirmDeleteVisible(false); // Hide the modal after deletion
    navigation.navigate('Loans');
  }; 

  const showDeleteInstallment = async (id) => {
    setDeleteInstallmentVisible(true); // Open the edit modal
    setDeletingId(id);
  }
  const deleteInstallment = async () => {
      const params = new URLSearchParams();
      console.log(deletingId);
      
      params.append('id', deletingId); // Add accountNumber to query parameters
      try {
          const response = await fetch(`${ip}/api/installment/deleteInstallmentById?${params.toString()}`, {
              method: 'DELETE', // Using PUT for the update operation
          });

          if (response.ok) {
              const responseData = await response.json();
              console.log('Deposit deleted:', responseData); // Log the server response
              Alert.alert('Success', 'Deposit deleted successfully!'); // Success alert

              fetchInstallments(); // Refresh the deposits list
          } else {
              const errorResponseText = await response.text(); // Get the error response
              const errorResponse = JSON.parse(errorResponseText); // Parse it as JSON
              Alert.alert('Error', errorResponse.message || 'Failed to delete deposit'); // Show error message
          }
      } catch (error) {
          console.error('Error updating deposit:', error);
          Alert.alert('Error', 'An error occurred while deleting the deposit: ' + error.message); // Error alert
      } finally {
          setDeleteInstallmentVisible(false); // Close the edit modal after submission
          // fetchInstallments();
      }
  }

  const renderInstallments = () => {
    // Check if there are no installments
    if (installments.length === 0) {
      return (
          <View style={styles.row}>
              <Text style={styles.cell}>No installments available.</Text>
          </View>
      );
    }

    return (
      <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
              <Text style={styles.headerCell}>Date</Text>
              <Text style={styles.headerCell}>Amount</Text>
              {/* <Text style={styles.headerCell}></Text> */}
          </View>

          {/* Render installment items using map instead of a for loop */}
          {installments.map((item, index) => (
              <View key={item._id} style={styles.row}>
                  <Text style={styles.cell}>{item.date}</Text>
                  <Text style={styles.cell}>{item.amount}</Text>
                  <TouchableOpacity onPress={() => {
                      setEditInstallment({ ...item }); // Set the installment for editing
                      setEditModalVisible(true); // Show the edit modal
                  }}>
                      <Ionicons name="pencil" size={22} color="green" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                      // setEditInstallment({ ...item }); // Set the installment for editing
                      // setEditModalVisible(true); // Show the edit modal
                      showDeleteInstallment(item._id);
                  }}
                    style={{ marginLeft: 10}}
                  >
                      <Ionicons name="trash" size={22} color="red" />
                  </TouchableOpacity>
              </View>
          ))}
      </View>
    );
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Loan Account Information</Text>

      <View style={styles.infoContainerMain}>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Customer Name: {customerName}</Text>
          <Text style={styles.label}>Account Number: {accountNumber}</Text>
          <Text style={styles.label}>Phone Number: {phoneNo}</Text>
          <Text style={styles.label}>Address: {area}</Text>
          <Text style={styles.label}>Issue Date: {issueDate}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Interest Rate: {interest} %</Text>
          <Text style={styles.label}>
              Duration: {loanData.length > 0 ? loanData[0].duration : 'N/A'} Months
          </Text>
          <Text style={styles.label}>Loan Amount: {loanAmount}</Text>
          <Text style={styles.label}>Total Amount: {calculateAmountWithInterest(loanAmount, interest, newDuration)}</Text>
          <Text style={styles.labelOutstanding}>Outstanding Amount: {calculateAmountWithInterest(loanAmount, interest, newDuration) - calculateTotalInstallments()}</Text>
        </View>
        <View style={styles.addInstallmentContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Installment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setEditDurationModalVisible(true)}>
            <Text style={styles.buttonText}>Edit Duration</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.depositsContainer}>
        <Text style={styles.depositTitle}>Installments:</Text>
        {renderInstallments()}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Installment Form</Text>

            <Text style={styles.label}>Customer Name: {customerName}</Text>
            <Text style={styles.label}>Account Number: {accountNumber}</Text>

            <TextInput
              style={styles.input}
              value={date.toLocaleDateString()}
              editable={false}
            />
            <Button title="Change Date" onPress={() => setShowDatePicker(true)} />
            {showDatePicker && (
              <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
            )}

            <Text style={styles.amount}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Amount"
              value={installment}
              onChangeText={setInstallmentAmount}
              keyboardType="numeric"
            />

            <Button title="Submit" onPress={handleInstallmentSubmit} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>

      {/* Edit Duration Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editDurationModalVisible}
        onRequestClose={() => setEditDurationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Duration</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter New Duration"
              value={newDuration.toString()}
              onChangeText={(text) => setNewDuration(text)}
              keyboardType="numeric"
            />

            <Button title="Submit" onPress={handleDurationSubmit} />
            <Button title="Cancel" onPress={() => setEditDurationModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>

      {/* Edit Installment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Installment</Text>
            {editInstallment && (
              <>
                <Text style={styles.label}>Date: {editInstallment.date}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter New Amount"
                  value={editInstallment.amount.toString()}
                  onChangeText={(text) => setEditInstallment((prev) => ({ ...prev, amount: text }))}
                  keyboardType="numeric"
                />
              </>
            )}
            <Button title="Submit" onPress={handleEditInstallmentSubmit} />
            <Button title="Cancel" onPress={() => setEditModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
      

      {/* Confirmation Modal for Deleting Installment */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteInstallmentVisible}
        onRequestClose={() => setDeleteInstallmentVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Installmet Deletion</Text>
            <Text>Are you sure you want to delete this Installment?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Yes" onPress={deleteInstallment}  color="red"/>
              <Button title="No" onPress={() => setDeleteInstallmentVisible(false)}  />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal for Deleting Loan */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmDeleteVisible}
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Loan Deletion</Text>
            <Text>Are you sure you want to delete this loan?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Yes" onPress={deleteLoan}  color="red"/>
              <Button title="No" onPress={() => setConfirmDeleteVisible(false)}  />
            </View>
          </View>
        </View>
      </Modal>

      {/* Close Loan Button */}
      <TouchableOpacity style={styles.deleteLoanButton}
        onPress={() => setConfirmDeleteVisible(true)} // Show confirmation modal on press
      >
        <Text style={{color: 'white'}}>Close Loan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Installments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainerMain: {
    flexDirection: 'row'
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  addInstallmentContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#007BFF', 
    borderRadius: 5, 
    marginBottom: 10, 
    paddingVertical: 5,
    paddingHorizontal: 15
  },
  buttonText: {
    color: '#fff', 
    fontSize: 16, 
    textAlign: 'center', 
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  labelOutstanding: {
    fontSize: 18,
    marginBottom: 10,
    color: 'red'
  },
  tableContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 50
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    // justifyContent: 'space-evenly'
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    padding: 5,
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
  depositTitle: {
    fontSize: 20,
    fontWeight: 'bold'
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
