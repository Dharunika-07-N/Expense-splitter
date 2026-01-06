export async function pickContacts() {
    if (!('contacts' in navigator)) {
        console.warn('Contact picker not supported on this browser.');
        return null;
    }

    try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };

        const contacts = await navigator.contacts.select(props, opts);

        return contacts.map(contact => ({
            name: (contact.name && contact.name[0]) || 'Unknown',
            phone: (contact.tel && contact.tel[0]) || null
        }));
    } catch (error) {
        console.error('Contact selection cancelled or failed:', error);
        return null;
    }
}

export function isContactPickerSupported() {
    return typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;
}
