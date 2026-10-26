export const MIN_PASSWORD = 8

export function validateProfile(data: {
    firstName: string, lastName: string, phone: string, address: string, favoriteTypes: string[]
}) {
    const errors: Record<string, string> = {}

    if (data.firstName.trim().length < 2) errors.firstName = 'Unesite ime.'
    if (data.lastName.trim().length < 2) errors.lastName = 'Unesite prezime.'
    if (!/^\+?[0-9 /-]{8,15}$/.test(data.phone.trim())) errors.phone = 'Unesite broj telefona, npr. 0641234567.'
    if (data.address.trim().length < 5) errors.address = 'Unesite ulicu, broj i grad.'
    if (data.favoriteTypes.length === 0) errors.favoriteTypes = 'Izaberite bar jednu vrstu biljaka.'

    return errors
}

export function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}