import Swal from 'sweetalert2'
import type { OrderModel, OrderStatus } from './models/order.model'

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

export function getOrderTotal(order: OrderModel) {
    return order.pricePerUnit * order.quantity
}

export const STATUS_INFO: Record<OrderStatus, { label: string, css: string, icon: string }> = {
    rezervisano: { label: 'Rezervisano', css: 'text-bg-warning', icon: 'fa-clock' },
    pristiglo: { label: 'Pristiglo', css: 'text-bg-success', icon: 'fa-circle-check' },
    otkazano: { label: 'Otkazano', css: 'text-bg-secondary', icon: 'fa-ban' }
}

const buttons = {
    confirmButton: 'btn btn-primary mx-1',
    cancelButton: 'btn btn-outline-secondary mx-1',
    denyButton: 'btn btn-outline-primary mx-1'
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
        customClass: buttons
    })
    return result.isConfirmed
}

export async function showReserved(plantName: string): Promise<'korpa' | 'katalog'> {
    const result = await Swal.fire({
        icon: 'success',
        title: 'Biljka je rezervisana',
        text: `${plantName} je dodata u vašu korpu sa statusom "Rezervisano".`,
        showDenyButton: true,
        confirmButtonText: 'Idi u korpu',
        denyButtonText: 'Nastavi kupovinu',
        buttonsStyling: false,
        customClass: buttons
    })
    return result.isConfirmed ? 'korpa' : 'katalog'
}

export async function showUndo(message: string): Promise<boolean> {
    const result = await Swal.fire({
        toast: true,
        position: 'bottom-start',
        icon: 'info',
        title: message,
        showConfirmButton: true,
        confirmButtonText: '<i class="fa-solid fa-rotate-left"></i> Poništi',
        buttonsStyling: false,
        customClass: { confirmButton: 'btn btn-sm btn-primary' },
        timer: 6000,
        timerProgressBar: true
    })
    return result.isConfirmed
}