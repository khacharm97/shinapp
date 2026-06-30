const backendUrl = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';
const apiUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;

export type ContactRequestInsert = {
  email: string
  notes: string
  first_name: string
  last_name: string
  contact: boolean
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function insertContactRequest(row: ContactRequestInsert) {
  try {
    const response = await fetch(`${apiUrl}/contact-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizeEmail(row.email),
        notes: row.notes,
        firstName: row.first_name,
        lastName: row.last_name,
        contact: row.contact,
      })
    });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
