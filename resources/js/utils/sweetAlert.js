import Swal from 'sweetalert2';

// Configure SweetAlert with Arabic defaults
const MySwal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md mr-2',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md ml-2'
    },
    buttonsStyling: false,
    reverseButtons: true
});

// Confirmation dialog with Arabic text
export const confirmDialog = (options = {}) => {
    const defaultOptions = {
        title: 'هل أنت متأكد؟',
        text: 'لا يمكن التراجع عن هذا الإجراء',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

// Success alert
export const successAlert = (options = {}) => {
    const defaultOptions = {
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a',
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

// Error alert
export const errorAlert = (options = {}) => {
    const defaultOptions = {
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#d33',
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

// Info alert
export const infoAlert = (options = {}) => {
    const defaultOptions = {
        icon: 'info',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#3b82f6',
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

// Question dialog
export const questionDialog = (options = {}) => {
    const defaultOptions = {
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

export default MySwal;
