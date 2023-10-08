// errorHandler.js
import toast from 'react-hot-toast';

// @ts-ignore
export const handleError = (error, additionalMessage: string) => {
    let errorMessage = 'An error occurred';  // Default error message

    if (error.isAxiosError) {
        errorMessage = error.errorMessage || errorMessage;
    } else if (error.response && error.response.data && error.response.data.errorMessage) {
        errorMessage = error.response.data.errorMessage;
    } else if (error.response && error.response.statusText) {
        errorMessage = error.response.statusText;
    }

    // Append the additionalMessage if provided
    if (additionalMessage) {
        errorMessage += `: ${additionalMessage}`;
    }

    console.log('error', error);  // Log the error object to the console
    toast.error(errorMessage);  // Display the error message
};

