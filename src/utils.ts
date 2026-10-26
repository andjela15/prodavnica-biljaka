
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