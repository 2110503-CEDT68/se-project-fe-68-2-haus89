// src/libs/updateRecord.ts
export interface UpdateRecordPayload {
  diagnosis?: string;
  treatments?: string;
  prescriptions?: string;
  followUpDate?: string;
  dentistNote?: string;
}

export default async function updateRecord(
  token: string,
  recordId: string,
  payload: UpdateRecordPayload
) {
  // Transform comma-separated strings to arrays
  const treatments = payload.treatments
    ? payload.treatments.split(',').map(t => ({ procedureName: t.trim() })).filter(t => t.procedureName)
    : undefined;

  const prescriptions = payload.prescriptions
    ? payload.prescriptions.split(',').map(p => ({ medicationName: p.trim() })).filter(p => p.medicationName)
    : undefined;

  const body: any = {};
  if (payload.diagnosis !== undefined) body.diagnosis = payload.diagnosis;
  if (treatments !== undefined) body.treatments = treatments;
  if (prescriptions !== undefined) body.prescriptions = prescriptions;
  if (payload.followUpDate !== undefined) body.followUpDate = payload.followUpDate || null;
  if (payload.dentistNote !== undefined) body.dentistNote = payload.dentistNote;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/records/${recordId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update record');
  }

  return await response.json();
}
