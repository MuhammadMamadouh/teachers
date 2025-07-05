import Swal from 'sweetalert2';

// Configure SweetAlert with Arabic defaults and RTL support
const MySwal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md ml-2',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md mr-2',
        popup: 'swal2-rtl',
        title: 'text-right',
        content: 'text-right',
        actions: 'flex-row-reverse'
    },
    buttonsStyling: false,
    reverseButtons: false, // Set to false since we're handling RTL manually
    heightAuto: false,
    allowOutsideClick: false,
    allowEscapeKey: true
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
        didOpen: () => {
            // Apply RTL styling when dialog opens
            const popup = Swal.getPopup();
            if (popup) {
                popup.style.direction = 'rtl';
                popup.style.textAlign = 'right';
                popup.style.fontFamily = "'Cairo', sans-serif";
            }
        }
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

// Success alert
export const successAlert = (options = {}) => {
    const defaultOptions = {
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#16a34a',
        didOpen: () => {
            // Apply RTL styling when dialog opens
            const popup = Swal.getPopup();
            if (popup) {
                popup.style.direction = 'rtl';
                popup.style.textAlign = 'right';
                popup.style.fontFamily = "'Cairo', sans-serif";
            }
        }
    };

    return MySwal.fire({ ...defaultOptions, ...options });
};

// Error alert
export const errorAlert = (options = {}) => {
    const defaultOptions = {
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#d33',
        didOpen: () => {
            // Apply RTL styling when dialog opens
            const popup = Swal.getPopup();
            if (popup) {
                popup.style.direction = 'rtl';
                popup.style.textAlign = 'right';
                popup.style.fontFamily = "'Cairo', sans-serif";
            }
        }
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
