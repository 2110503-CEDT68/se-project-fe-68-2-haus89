interface CreateRecordPayload {
  patient: string;
  dentist: string;
  bookingId?: string;
  diagnosis: string;
  treatments: string;        
  prescriptions: string;     
  followUpDate: string;
  dentistNote: string;
}

export default async function createRecord(
  token: string,
  payload: CreateRecordPayload
) {

  const treatments = payload.treatments
    ? payload.treatments.split(',').map(t => ({ procedureName: t.trim() })).filter(t => t.procedureName)
    : [];

  const prescriptions = payload.prescriptions
    ? payload.prescriptions.split(',').map(p => ({ medicationName: p.trim() })).filter(p => p.medicationName)
    : [];

  const body = {
    patient:      payload.patient,
    dentist:      payload.dentist,
    booking:      payload.bookingId || undefined,
    diagnosis:    payload.diagnosis,
    treatments,
    prescriptions,
    followUpDate: payload.followUpDate || undefined,
    dentistNote:  payload.dentistNote || undefined,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create record');
  }

  return res.json();
}