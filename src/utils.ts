import Swal from 'sweetalert2'

export function formatPrice(value: number) {
    return `${value.toLocaleString('sr-RS')} RSD`
}

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function showToast(message: string, icon: 'success' | 'info' | 'error' = 'success') {
    Swal.fire({
        toast: true,
        position: 'bottom-start',
        icon,
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    })
}

export async function showConfirm(title: string, text: string, confirmText: string): Promise<boolean> {
    const result = await Swal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Odustani',
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-primary mx-1',
            cancelButton: 'btn btn-outline-secondary mx-1'
        }
    })
    return result.isConfirmed
}