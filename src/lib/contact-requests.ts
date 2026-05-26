import { supabase } from '@/lib/supabase'

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

export async function contactRequestExists(email: string) {
  const normalized = normalizeEmail(email)

  const { data, error } = await supabase
    .from('contact_requests')
    .select('id, contact')
    .ilike('email', normalized)
    .limit(1)

  if (error) {
    return { exists: false, contact: false, error }
  }

  const exists = (data?.length ?? 0) > 0
  const contact = exists ? (data![0].contact ?? false) : false

  return { exists, contact, error: null }
}

export async function updateContactRequest(email: string, row: Partial<ContactRequestInsert>) {
  const normalized = normalizeEmail(email)
  const updateData = { ...row }
  if (row.email) updateData.email = normalizeEmail(row.email)
  
  return supabase.from('contact_requests').update(updateData).ilike('email', normalized)
}

export async function insertContactRequest(row: ContactRequestInsert) {
  return supabase.from('contact_requests').insert({
    email: normalizeEmail(row.email),
    notes: row.notes,
    first_name: row.first_name,
    last_name: row.last_name,
    contact: row.contact,
  })
}
