import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ip } from '../config';
import profile from '../assets/profile.png';

const AddCustomer = () => {
  const navigation = useNavigation();

  const [customerData, setCustomerData] = useState({
    customerImage: null,
    accountNumber: '',
    customerName: '',
    phoneNo: '',
    area: '',
    handler: '',
    typeOfCustomer: 'Depositor',
    issueDate: new Date(),
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64 = await fetch(manipulatedImage.uri)
        .then(response => response.blob())
        .then(blob => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }));

      setCustomerData({ ...customerData, customerImage: base64 });
    }
  };

  const handleInputChange = (name, value) => {
    setCustomerData({ ...customerData, [name]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || customerData.issueDate;
    setShowDatePicker(false);
    setCustomerData({ ...customerData, issueDate: currentDate });
  };

  const handleSubmit = async () => {
    const trimmedCustomerData = {
      ...customerData,
      accountNumber: customerData.accountNumber.trim(),
      customerName: customerData.customerName.trim(),
      phoneNo: customerData.phoneNo.trim(),
      area: customerData.area.trim(),
      handler: customerData.handler.trim(),
      typeOfCustomer: customerData.typeOfCustomer.trim(),
      issueDate: formatDate(customerData.issueDate),
    };

    if (trimmedCustomerData.customerName.length === 0) {
      Alert.alert("Invalid Customer Name", "Customer name cannot be empty.");
      return;
    }
    if (trimmedCustomerData.accountNumber.length === 0) {
      Alert.alert("Invalid Account Number", "Account number cannot be empty.");
      return;
    }
    if (trimmedCustomerData.phoneNo.length !== 10) {
      Alert.alert("Invalid Phone Number", "Phone number must be exactly 10 digits.");
      return;
    }
    if (trimmedCustomerData.area.length === 0) {
      Alert.alert("Invalid Area", "Address cannot be empty.");
      return;
    }
    if (trimmedCustomerData.handler.length === 0) {
      Alert.alert("Invalid Handler", "Handler cannot be empty.");
      return;
    }
    if (!trimmedCustomerData.customerImage) {
      trimmedCustomerData.customerImage = 'none';
    }

    try {
      const response = await fetch(`${ip}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedCustomerData),
      });

      if (response.status === 409) {
        Alert.alert('Error', 'Account number already exists');
        return;
      }

      if (response.ok) {
        Alert.alert('Success', 'Customer added successfully!');
        setCustomerData({
          customerImage: null,
          accountNumber: '',
          customerName: '',
          phoneNo: '',
          area: '',
          handler: '',
          typeOfCustomer: '',
          issueDate: new Date(),
        });
        navigation.navigate('Depositor');
      } else {
        console.error("Error submitting customer data:", await response.json());
      }
    } catch (error) {
      console.error('Error submitting customer data:', error);
      Alert.alert("Error", "Network error occurred. Please check your connection.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Add Customer</Text>
      
      <Text style={styles.label}>Customer Image</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
        {customerData.customerImage ? (
          <Image source={{ uri: customerData.customerImage }} style={styles.image} />
        ) : (
          <Image source={profile} style={styles.image} />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Customer Name</Text>
      <TextInput style={styles.input} placeholder="Enter Customer Name" value={customerData.customerName} onChangeText={(value) => handleInputChange('customerName', value)} />

      <Text style={styles.label}>Account Number</Text>
      <TextInput style={styles.input} placeholder="Enter Account Number" value={customerData.accountNumber} onChangeText={(value) => handleInputChange('accountNumber', value)} />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} placeholder="Enter Phone Number" value={customerData.phoneNo} keyboardType="phone-pad" onChangeText={(value) => handleInputChange('phoneNo', value)} />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} placeholder="Enter Address" value={customerData.area} onChangeText={(value) => handleInputChange('area', value)} />

      <Text style={styles.label}>Agent</Text>
      <TextInput style={styles.input} placeholder="Enter Agent Name" value={customerData.handler} onChangeText={(value) => handleInputChange('handler', value)} />

      <Text style={styles.label}>Issue Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{formatDate(customerData.issueDate)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={customerData.issueDate} mode="date" display="default" onChange={handleDateChange} />
      )}

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default AddCustomer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#021C55',
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderColor: '#021C55',
    borderWidth: 1,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: '#021C55',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center'
  },
});
