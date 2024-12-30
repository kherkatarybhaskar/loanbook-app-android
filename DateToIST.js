// Helper function to format date in DD/MM/YYYY for IST
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