import Swal from "sweetalert2"

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatPrice(value: number) {
    return `${value.toLocaleString('sr-RS')} RSD`
}

export const bootstrapClasses = {
    popup: 'card',
    cancelButton: 'btn btn-outline-secondary m-1',
    denyButton: 'btn btn-secondary m-1',
    confirmButton: 'btn btn-primary m-1'
}

export function showConfirm(message: string, callback: Function, text?: string) {
    Swal.fire({
        title: message,
        text: text,
        showCancelButton: true,
        confirmButtonText: 'Da, potvrdi',
        cancelButtonText: 'Odustani',
        icon: 'question',
        buttonsStyling: false,
        customClass: bootstrapClasses
    }).then(result => {
        if (result.isConfirmed) {
            callback()
        }
    })
}

export function showSuccess(message: string = 'Uspešno završeno') {
    Swal.fire({
        icon: 'success',
        title: message,
        confirmButtonText: 'U redu',
        buttonsStyling: false,
        customClass: bootstrapClasses
    })
}

export function showError(message: string) {
    Swal.fire({
        icon: 'error',
        title: 'Greška',
        text: message,
        confirmButtonText: 'U redu',
        buttonsStyling: false,
        customClass: bootstrapClasses
    })
}
