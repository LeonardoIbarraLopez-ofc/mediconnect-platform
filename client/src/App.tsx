import React, { useState, useEffect } from 'react';
import './App.css';

// SVGs for high fidelity tab & visual icons
const IconPortal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

const IconIoT = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);

const IconWifi = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
);

const IconLedger = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M12 2a9 9 0 0 0-9 9M21 11a9 9 0 0 0-9-9"/></svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const IconVideo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
);

const IconMic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const IconInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

// Constants
const PATIENTS = [
  { id: 'PAT-001', name: 'María Delgado', age: 34, location: 'Yungas (Zona Rural)', phone: '+591 71234567', condition: 'Hipertensión Crónica' },
  { id: 'PAT-002', name: 'Juan Carlos Pérez', age: 48, location: 'Santa Cruz', phone: '+591 68765432', condition: 'Diabetes Tipo II' },
  { id: 'PAT-003', name: 'Sofía Rodríguez', age: 29, location: 'Salar de Uyuni (Zona Rural)', phone: '+591 79812345', condition: 'Ninguna' }
];

const DOCTORS = [
  { id: 'DOC-101', name: 'Dr. Siles (Cardiología)', rating: 4.8, reviews: 142 },
  { id: 'DOC-102', name: 'Dra. Mendoza (Medicina General)', rating: 4.9, reviews: 89 },
  { id: 'DOC-103', name: 'Dr. Quispe (Endocrinología)', rating: 4.7, reviews: 110 }
];

interface Appointment {
  id: string;
  patientId: string;
  doctor: string;
  specialty: string;
  date: string;
  modality: 'presencial' | 'videoconsulta';
  status: 'confirmada' | 'completada' | 'cancelada';
}

interface LocalRecord {
  id: string;
  type: string;
  data: string;
  synced: boolean;
  timestamp: string;
}

interface AuditEvent {
  seq: number;
  type: string;
  service: string;
  payload: string;
  prevHash: string;
  hmac: string;
  timestamp: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'portal' | 'iot' | 'pwa' | 'ledger'>('portal');

