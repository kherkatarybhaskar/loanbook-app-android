import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ip } from '../config';
import profile from '../assets/profile.png';

const AddLoan = () => {
    const navigation = useNavigation();
    const [loanData, setLoanData] = useState({
        customerImage: null,
        accountNumber: '',
        customerName: '',
        phoneNo: '',
        area: '',
        handler: '',
        typeOfCustomer: 'Borrower',
        duration: '',
        interest: '',
        loanAmount: '',
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
                    reader.onloadend = () => {
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(blob);
                }));

            setLoanData({
                ...loanData,
                customerImage: base64,
            });
        }
    };

    const handleInputChange = (name, value) => {
        setLoanData({
            ...loanData,
            [name]: value,
        });
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || loanData.issueDate;
        setShowDatePicker(false);
        setLoanData({ ...loanData, issueDate: currentDate });
    };

    const handleSubmit = async () => {
        const trimmedLoanData = {
            ...loanData,
            accountNumber: loanData.accountNumber.trim(),
            customerName: loanData.customerName.trim(),
            phoneNo: loanData.phoneNo.trim(),
            area: loanData.area.trim(),
            handler: loanData.handler.trim(),
            duration: loanData.duration.trim(),
            interest: loanData.interest.trim(),
            loanAmount: loanData.loanAmount.trim(),
            issueDate: formatDate(loanData.issueDate),
        };

        if (trimmedLoanData.customerName.length === 0) {
            Alert.alert("Invalid Customer Name", "Customer name cannot be empty.");
            return;
        }
        if (trimmedLoanData.accountNumber.length === 0) {
            Alert.alert("Invalid Account Number", "Account number cannot be empty.");
            return;
        }
        if (trimmedLoanData.phoneNo.length !== 10) {
            Alert.alert("Invalid Phone Number", "Phone number must be exactly 10 digits.");
            return;
        }
        if (trimmedLoanData.area.length === 0) {
            Alert.alert("Invalid Address", "Address cannot be empty.");
            return;
        }
        if (trimmedLoanData.handler.length === 0) {
            Alert.alert("Invalid Agent Name", "Agent name cannot be empty.");
            return;
        }
        if (trimmedLoanData.duration.length === 0) {
            Alert.alert("Invalid Duration", "Duration cannot be empty.");
            return;
        }
        if (trimmedLoanData.interest.length === 0) {
            Alert.alert("Invalid Interest Rate", "Interest rate cannot be empty.");
            return;
        }
        if (trimmedLoanData.loanAmount.length === 0) {
            Alert.alert("Invalid Loan Amount", "Loan amount cannot be empty.");
            return;
        }
        if (!trimmedLoanData.customerImage) {
            trimmedLoanData.customerImage = 'none';
        }

        try {
            const response = await fetch(`${ip}/api/loan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trimmedLoanData),
            });

            if (response.status === 409) {
                Alert.alert('Error', 'Account number already exists');
                return;
            }
            if (response.ok) {
                setLoanData({
                    customerImage: null,
                    accountNumber: '',
                    customerName: '',
                    phoneNo: '',
                    area: '',
                    handler: '',
                    typeOfCustomer: 'Borrower',
                    duration: '',
                    interest: '',
                    loanAmount: '',
                    issueDate: new Date(),
                });
                Alert.alert("Success", "Loan Issued Successfully.");
                navigation.navigate('Loans');
            } else {
                console.error("Error submitting loan", await response.json());
            }
        } catch (error) {
            console.error("Error submitting loan", error);
            Alert.alert("Error", "Network error occurred. Please check your connection.");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Add Loan</Text>
            
            <Text style={styles.label}>Customer Image</Text>
            <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
                {loanData.customerImage ? (
                    <Image source={{ uri: loanData.customerImage }} style={styles.image} />
                ) : (
                    <Image source={profile} style={styles.image} />
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Customer Name</Text>
            <TextInput style={styles.input} placeholder="Enter Customer Name" value={loanData.customerName} onChangeText={(value) => handleInputChange('customerName', value)} />

            <Text style={styles.label}>Account Number</Text>
            <TextInput style={styles.input} placeholder="Enter Account Number" value={loanData.accountNumber} onChangeText={(value) => handleInputChange('accountNumber', value)} />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="Enter Phone Number" value={loanData.phoneNo} keyboardType="phone-pad" onChangeText={(value) => handleInputChange('phoneNo', value)} />

            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} placeholder="Enter Address" value={loanData.area} onChangeText={(value) => handleInputChange('area', value)} />

            <Text style={styles.label}>Agent</Text>
            <TextInput style={styles.input} placeholder="Enter Agent Name" value={loanData.handler} onChangeText={(value) => handleInputChange('handler', value)} />

            <Text style={styles.label}>Duration (months)</Text>
            <TextInput style={styles.input} placeholder="Enter Loan Duration" value={loanData.duration} keyboardType="numeric" onChangeText={(value) => handleInputChange('duration', value)} />

            <Text style={styles.label}>Interest Rate (%)</Text>
            <TextInput style={styles.input} placeholder="Enter Interest Rate" value={loanData.interest} keyboardType="numeric" onChangeText={(value) => handleInputChange('interest', value)} />

            <Text style={styles.label}>Loan Amount</Text>
            <TextInput style={styles.input} placeholder="Enter Loan Amount" value={loanData.loanAmount} keyboardType="numeric" onChangeText={(value) => handleInputChange('loanAmount', value)} />

            <Text style={styles.label}>Issue Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text>{formatDate(loanData.issueDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={loanData.issueDate} mode="date" display="default" onChange={handleDateChange} />
            )}

            <Button title="Submit" onPress={handleSubmit} />
        </ScrollView>
    );
};

export default AddLoan;

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