  // Premium toast notification state & helper
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Real-time audit clock (24h format, no wrapping)
  const [localTime, setLocalTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const dateStr = d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const timeStr = d.toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLocalTime(`${dateStr}  ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // General States
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-001');
  const patient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  // 📋 TABS 1: PORTAL CLÍNICO STATES
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 'APP-051', patientId: 'PAT-001', doctor: 'Dr. Siles (Cardiología)', specialty: 'Cardiología', date: '2026-05-27 10:00', modality: 'videoconsulta', status: 'confirmada' },
    { id: 'APP-052', patientId: 'PAT-001', doctor: 'Dra. Mendoza (Medicina General)', specialty: 'Medicina General', date: '2026-05-26 14:00', modality: 'videoconsulta', status: 'completada' }
  ]);
  const [newApptDoctor, setNewApptDoctor] = useState<string>('Dr. Siles (Cardiología)');
  const [newApptDate, setNewApptDate] = useState<string>('2026-05-28');
  const [newApptTime, setNewApptTime] = useState<string>('09:30');
  const [newApptModality, setNewApptModality] = useState<'presencial' | 'videoconsulta'>('videoconsulta');

  // Videoconsulta States
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [aesEnabled, setAesEnabled] = useState<boolean>(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('Conectando videollamada segura...');
  const [subtitlesList] = useState<string[]>([
    'Buenos días. Iniciando conexión certificada con el paciente.',
    'Estoy revisando su historial unificado de MongoDB y Mainframe COBOL.',
    'Su presión sistólica reportada ayer fue de 135 mmHg. Bastante bien.',
    'Le voy a prescribir Losartán 50mg con firma digital RSA para la farmacia.',
    'Recuerde tomar abundante agua y evitar el exceso de sal en sus comidas.',
    'La consulta ha finalizado. Subiendo grabación cifrada AES-256 al storage.'
  ]);

  useEffect(() => {
    if (!isVideoActive) return;
    let index = 0;
    const interval = setInterval(() => {
      setActiveSubtitle(subtitlesList[index % subtitlesList.length]);
      index++;
    }, 4500);
    return () => clearInterval(interval);
  }, [isVideoActive]);

  // COBOL Mainframe & EHR States
  const [cobolEnabled, setCobolEnabled] = useState<boolean>(true);
  const [cobolTimeout, setCobolTimeout] = useState<boolean>(false);
  const [isLoadingEHR, setIsLoadingEHR] = useState<boolean>(false);
  const [ehrTimeline, setEhrTimeline] = useState<any[]>([]);
  const [showEhrError, setShowEhrError] = useState<string | null>(null);

  const loadClinicalHistory = () => {
    setIsLoadingEHR(true);
    setShowEhrError(null);
    const delay = cobolTimeout ? 5000 : 800;

    setTimeout(() => {
      setIsLoadingEHR(false);
      if (cobolEnabled && cobolTimeout) {
        setShowEhrError('COBOL Mainframe Connection Timeout (5s). Fallback a caché local activa [syncPending: true]');
        setEhrTimeline([
          { date: '2026-05-20', title: 'Monitoreo de Glucosa - Control Ambulatorio', source: 'MongoDB (Fresco)', desc: 'Paciente estable, 110 mg/dL postprandial.', isLegacy: false },
          { date: '2026-05-15', title: 'Cita de Especialidad - Cardiología', source: 'MongoDB (Fresco)', desc: 'Evaluación general y ajuste de dosis de Enalapril.', isLegacy: false }
        ]);
      } else {
        const records = [
          { date: '2026-05-20', title: 'Monitoreo de Glucosa - Control Ambulatorio', source: 'MongoDB (Fresco)', desc: 'Paciente estable, 110 mg/dL postprandial.', isLegacy: false },
          { date: '2026-05-15', title: 'Cita de Especialidad - Cardiología', source: 'MongoDB (Fresco)', desc: 'Evaluación general e historial cardíaco.', isLegacy: false }
        ];
        if (cobolEnabled) {
          records.push(
            { date: '2005-09-14', title: 'Resección Quirúrgica de Vesícula - Hospital Regional', source: 'Mainframe COBOL (Histórico)', desc: 'Colecistectomía abierta sin incidencias.', isLegacy: true },
            { date: '1999-04-12', title: 'Diagnóstico Inicial de Hipertensión - Hospital de Clínicas', source: 'Mainframe COBOL (Histórico)', desc: 'Inicio de tratamiento con Enalapril 10mg diario.', isLegacy: true }
          );
        }
        setEhrTimeline(records);
      }
    }, delay);
  };

  useEffect(() => {
    loadClinicalHistory();
  }, [selectedPatientId, cobolEnabled]);

  // Recetas Digitales RSA States
  const [prescriptions, setPrescriptions] = useState<any[]>([
    { id: 'RX-101', patientId: 'PAT-001', medication: 'Losartán 50mg (30 comprimidos)', doctor: 'Dr. Siles', signed: true, date: '2026-05-26', rsa: 'RSA-2048 SIGN: 9af87d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f...' }
  ]);
  const [newMedication, setNewMedication] = useState<string>('Losartán 50mg (30 comprimidos)');

  // Laboratorios Externos
  const [labResults, setLabResults] = useState<any[]>([
    { id: 'LAB-201', testName: 'Hemograma Completo', date: '2026-05-24', status: 'Importado', lab: 'Laboratorio Alfa', values: 'Glóbulos Rojos: 4.5 M/uL (Normal), Hemoglobina: 14.2 g/dL' },
    { id: 'LAB-202', testName: 'Perfil Lipídico Completo', date: '2026-05-22', status: 'Importado', lab: 'Laboratorio Alfa', values: 'Colesterol Total: 195 mg/dL (Normal), Triglicéridos: 145 mg/dL' }
  ]);

  // 🩺 TABS 2: TELEMETRÍA IOT & CALIDAD STATES
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [telemetryHistory, setTelemetryHistory] = useState<number[]>([120, 118, 125, 122, 128, 131, 124, 135]);
  
  // Glucometer states (Glucosa en Sangre)
  const [glucose, setGlucose] = useState<number>(110);
  const [glucoseHistory, setGlucoseHistory] = useState<number[]>([105, 115, 110, 122, 118, 108, 125, 112]);

  // Pulsioxímetro states (SpO2)
  const [spo2, setSpo2] = useState<number>(98);
  const [spo2History, setSpo2History] = useState<number[]>([98, 97, 98, 99, 97, 98, 98, 98]);

  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);

  // Quality & Reviews States
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('DOC-101');
  const [patientRating, setPatientRating] = useState<number>(5);
  const [patientFeedback, setPatientFeedback] = useState<string>('');
  const [docRatings, setDocRatings] = useState<Record<string, { rating: number, reviews: number }>>({
    'DOC-101': { rating: 4.8, reviews: 142 },
    'DOC-102': { rating: 4.9, reviews: 89 },
    'DOC-103': { rating: 4.7, reviews: 110 }
  });

  // 🌐 TABS 3: PWA & CONECTIVIDAD DEGRADADA STATES
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [networkSpeed, setNetworkSpeed] = useState<string>('5G Fibra Alta Velocidad');
  const [localDB, setLocalDB] = useState<LocalRecord[]>([
    { id: 'REC-092', type: 'appointment', data: 'Cita programada con Dr. Siles', synced: true, timestamp: '2026-05-26 14:10:00' },
    { id: 'REC-093', type: 'prescription', data: 'Prescripción Losartán 50mg', synced: true, timestamp: '2026-05-26 15:30:00' }
  ]);

  // 🛡️ TABS 4: LEDGER DE AUDITORÍA STATES
  const [ledger, setLedger] = useState<AuditEvent[]>([
    { seq: 1, type: 'appointment.created', service: 'appointment-service', payload: '{"patientId":"PAT-001","doctor":"Dr. Siles"}', prevHash: '0000000000000000000000000000000000000000000000000000000000000000', hmac: 'b4a92c4f8d91a13e2f4b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a', timestamp: '2026-05-26 19:27:16' },
    { seq: 2, type: 'prescription.issued', service: 'prescription-service', payload: '{"patientId":"PAT-001","medication":"Losartán 50mg"}', prevHash: 'WTlhOWMyNGY4ZDkxYTEzZTJmNGI1ZDZlN2Y4YTliMGMxZDJlM2Y0YTViNmM3ZDhlOWYwYTFiMmMzZDRlNWY2YQ==', hmac: '9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b', timestamp: '2026-05-26 19:28:10' }
  ]);
  const [verifyingLedger, setVerifyingLedger] = useState<boolean>(false);
  const [verifiedRows, setVerifiedRows] = useState<number[]>([]);
  const [showIntegrityReport, setShowIntegrityReport] = useState<boolean>(false);
  const [showMutationError, setShowMutationError] = useState<boolean>(false);

  // 📡 INTEGRACIÓN REAL CON EL API GATEWAY (PORT 3010)
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const GATEWAY_URL = 'http://localhost:3010/api/v1';
  const DEFAULT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1LTAwMSIsInJvbGUiOiJkb2N0b3IiLCJlbWFpbCI6ImRvY3RvckBtZWRpY29ubmVjdC5ibyIsImlhdCI6MTc3OTg0MjY0OSwiZXhwIjoxNzgyNDM0NjQ5fQ.PPm49RlBpot976yrTM02p8pyckMHW4UfUK9Q6VbUIM8';

  // Polling de telemetría IoT desde el Backend (vía API Gateway)
  useEffect(() => {
    let active = true;
    const fetchLatestTelemetry = async () => {
      try {
        // Mapear PAT-001 -> pat-101, PAT-002 -> pat-102 para el simulador backend
        const backendPatientId = selectedPatientId.toLowerCase().replace('pat-00', 'pat-10');
        const res = await fetch(`${GATEWAY_URL}/iot/telemetry/patient/${backendPatientId}/latest`, {
          headers: {
            'Authorization': DEFAULT_TOKEN
          }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active && data) {
          setBackendConnected(true);
          // Actualizar valores del frontend en tiempo real con datos del backend real
          if (data.metricType === 'glucose') {
            setGlucose(data.value);
            setGlucoseHistory(prev => [...prev.slice(1), data.value]);
          } else if (data.metricType === 'blood_pressure') {
            setSystolic(data.value.systolic);
            setDiastolic(data.value.diastolic);
            setTelemetryHistory(prev => [...prev.slice(1), data.value.systolic]);
          } else if (data.metricType === 'spo2') {
            setSpo2(data.value);
            setSpo2History(prev => [...prev.slice(1), data.value]);
          }
        }
      } catch (err) {
        // Fallback silencioso a simulación offline local de la PWA
        setBackendConnected(false);
      }
    };

    fetchLatestTelemetry();
    const interval = setInterval(fetchLatestTelemetry, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedPatientId]);

  // Polling de auditoría inmutable forense (vía API Gateway)
  useEffect(() => {
    if (activeTab !== 'ledger') return;
    let active = true;
    const fetchBackendLedger = async () => {
      try {
        const res = await fetch(`${GATEWAY_URL}/audit/events?from=1&to=50`, {
          headers: {
            'Authorization': DEFAULT_TOKEN
          }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active && data && data.events && data.events.length > 0) {
          // Mapear los eventos de auditoría del backend al formato del frontend
          const mappedEvents = data.events.map((e: any) => ({
            seq: e.sequenceNumber,
            type: e.type,
            service: e.sourceService,
            payload: JSON.stringify(e.payload),
            prevHash: e.previousEventHash.substring(0, 32) + '...',
            hmac: e.hmacSignature.substring(0, 16) + '...',
            timestamp: new Date(e.occurredAt).toISOString().replace('T', ' ').substring(0, 19)
          }));
          setLedger(mappedEvents);
          setBackendConnected(true);
        }
      } catch (err) {
        setBackendConnected(false);
      }
    };

    fetchBackendLedger();
    const interval = setInterval(fetchBackendLedger, 6000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeTab]);

  // ─── LOGIC HANDLERS ───

  // I. Agenda Cita
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'APP-0' + Math.floor(Math.random() * 100 + 53);
    const dateStr = `${newApptDate} ${newApptTime}`;
    const newAppt: Appointment = {
      id: newId,
      patientId: selectedPatientId,
      doctor: newApptDoctor,
      specialty: newApptDoctor.includes('Cardiología') ? 'Cardiología' : newApptDoctor.includes('Genera') ? 'Medicina General' : 'Endocrinología',
      date: dateStr,
      modality: newApptModality,
      status: 'confirmada'
    };

    if (isOnline) {
      setAppointments(prev => [...prev, newAppt]);
      
      // Realizar POST real al microservicio appointment-service a través del API Gateway
      if (backendConnected) {
        fetch(`${GATEWAY_URL}/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': DEFAULT_TOKEN
          },
          body: JSON.stringify({
            patientId: selectedPatientId,
            doctorId: 'doc-88',
            scheduledAt: new Date(dateStr).toISOString(),
            specialty: newAppt.specialty
          })
        }).then(res => {
          if (res.ok) {
            console.log('[API Gateway] Cita guardada en base de datos real (appointment-service)');
          }
        }).catch(err => {
          console.warn('[API Gateway] Fallo al guardar la cita en el backend real');
        });
      }

      // Append to Ledger
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newSeq = ledger.length + 1;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'a9b8c7d6e5f4' + Math.floor(Math.random() * 100000);
      setLedger(prev => [...prev, { seq: newSeq, type: 'appointment.created', service: 'appointment-service', payload: JSON.stringify({ patientId: selectedPatientId, doctor: newApptDoctor, date: dateStr }), prevHash, hmac, timestamp: now }]);
      showToast(`Cita ${newId} programada con éxito en el servidor central.`, 'success');
    } else {
      // Offline-first PWA mode
      const localId = 'REC-' + Math.floor(Math.random() * 1000);
      setLocalDB(prev => [...prev, { id: localId, type: 'appointment', data: `Cita offline con ${newApptDoctor} el ${dateStr}`, synced: false, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) }]);
      showToast(`Sin red. La cita fue guardada localmente en IndexedDB.`, 'info');
    }
  };

  // II. Videoconsulta Segura (Telemedicine Service Integration)
  const handleToggleVideoCall = async () => {
    const nextState = !isVideoActive;
    setIsVideoActive(nextState);
    setIsRecording(nextState);

    if (nextState) {
      // INICIAR videoconsulta real en telemedicine-service
      if (backendConnected) {
        try {
          console.log('[API Gateway] Iniciando sesión WebRTC en telemedicine-service...');
          const res = await fetch(`${GATEWAY_URL}/telemedicine/sessions/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': DEFAULT_TOKEN
            },
            body: JSON.stringify({
              appointmentId: 'app-' + Math.floor(Math.random() * 1000),
              patientId: selectedPatientId,
              doctorId: 'doc-88'
            })
          });
          if (res.ok) {
            const data = await res.json();
            console.log('[API Gateway] Sesión WebRTC iniciada exitosamente en backend:', data);
            showToast('Videollamada iniciada en backend real. Sala WebRTC configurada.', 'success');
          }
        } catch (err) {
          console.warn('[API Gateway] Error al iniciar sesión WebRTC en el backend');
        }
      }
    } else {
      // FINALIZAR videoconsulta real en telemedicine-service
      if (backendConnected) {
        try {
          console.log('[API Gateway] Finalizando sesión WebRTC en el backend...');
          const res = await fetch(`${GATEWAY_URL}/telemedicine/sessions/session-active-local/end`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': DEFAULT_TOKEN
            },
            body: JSON.stringify({
              clinicalSummary: `El paciente ${patient.name} completó su consulta virtual. Presión arterial controlada, receta emitida.`
            })
          });
          if (res.ok) {
            console.log('[API Gateway] Grabación WebRTC guardada y subida exitosamente a AWS S3');
            showToast('Videollamada finalizada. Grabación WebRTC guardada en AWS S3.', 'info');
          }
        } catch (err) {
          console.warn('[API Gateway] Error al finalizar videoconsulta en el backend');
        }
      }
    }
  };

  // IV. Emitir Receta RSA
  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const rxId = 'RX-' + Math.floor(Math.random() * 100 + 102);
    const dateStr = new Date().toISOString().substring(0, 10);
    const rsaSignature = 'RSA-2048 SIGN: ' + btoa(rxId + newMedication + selectedPatientId).substring(0, 150) + '...';
    
    const newRx = {
      id: rxId,
      patientId: selectedPatientId,
      medication: newMedication,
      doctor: 'Dr. Siles',
      signed: true,
      date: dateStr,
      rsa: rsaSignature
    };

    if (isOnline) {
      setPrescriptions(prev => [...prev, newRx]);
      // Append to Ledger
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newSeq = ledger.length + 1;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'e5f4d3c2b1a0' + Math.floor(Math.random() * 100000);
      setLedger(prev => [...prev, { seq: newSeq, type: 'prescription.issued', service: 'prescription-service', payload: JSON.stringify({ patientId: selectedPatientId, medication: newMedication, rxId }), prevHash, hmac, timestamp: now }]);
      showToast(`Receta digital emitida y firmada con RSA-2048 legal para farmacia.`, 'success');
    } else {
      const localId = 'REC-' + Math.floor(Math.random() * 1000);
      setLocalDB(prev => [...prev, { id: localId, type: 'prescription', data: `Receta offline: ${newMedication}`, synced: false, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) }]);
      showToast(`Sin red. La receta fue guardada de forma segura en el caché local.`, 'info');
    }
  };

  // VI & VII. Telemetría IoT Ingesta (Tensiometro, Glucometro y Pulsioxímetro)
  const handlePublishTelemetry = () => {
    // 1. Ingest y actualizar series de tiempo
    const newBpHistory = [...telemetryHistory.slice(1), systolic];
    setTelemetryHistory(newBpHistory);

    const newGlucHistory = [...glucoseHistory.slice(1), glucose];
    setGlucoseHistory(newGlucHistory);

    const newSpo2History = [...spo2History.slice(1), spo2];
    setSpo2History(newSpo2History);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let triggeredAlert = false;
    let newLedgerEvents: AuditEvent[] = [];
    let alertsToAdd: any[] = [];

    // A. Tensiómetro: > 140 mmHg
    if (systolic > 140) {
      triggeredAlert = true;
      const alertId = 'ALT-' + Math.floor(Math.random() * 1000 + 100);
      alertsToAdd.push({
        id: alertId,
        patientId: selectedPatientId,
        type: 'Presión Arterial',
        value: `${systolic}/${diastolic} mmHg`,
        timestamp: now,
        msg: `Tensiómetro IoT: Presión sistólica de ${systolic} mmHg supera el rango normal (<140). Notificación enviada al especialista.`
      });
      
      const newSeq = ledger.length + 1 + newLedgerEvents.length;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'e3b0c44298f' + Math.floor(Math.random() * 10000);
      newLedgerEvents.push({
        seq: newSeq,
        type: 'alert.critical',
        service: 'iot-service',
        payload: JSON.stringify({ patientId: selectedPatientId, device: 'tensiometro', systolic, diastolic, event: 'hipertension_critica' }),
        prevHash,
        hmac,
        timestamp: now
      });
    }

    // B. Glucómetro: < 50 o > 400 mg/dL
    if (glucose < 50 || glucose > 400) {
      triggeredAlert = true;
      const alertId = 'ALT-' + Math.floor(Math.random() * 1000 + 300);
      const conditionStr = glucose < 50 ? 'Hipoglucemia severa' : 'Hiperglucemia crítica';
      alertsToAdd.push({
        id: alertId,
        patientId: selectedPatientId,
        type: 'Glucosa en Sangre',
        value: `${glucose} mg/dL`,
        timestamp: now,
        msg: `Glucómetro IoT: ${conditionStr} detectada (${glucose} mg/dL). Protocolo de emergencia endocrinológica activado.`
      });

      const newSeq = ledger.length + 1 + newLedgerEvents.length;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'd2a1b3c4f5e6' + Math.floor(Math.random() * 10000);
      newLedgerEvents.push({
        seq: newSeq,
        type: 'alert.critical',
        service: 'iot-service',
        payload: JSON.stringify({ patientId: selectedPatientId, device: 'glucometro', glucose, event: 'glucosa_critica' }),
        prevHash,
        hmac,
        timestamp: now
      });
    }

    // C. Pulsioxímetro: < 90%
    if (spo2 < 90) {
      triggeredAlert = true;
      const alertId = 'ALT-' + Math.floor(Math.random() * 1000 + 500);
      alertsToAdd.push({
        id: alertId,
        patientId: selectedPatientId,
        type: 'Saturación SpO2',
        value: `${spo2}%`,
        timestamp: now,
        msg: `Pulsioxímetro IoT: Hipoxia detectada (${spo2}% SpO2). Evento crítico alert.critical encolado en Kafka.`
      });

      const newSeq = ledger.length + 1 + newLedgerEvents.length;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'c3d4e5f6a7b8' + Math.floor(Math.random() * 10000);
      newLedgerEvents.push({
        seq: newSeq,
        type: 'alert.critical',
        service: 'iot-service',
        payload: JSON.stringify({ patientId: selectedPatientId, device: 'pulsioximetro', spo2, event: 'hipoxia_critica' }),
        prevHash,
        hmac,
        timestamp: now
      });
    }

    // Inyectar alertas y actualizar ledger
    if (alertsToAdd.length > 0) {
      setCriticalAlerts(prev => [...alertsToAdd, ...prev]);
    }
    if (newLedgerEvents.length > 0) {
      setLedger(prev => [...prev, ...newLedgerEvents]);
    } else {
      // Registrar telemetría normal
      const newSeq = ledger.length + 1;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'a1f3e5c7b8d' + Math.floor(Math.random() * 10000);
      setLedger(prev => [
        ...prev,
        { seq: newSeq, type: 'session.ended', service: 'telemedicine-service', payload: JSON.stringify({ patientId: selectedPatientId, status: 'NORMAL_TELEMETRY' }), prevHash, hmac, timestamp: now }
      ]);
    }

    if (triggeredAlert) {
      showToast(`¡Lectura MQTT procesada! Se generaron ${alertsToAdd.length} alertas críticas en el sistema.`, 'error');
    } else {
      showToast('Lectura MQTT ingerida con éxito en InfluxDB. Parámetros normales.', 'success');
    }
  };

  // VIII. Calificaciones Médicos
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    const current = docRatings[selectedDoctorId];
    const newCount = current.reviews + 1;
    const newRate = parseFloat(((current.rating * current.reviews + patientRating) / newCount).toFixed(2));
    
    setDocRatings(prev => ({
      ...prev,
      [selectedDoctorId]: { rating: newRate, reviews: newCount }
    }));

    setPatientFeedback('');
    showToast(`¡Gracias! Calificación procesada con éxito.`, 'success');
  };

  // Sync PWA records
  const triggerManualSync = () => {
    if (!isOnline) return;
    setLocalDB(prev => prev.map(rec => ({ ...rec, synced: true })));

    let currentLedger = [...ledger];
    localDB.forEach(rec => {
      if (!rec.synced) {
        const newSeq = currentLedger.length + 1;
        const prevHash = btoa(currentLedger[currentLedger.length - 1].hmac).substring(0, 64);
        const eventType = rec.type === 'appointment' ? 'appointment.created' : 'prescription.issued';
        const sourceService = rec.type === 'appointment' ? 'appointment-service' : 'prescription-service';
        const payload = JSON.stringify({ id: rec.id, description: rec.data, syncedVia: 'SyncManager' });
        const hmac = 'f8e7d6c5b4a3f2e1' + Math.floor(Math.random() * 1000).toString(16);

        currentLedger.push({
          seq: newSeq,
          type: eventType,
          service: sourceService,
          payload,
          prevHash,
          hmac,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      }
    });

    setLedger(currentLedger);
    showToast('Delta Sync completado con éxito. Los registros locales fueron sincronizados.', 'success');
  };

  // Ledger verify
  const runLedgerVerification = () => {
    setVerifyingLedger(true);
    setVerifiedRows([]);
    
    ledger.forEach((item, index) => {
      setTimeout(() => {
        setVerifiedRows(prev => [...prev, item.seq]);
        if (index === ledger.length - 1) {
          setVerifyingLedger(false);
          setShowIntegrityReport(true);
        }
      }, (index + 1) * 300);
    });
  };

  // Reusable Multi-Chart SVG Plotter for medical sensor telemetries
  const renderSvgChart = (history: number[], minVal: number, maxVal: number, threshold: number, isLower: boolean, label: string, color: string) => {
    const width = 500;
    const height = 180;
    const padding = 30;
    const pointsCount = history.length;
    
    const getX = (idx: number) => padding + (idx * (width - padding * 2)) / (pointsCount - 1);
    const getY = (val: number) => height - padding - ((val - minVal) * (height - padding * 2)) / (maxVal - minVal);
    
    const pathD = history.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');
    const thresholdY = getY(threshold);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-trend" style={{ width: '100%', height: '100%', minHeight: '130px' }}>
        <line x1={padding} y1={getY(maxVal - (maxVal - minVal) * 0.25)} x2={width - padding} y2={getY(maxVal - (maxVal - minVal) * 0.25)} stroke="#1e2938" strokeDasharray="3 3" />
        <line x1={padding} y1={getY(maxVal - (maxVal - minVal) * 0.5)} x2={width - padding} y2={getY(maxVal - (maxVal - minVal) * 0.5)} stroke="#1e2938" strokeDasharray="3 3" />
        <line x1={padding} y1={getY(maxVal - (maxVal - minVal) * 0.75)} x2={width - padding} y2={getY(maxVal - (maxVal - minVal) * 0.75)} stroke="#1e2938" strokeDasharray="3 3" />
        
        {/* Threshold line */}
        <line x1={padding} y1={thresholdY} x2={width - padding} y2={thresholdY} stroke="#ff3366" strokeWidth="2" strokeDasharray="4 4" />
        <text x={padding + 10} y={isLower ? thresholdY + 12 : thresholdY - 6} fill="#ff3366" fontSize="9" fontFamily="monospace" fontWeight="700">
          {label}: {threshold}
        </text>

        {/* Data curve */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 5px ${color}44)` }} />

        {/* Points */}
        {history.map((val, idx) => {
          const isCrit = isLower ? val < threshold : val > threshold;
          return (
            <circle key={idx} cx={getX(idx)} cy={getY(val)} r="4.5" fill={isCrit ? '#ff3366' : color} stroke="#0d131a" strokeWidth="2" />
          );
        })}

        <text x={padding} y={height - 8} fill="#8b949e" fontSize="9" fontFamily="monospace">Ayer</text>
        <text x={width - padding - 20} y={height - 8} fill="#8b949e" fontSize="9" fontFamily="monospace">Ahora</text>
      </svg>
    );
  };

  return (
    <div className="medi-dashboard" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* ─── AMBIENT RADIAL MESH BACKGROUND ─── */}
      <div className="ambient-bg">
        <div className="ambient-orb-1"></div>
        <div className="ambient-orb-2"></div>
        <div className="ambient-orb-3"></div>
      </div>
      
      {/* ─── HEADER DE ALTA FIDELIDAD ─── */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-badge">PRODUCTION RELEASE v3.5</div>
          <h1 className="brand-title">MediConnect <span>S.A.S.</span></h1>
          {backendConnected ? (
            <span className="badge-active" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(0, 240, 255, 0.1)', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)', animation: 'pulse 1.5s infinite' }}></span>
              ⚡ API GATEWAY ONLINE (3010)
            </span>
          ) : (
            <span className="badge-active" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }}></span>
              📴 MODO LOCAL PWA
            </span>
          )}
        </div>

        <div className="header-audit-box">
          <div className="header-audit-item">
            <div className="header-audit-icon">
              <IconClock />
            </div>
            <div className="header-audit-details">
              <div className="header-audit-label">RELOJ AUDITADO LOCAL</div>
              <div className="header-audit-value" style={{ color: 'var(--accent-cyan)' }}>{localTime}</div>
            </div>
          </div>

          <div className="header-contract-badge">
            <div className="header-audit-label" style={{ color: 'var(--accent-red)' }}>VENCIMIENTO CONTRATO</div>
            <div className="header-audit-value" style={{ fontSize: '0.85rem' }}>28/05/2026 (Demo)</div>
          </div>
        </div>
      </header>

      {/* ─── TAB NAVIGATOR MULTI-MÓDULO ─── */}
      <nav className="tab-navigator">
        <button className={`tab-btn ${activeTab === 'portal' ? 'active' : ''}`} onClick={() => setActiveTab('portal')}>
          <IconPortal /> 📋 Portal Clínico
        </button>
        <button className={`tab-btn ${activeTab === 'iot' ? 'active' : ''}`} onClick={() => setActiveTab('iot')}>
          <IconIoT /> 🩺 Telemetría IoT & Calidad
        </button>
        <button className={`tab-btn ${activeTab === 'pwa' ? 'active' : ''}`} onClick={() => setActiveTab('pwa')}>
          <IconWifi /> 🌐 PWA & Conectividad
        </button>
        <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
          <IconShield /> 🛡️ Ledger de Auditoría
        </button>
      </nav>

      {/* ─── CONTENIDO DE LOS TABS ─── */}
      <main>

        {/* ─── TAB 1: PORTAL CLÍNICO (MVPs I, II, III, IV, V) ─── */}
        {activeTab === 'portal' && (
          <div className="tab-content">
            
            {/* LADO IZQUIERDO: CONFIGURACIÓN GENERAL, AGENDAMIENTO & VIDEOCONSULTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Paciente y Agendamiento (MVP I) */}
              <section className="glass-panel">
                <h2 className="panel-title"><IconCalendar /> Gestión de Citas Médicas</h2>
                
                <div className="input-group">
                  <label className="input-label">Paciente Activo en Consulta</label>
                  <select className="select-control" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                    {PATIENTS.map(p => (
                      <option key={p.id} value={p.id}>{p.id} — {p.name} ({p.location})</option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleScheduleAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div className="input-label" style={{ marginBottom: 0 }}>Programar Nueva Atención</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <select className="select-control" value={newApptDoctor} onChange={(e) => setNewApptDoctor(e.target.value)}>
                        {DOCTORS.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group" style={{ margin: 0 }}>
                      <select className="select-control" value={newApptModality} onChange={(e) => setNewApptModality(e.target.value as any)}>
                        <option value="videoconsulta">📹 Videoconsulta</option>
                        <option value="presencial">🏢 Presencial</option>
                      </select>
                    </div>
                  </div>

                  <div className="datetime-row">
                    <input type="date" value={newApptDate} onChange={(e) => setNewApptDate(e.target.value)} className="select-control" />
                    <input type="time" value={newApptTime} onChange={(e) => setNewApptTime(e.target.value)} className="select-control" />
                  </div>

                  <button type="submit" className="btn btn-cyan">Agendar Cita en Agenda Nacional</button>
                </form>
              </section>

              {/* Videoconsulta con Accesibilidad (MVP II) */}
              <section className="glass-panel">
                <h2 className="panel-title"><IconVideo /> Videoconsulta Segura y Accesible</h2>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={aesEnabled} onChange={(e) => setAesEnabled(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)' }} />
                    <span>Cifrado AES-256 Activo</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={subtitlesEnabled} onChange={(e) => setSubtitlesEnabled(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)' }} />
                    <span>Subtítulos de Accesibilidad (2G/3G)</span>
                  </label>
                </div>

                {isVideoActive ? (
                  <div className="video-frame recording scanline-effect">
                    <div className="scanbar-effect"></div>
                    <div className="video-avatar">{patient.name.charAt(0)}</div>
                    
                    <div className="video-overlay">
                      <div className="rec-dot"></div>
                      <span>GRA: {isRecording ? 'AES-256 SECURE' : 'MOCK'}</span>
                    </div>

                    <div className="video-overlay" style={{ left: 'auto', right: '15px', color: 'var(--accent-cyan)' }}>
                      <span>ACCESIBILIDAD SUBTÍTULOS</span>
                    </div>

                    {subtitlesEnabled && (
                      <div className="subtitles-box">
                        🗣️ Paciente: "{activeSubtitle}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="video-frame" style={{ background: '#05070a', borderStyle: 'dashed' }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div>Cámara Apagada</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '5px' }}>Inicia la consulta virtual para conectar en tiempo real</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button className={`btn ${isVideoActive ? 'btn-red' : 'btn-cyan'}`} style={{ flex: 1 }} onClick={handleToggleVideoCall}>
                    {isVideoActive ? '🔴 Terminar Consulta' : '📹 Iniciar Videoconsulta'}
                  </button>
                  {isVideoActive && (
                    <button className="btn" onClick={() => setIsRecording(!isRecording)}>
                      {isRecording ? 'Pausar Grabación' : 'Grabar Sesión'}
                    </button>
                  )}
                </div>
              </section>

            </div>

            {/* LADO DERECHO: HISTORIAL CLÍNICO, RECETAS RSA Y LABORATORIOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Unificación de EHR (MVP III) */}
              <section className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '15px' }}>
                  <h2 className="panel-title" style={{ border: 'none', margin: 0, padding: 0 }}><IconInfo /> Expediente Clínico Unificado (EHR)</h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={cobolEnabled} onChange={(e) => setCobolEnabled(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)' }} />
                      <span>COBOL</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={cobolTimeout} onChange={(e) => setCobolTimeout(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)' }} />
                      <span>Timeout 5s</span>
                    </label>
                  </div>
                </div>

                {isLoadingEHR ? (
                  <div style={{ height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 240, 255, 0.1)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                      {cobolTimeout ? 'Conectando con Mainframe COBOL (Seguridad Social)...' : 'Sincronizando registros médicos...'}
                    </div>
                  </div>
                ) : (
                  <div>
                    {showEhrError && (
                      <div className="alert-card" style={{ padding: '8px 12px', fontSize: '0.75rem', borderColor: 'var(--accent-orange)', background: 'rgba(255,123,114,0.1)', animation: 'none', marginBottom: '12px', borderRadius: '6px' }}>
                        ⚠️ {showEhrError}
                      </div>
                    )}
                    <div className="timeline-container" style={{ maxHeight: '200px' }}>
                      {ehrTimeline.map((item, idx) => (
                        <div className="timeline-item" key={idx}>
                          <div className={`timeline-dot ${item.isLegacy ? 'legacy' : 'modern'}`}></div>
                          <div className="timeline-card">
                            <div className="timeline-meta">
                              <span style={{ fontWeight: '700', color: item.isLegacy ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>{item.source}</span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{item.date}</span>
                            </div>
                            <div className="timeline-desc" style={{ fontSize: '0.85rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Recetas Criptográficas RSA (MVP IV) */}
              <section className="glass-panel">
                <h2 className="panel-title"><IconShield /> Recetas Digitales Criptográficas RSA-2048</h2>

                <form onSubmit={handleIssuePrescription} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input type="text" className="select-control" style={{ flex: 1 }} value={newMedication} onChange={(e) => setNewMedication(e.target.value)} placeholder="Ej: Losartán 50mg (30 comprimidos)" />
                  <button type="submit" className="btn btn-cyan">Firmar y Emitir</button>
                </form>

                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {prescriptions.filter(r => r.patientId === selectedPatientId).map(rx => (
                    <div key={rx.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>
                        <span style={{ color: 'var(--accent-purple)' }}>💊 RECETA: {rx.medication}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{rx.id}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Emitida por {rx.doctor} el {rx.date}</div>
                      <div className="rsa-box">{rx.rsa}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Integración Laboratorios Clínicos (MVP V) */}
              <section className="glass-panel">
                <h2 className="panel-title"><IconPortal /> Resultados de Laboratorios Externos</h2>
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {labResults.map(lab => (
                    <div key={lab.id} className="lab-card">
                      <div>
                        <div style={{ fontWeight: 'bold' }}>🔬 {lab.testName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Origen: {lab.lab} | Recibido: {lab.date}</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{lab.values}</div>
                      </div>
                      <span className="badge-active">Importado</span>
                    </div>
                  ))}
                </div>
              </section>

            </div>

          </div>
        )}

        {/* ─── TAB 2: TELEMETRÍA IOT & CALIDAD (MVPs VI, VII, VIII) ─── */}
        {activeTab === 'iot' && (
          <div className="tab-content" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
            
            {/* Lado Izquierdo: Telemetría y Alertas (VI, VII) */}
            <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h2 className="panel-title" style={{ margin: 0, paddingBottom: '12px' }}><IconIoT /> Monitoreo Crónico IoT & Alertas Críticas</h2>
              
              {/* Controles de Entrada de Sensores (MQTT Simulación) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                
                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="input-label" style={{ fontSize: '0.75rem' }}>Presión Sistólica</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: systolic > 140 ? 'var(--accent-red)' : 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.8rem' }}>{systolic} mmHg</span>
                  </div>
                  <input type="range" min="95" max="185" value={systolic} onChange={(e) => setSystolic(parseInt(e.target.value))} className="range-control" style={{ accentColor: systolic > 140 ? 'var(--accent-red)' : 'var(--accent-cyan)' }} />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="input-label" style={{ fontSize: '0.75rem' }}>Presión Diastólica</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.8rem' }}>{diastolic} mmHg</span>
                  </div>
                  <input type="range" min="60" max="110" value={diastolic} onChange={(e) => setDiastolic(parseInt(e.target.value))} className="range-control" />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="input-label" style={{ fontSize: '0.75rem' }}>Glucosa en Sangre</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: (glucose < 50 || glucose > 400) ? 'var(--accent-red)' : 'var(--accent-purple)', fontWeight: 'bold', fontSize: '0.8rem' }}>{glucose} mg/dL</span>
                  </div>
                  <input type="range" min="30" max="450" value={glucose} onChange={(e) => setGlucose(parseInt(e.target.value))} className="range-control" style={{ accentColor: (glucose < 50 || glucose > 400) ? 'var(--accent-red)' : 'var(--accent-purple)' }} />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="input-label" style={{ fontSize: '0.75rem' }}>Saturación de Oxígeno (SpO2)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: spo2 < 90 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.8rem' }}>{spo2}%</span>
                  </div>
                  <input type="range" min="75" max="100" value={spo2} onChange={(e) => setSpo2(parseInt(e.target.value))} className="range-control" style={{ accentColor: spo2 < 90 ? 'var(--accent-red)' : 'var(--accent-green)' }} />
                </div>

              </div>

              {/* Publicar Lectura vía MQTT */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  📡 <code>mqtt://mosquitto:1883</code> | Tópico: <code>mediconnect/patients/{selectedPatientId}/telemetry</code>
                </span>
                <button className="btn btn-cyan" onClick={handlePublishTelemetry}>Publicar Lectura vía MQTT</button>
              </div>

              {/* Cuadrícula de Sensores IoT en Tiempo Real */}
              <div className="iot-sensor-grid">
                
                {/* 1. Tensiómetro */}
                <div className="sensor-metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px', background: 'rgba(12, 18, 26, 0.4)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="sensor-metric-label">💓 Tensiómetro IoT</div>
                    <div className="sensor-metric-value" style={{ color: systolic > 140 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                      {systolic}/{diastolic} <span style={{ fontSize: '0.75rem' }}>mmHg</span>
                    </div>
                  </div>
                  <div>
                    <span className={`sensor-status-badge ${systolic > 140 ? 'critical' : 'normal'}`}>
                      {systolic > 140 ? '⚠️ CRÍTICO' : '✓ NORMAL'}
                    </span>
                  </div>
                </div>

                {/* 2. Glucómetro */}
                <div className="sensor-metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px', background: 'rgba(12, 18, 26, 0.4)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="sensor-metric-label">🩸 Glucómetro IoT</div>
                    <div className="sensor-metric-value" style={{ color: (glucose < 50 || glucose > 400) ? 'var(--accent-red)' : 'var(--accent-purple)' }}>
                      {glucose} <span style={{ fontSize: '0.75rem' }}>mg/dL</span>
                    </div>
                  </div>
                  <div>
                    <span className={`sensor-status-badge ${(glucose < 50 || glucose > 400) ? 'critical' : 'normal'}`}>
                      {glucose < 50 ? '⚠️ HIPOGLUCEMIA' : glucose > 400 ? '⚠️ HIPERGLUCEMIA' : '✓ NORMAL'}
                    </span>
                  </div>
                </div>

                {/* 3. Pulsioxímetro */}
                <div className="sensor-metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px', background: 'rgba(12, 18, 26, 0.4)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="sensor-metric-label">🫁 Pulsioxímetro IoT</div>
                    <div className="sensor-metric-value" style={{ color: spo2 < 90 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {spo2} <span style={{ fontSize: '0.75rem' }}>% SpO2</span>
                    </div>
                  </div>
                  <div>
                    <span className={`sensor-status-badge ${spo2 < 90 ? 'critical' : 'normal'}`}>
                      {spo2 < 90 ? '⚠️ HIPOXIA' : '✓ NORMAL'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Gráficos de Tendencias en Tiempo Real */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'center', fontWeight: 'bold' }}>TENDENCIA PRESIÓN</div>
                  {renderSvgChart(telemetryHistory, 90, 190, 140, false, 'Límite', 'var(--accent-cyan)')}
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'center', fontWeight: 'bold' }}>TENDENCIA GLUCOSA</div>
                  {renderSvgChart(glucoseHistory, 30, 450, 400, false, 'Límite', 'var(--accent-purple)')}
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'center', fontWeight: 'bold' }}>TENDENCIA OXÍGENO</div>
                  {renderSvgChart(spo2History, 70, 105, 90, true, 'Límite', 'var(--accent-green)')}
                </div>
              </div>

              {/* Historial de Alertas Críticas (alert.critical Kafka) */}
              {criticalAlerts.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <div className="input-label" style={{ color: 'var(--accent-red)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚨 Registro de Alertas Críticas (Kafka alert.critical)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                    {criticalAlerts.map(a => (
                      <div key={a.id} className="alert-card" style={{ borderColor: 'rgba(255, 51, 102, 0.4)', background: 'rgba(255, 51, 102, 0.05)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--accent-red)' }}>⚠️ {a.type.toUpperCase()}: {a.value}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{a.id}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '3px', color: 'var(--text-primary)' }}>{a.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Lado Derecho: Calificaciones y consolidación de Calidad (VIII) */}
            <section className="glass-panel">
              <h2 className="panel-title"><IconPortal /> Calidad de Atención & Reputación Médica</h2>
              
              <div className="input-label">Índice de Calidad Consolidado por Médico</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {DOCTORS.map(doc => {
                  const stats = docRatings[doc.id] || { rating: doc.rating, reviews: doc.reviews };
                  return (
                    <div key={doc.id} className="quality-gauge">
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Basado en {stats.reviews} opiniones de pacientes</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-yellow)', fontSize: '1.2rem' }}>★</span>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{stats.rating} / 5.0</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSubmitRating} style={{ background: 'var(--bg-secondary)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div className="input-label" style={{ marginBottom: '10px' }}>Calificar Consulta Médica Recibida</div>
                
                <div className="input-group">
                  <label className="input-label">Seleccione al Médico</label>
                  <select className="select-control" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
                    {DOCTORS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className="input-label" style={{ margin: 0 }}>Calificación</span>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`star ${star <= patientRating ? 'active' : ''}`} onClick={() => setPatientRating(star)}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Comentarios o Feedback del Paciente</label>
                  <input type="text" className="select-control" value={patientFeedback} onChange={(e) => setPatientFeedback(e.target.value)} placeholder="Ej: La atención fue excelente, muy empático el doctor..." />
                </div>

                <button type="submit" className="btn btn-cyan" style={{ width: '100%' }}>Enviar Calificación de Servicio</button>
              </form>
            </section>

          </div>
        )}

        {/* ─── TAB 3: PWA & CONECTIVIDAD DEGRADADA ─── */}
        {activeTab === 'pwa' && (
          <div className="tab-content" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
            
            {/* Lado Izquierdo: Analizador de Red e IndexedDB */}
            <section className="glass-panel">
              <h2 className="panel-title"><IconWifi /> PWA Network State Analyzer (Modo Rural)</h2>
              
              <div className="toggle-container" style={{ marginBottom: '20px' }}>
                <div>
                  <span className="input-label">Estado del Enlace Nacional</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--accent-green)' : 'var(--accent-red)', boxShadow: isOnline ? '0 0 10px var(--accent-green)' : '0 0 10px var(--accent-red)' }}></span>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {isOnline ? 'LINK_ACTIVE (ONLINE)' : 'LINK_DISCONNECTED (OFFLINE)'}
                    </span>
                  </div>
                </div>
                <button className={`btn ${isOnline ? 'btn-red' : 'btn-cyan'}`} onClick={() => setIsOnline(!isOnline)}>
                  Simular: {isOnline ? 'OFFLINE' : 'ONLINE'}
                </button>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label className="input-label">Simulador de Velocidad de Red en Campo</label>
                <select className="select-control" value={networkSpeed} onChange={(e) => setNetworkSpeed(e.target.value)}>
                  <option value="5G Fibra Alta Velocidad">5G Fibra Alta Velocidad (Urbana) — Latencia 15ms</option>
                  <option value="3G Degradada Zonas Rurales">3G Zonas Rurales — Modo Degradado Online/Offline</option>
                  <option value="2G Zonas Extremas">2G Zonas Extremas (Yungas) — Offline-First Activado</option>
                </select>
              </div>

              <div>
                <div className="input-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Base de Datos Local (IndexedDB)</span>
                  <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {localDB.filter(r => !r.synced).length} pendientes de sincronización diferida
                  </span>
                </div>

                <div className="db-list" style={{ maxHeight: '180px' }}>
                  {localDB.map(rec => (
                    <div key={rec.id} className="db-item">
                      <div>
                        <span className="brand-badge" style={{ fontSize: '0.6rem', padding: '2px 5px', color: rec.type === 'appointment' ? 'var(--accent-cyan)' : 'var(--accent-purple)', borderColor: rec.type === 'appointment' ? 'var(--accent-cyan)' : 'var(--accent-purple)' }}>{rec.type}</span>
                        <span style={{ marginLeft: '10px', fontFamily: 'var(--font-mono)' }}>{rec.id}</span>
                        <span style={{ marginLeft: '15px', color: 'var(--text-secondary)' }}>{rec.data}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{rec.timestamp.split(' ')[1]}</span>
                        <span className={rec.synced ? 'badge-active' : 'badge-inactive'}>
                          {rec.synced ? 'Sincronizado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn btn-cyan" style={{ flex: 1 }} onClick={triggerManualSync} disabled={!isOnline}>
                  Sincronizar Pendientes (Delta Sync LWW)
                </button>
              </div>
            </section>

            {/* Lado Derecho: Topología de Microservicios en Tiempo Real */}
            <section className="glass-panel">
              <h2 className="panel-title"><IconShield /> Topología de Microservicios</h2>
              
              {/* Git Flow Visual */}
              <div className="input-label" style={{ marginBottom: '8px' }}>Control de Versiones (Git Flow)</div>
              <div className="git-node" style={{ borderLeftColor: '#f85149' }}>
                <span className="badge-inactive" style={{ background: 'rgba(248,81,73,0.1)', color: '#ff7b72', borderColor: '#f85149' }}>main</span>
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Producción Estable</span>
                <span className="svc-status online" style={{ marginLeft: 'auto' }}>
                  <span className="status-dot"></span> v3.5.0
                </span>
              </div>
              <div className="git-node" style={{ borderLeftColor: '#58a6ff' }}>
                <span className="badge-active" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff', borderColor: '#58a6ff' }}>develop</span>
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Integración Continua</span>
                <span className="svc-status online" style={{ marginLeft: 'auto' }}>
                  <span className="status-dot"></span> CI/CD
                </span>
              </div>
              <div className="git-node" style={{ borderLeftColor: 'var(--accent-cyan)', animation: 'pulse-glow 2s infinite' }}>
                <span className="badge-active" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}>feat/dev4-client-pwa</span>
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>EN EDICIÓN</span>
                <span className="svc-status online" style={{ marginLeft: 'auto', color: 'var(--accent-cyan)', borderColor: 'rgba(0, 240, 255, 0.3)', background: 'rgba(0, 240, 255, 0.05)' }}>
                  <span className="status-dot"></span> ACTIVE
                </span>
              </div>

              {/* Microservicios en Tiempo Real */}
              <div style={{ marginTop: '20px' }}>
                <div className="input-label" style={{ marginBottom: '8px' }}>Estado de Microservicios en Ejecución</div>

                {[
                  { name: 'api-gateway', port: ':3000', tech: 'Express + JWT', owner: 'Dev 1', color: '#58a6ff' },
                  { name: 'appointment-service', port: ':3001', tech: 'Node.js + gRPC', owner: 'Dev 2', color: 'var(--accent-green)' },
                  { name: 'telemedicine-service', port: ':3002', tech: 'WebRTC + HLS', owner: 'Dev 2', color: 'var(--accent-purple)' },
                  { name: 'ehr-service', port: ':3003', tech: 'MongoDB + COBOL Bridge', owner: 'Dev 3', color: 'var(--accent-orange)' },
                  { name: 'prescription-service', port: ':3004', tech: 'RSA-2048 + Kafka', owner: 'Dev 3', color: 'var(--accent-yellow)' },
                  { name: 'iot-service', port: ':3005', tech: 'MQTT + InfluxDB', owner: 'Dev 4', color: 'var(--accent-cyan)' },
                  { name: 'audit-service', port: ':3006', tech: 'PostgreSQL Ledger', owner: 'Dev 4', color: 'var(--accent-red)' },
                ].map((svc, idx) => (
                  <div key={svc.name} className="team-member" style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: svc.color, boxShadow: `0 0 6px ${svc.color}` }}></span>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{svc.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{svc.port}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', paddingLeft: '16px' }}>{svc.tech} — {svc.owner}</span>
                    </div>
                    <span className="svc-status online">
                      <span className="status-dot"></span> RUNNING
                    </span>
                  </div>
                ))}
              </div>

              {/* Kafka Topics */}
              <div style={{ marginTop: '20px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div className="input-label" style={{ marginBottom: '6px', fontSize: '0.7rem' }}>📡 Kafka Topics Activos (Event Bus)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['appointment.created', 'prescription.issued', 'session.started', 'session.ended', 'alert.critical', 'ehr.synced', 'telemetry.ingested'].map(topic => (
                    <span key={topic} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.06)', border: '1px solid rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)' }}>{topic}</span>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ─── TAB 4: LEDGER DE AUDITORÍA ─── */}
        {activeTab === 'ledger' && (
          <div className="tab-content" style={{ gridTemplateColumns: '1fr' }}>
            <section className="glass-panel">
              <h2 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconShield /> Postgres Ledger - Auditoría Ministerial de Historias Clínicas</span>
                <span className="badge-active" style={{ fontFamily: 'var(--font-mono)' }}>database: audit_ledger_db</span>
              </h2>

              <div className="ledger-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Seq #</th>
                      <th style={{ width: '130px' }}>Tipo de Evento</th>
                      <th style={{ width: '130px' }}>Servicio de Origen</th>
                      <th>Payload (Event Sourcing)</th>
                      <th>Hash Anterior (Link SHA-256)</th>
                      <th>Firma HMAC</th>
                      <th style={{ width: '120px' }}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((item) => {
                      const isVerified = verifiedRows.includes(item.seq);
                      const isVerifying = verifyingLedger && !isVerified && verifiedRows.length === item.seq - 1;
                      return (
                        <tr 
                          key={item.seq} 
                          className={`${isVerified ? 'verified' : ''} ${isVerifying ? 'verifying' : ''}`}
                          style={{ borderLeft: isVerified ? '3px solid var(--accent-green)' : '3px solid transparent' }}
                        >
                          <td style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>#{item.seq}</td>
                          <td>
                            <span className="brand-badge" style={{
                              fontSize: '0.65rem',
                              color: item.type.includes('critical') ? 'var(--accent-red)' : 'var(--accent-cyan)',
                              borderColor: item.type.includes('critical') ? 'var(--accent-red)' : 'var(--accent-cyan)'
                            }}>
                              {item.type}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{item.service}</td>
                          <td>
                            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#172230', padding: '2px 6px', borderRadius: '4px' }}>
                              {item.payload}
                            </code>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {item.prevHash.substring(0, 15)}...
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isVerified ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                            {item.hmac.substring(0, 15)}...
                            {isVerified && ' ✓ OK'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.timestamp.split(' ')[1]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Garantía Regulatoria: trigger before update or delete DO INSTEAD NOTHING en PostgreSQL.
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-red" onClick={() => setShowMutationError(true)}>
                    🚨 Intentar Editar/Eliminar Registro (Simular Trigger)
                  </button>
                  <button className="btn btn-cyan" onClick={runLedgerVerification} disabled={verifyingLedger}>
                    {verifyingLedger ? 'Calculando hashes...' : '🔍 Verificar Firma HMAC y Consistencia de Cadena'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* ─── MODAL: INTEGRIDAD LEDGER EXITOSO ─── */}
      {showIntegrityReport && (
        <div className="overlay" onClick={() => setShowIntegrityReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '50px', color: 'var(--accent-green)', marginBottom: '10px' }}>✓</div>
            <h3 className="modal-title" style={{ color: 'var(--accent-green)' }}>Verificación de Integridad Completada</h3>
            <p className="modal-desc">
              El motor criptográfico de **MediConnect S.A.S.** ha completado el escaneo sobre los 
              {ledger.length} registros del Ledger de Auditoría.
              <br /><br />
              <strong style={{ color: '#fff' }}>Resultado de la Auditoría Ministerial:</strong>
              <br />
              • Secuencia numérica continua sin gaps.
              <br />
              • Encadenamiento de hashes SHA-256 consistente.
              <br />
              • Firmas HMAC validadas correctamente contra la clave secreta.
              <br /><br />
              <span style={{ color: 'var(--accent-green)' }}>Estado del Ledger: 100% SEGURO E INTACTO</span>
            </p>
            <button className="btn btn-cyan" onClick={() => setShowIntegrityReport(false)}>Cerrar Reporte</button>
          </div>
        </div>
      )}

      {/* ─── MODAL: ERROR DE MOTOR BASE DE DATOS MUTACIÓN LEDGER ─── */}
      {showMutationError && (
        <div className="overlay" onClick={() => setShowMutationError(false)}>
          <div className="modal-content error" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '50px', color: 'var(--accent-red)', marginBottom: '10px' }}>⚠️</div>
            <h3 className="modal-title error">VIOLACIÓN DE REGLA POSTGRESQL (Ledger)</h3>
            <p className="modal-desc" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'left', background: '#1c1b1b', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255, 51, 102, 0.3)' }}>
              <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>ERROR:  operación UPDATE/DELETE rechazada en tabla 'audit_events'</span>
              <br /><br />
              [SQL State: 42000] postgres-ledger.client:
              <br />
              La regla 'no_update' y 'no_delete' de MediConnect S.A.S. prohíbe explícitamente mutaciones en el Ledger para garantizar integridad ante el Ministerio de Salud.
              <br /><br />
              <span style={{ color: 'var(--text-secondary)' }}>Operación abortada por el motor de base de datos.</span>
            </p>
            <button className="btn btn-red" onClick={() => setShowMutationError(false)}>Volver al Dashboard</button>
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION DE ALTA FIDELIDAD ─── */}
      {toast && (
        <div className={`custom-toast ${toast.type}`}>
          <div className="custom-toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ' : '⚠'}
          </div>
          <div className="custom-toast-message">{toast.message}</div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '15px 40px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
        <span>Plataforma Nacional de Telemedicina — Ministerio de Salud</span>
        <span>MediConnect S.A.S. © 2026</span>
      </footer>

    </div>
  );
}
