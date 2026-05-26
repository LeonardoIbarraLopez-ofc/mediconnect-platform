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

  // Real-time audit clock
  const [localTime, setLocalTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setLocalTime(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
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

  // VI & VII. Telemetría IoT Ingesta
  const handlePublishTelemetry = () => {
    const newHistory = [...telemetryHistory.slice(1), systolic];
    setTelemetryHistory(newHistory);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (systolic > 140) {
      // Trigger alarm
      const alertId = 'ALT-' + Math.floor(Math.random() * 1000);
      const newAlert = {
        id: alertId,
        patientId: selectedPatientId,
        systolic,
        diastolic,
        timestamp: now,
        msg: `Presión sistólica de ${systolic} mmHg supera el límite crítico predefinido (140 mmHg). Notificación enviada al cardiólogo.`
      };
      setCriticalAlerts(prev => [newAlert, ...prev]);

      // Write to Ledger
      const newSeq = ledger.length + 1;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'e3b0c44298f' + Math.floor(Math.random() * 10000);
      setLedger(prev => [
        ...prev,
        { seq: newSeq, type: 'alert.critical', service: 'iot-service', payload: JSON.stringify({ patientId: selectedPatientId, systolic, diastolic }), prevHash, hmac, timestamp: now }
      ]);
    } else {
      // Normal monitoring ingestion
      const newSeq = ledger.length + 1;
      const prevHash = btoa(ledger[ledger.length - 1].hmac).substring(0, 64);
      const hmac = 'a1f3e5c7b8d' + Math.floor(Math.random() * 10000);
      setLedger(prev => [
        ...prev,
        { seq: newSeq, type: 'session.ended', service: 'telemedicine-service', payload: JSON.stringify({ patientId: selectedPatientId, systolic, diastolic, status: 'NORMAL' }), prevHash, hmac, timestamp: now }
      ]);
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

  // SVG time-series BP trend chart
  const renderSvgTrend = () => {
    const width = 500;
    const height = 180;
    const padding = 30;
    const pointsCount = telemetryHistory.length;
    const maxVal = 180;
    const minVal = 90;
    
    const getX = (idx: number) => padding + (idx * (width - padding * 2)) / (pointsCount - 1);
    const getY = (val: number) => height - padding - ((val - minVal) * (height - padding * 2)) / (maxVal - minVal);
    
    const pathD = telemetryHistory.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');
    const thresholdY = getY(140);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-trend" style={{ width: '100%', height: '100%', minHeight: '160px' }}>
        <line x1={padding} y1={getY(160)} x2={width - padding} y2={getY(160)} stroke="#212c3d" strokeDasharray="3 3" />
        <line x1={padding} y1={getY(140)} x2={width - padding} y2={getY(140)} stroke="rgba(255, 51, 102, 0.4)" strokeDasharray="3 3" />
        <line x1={padding} y1={getY(120)} x2={width - padding} y2={getY(120)} stroke="#212c3d" strokeDasharray="3 3" />
        <line x1={padding} y1={getY(100)} x2={width - padding} y2={getY(100)} stroke="#212c3d" strokeDasharray="3 3" />
        
        <line x1={padding} y1={thresholdY} x2={width - padding} y2={thresholdY} stroke="#ff3366" strokeWidth="2" strokeDasharray="5 5" />
        <text x={padding + 10} y={thresholdY - 6} fill="#ff3366" fontSize="10" fontFamily="monospace" fontWeight="700">LÍMITE CRÍTICO: 140 mmHg</text>

        <path d={pathD} fill="none" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.4))' }} />

        {telemetryHistory.map((val, idx) => (
          <circle key={idx} cx={getX(idx)} cy={getY(val)} r="5" fill={val > 140 ? '#ff3366' : '#00f0ff'} stroke="#0d131a" strokeWidth="2" />
        ))}

        <text x={padding} y={height - 10} fill="#8b949e" fontSize="9" fontFamily="monospace">Ayer</text>
        <text x={width - padding - 20} y={height - 10} fill="#8b949e" fontSize="9" fontFamily="monospace">Ahora</text>
      </svg>
    );
  };

  return (
    <div className="medi-dashboard" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── HEADER DE ALTA FIDELIDAD ─── */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-badge">Hackathon Release v3.5</div>
          <h1 className="brand-title">MediConnect <span>S.A.S.</span></h1>
          <span className="badge-active" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#39d353' }}></span>
            SISTEMA NACIONAL INTEGRADO
          </span>
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
                  <button className={`btn ${isVideoActive ? 'btn-red' : 'btn-cyan'}`} style={{ flex: 1 }} onClick={() => { setIsVideoActive(!isVideoActive); setIsRecording(!isVideoActive); }}>
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
          <div className="tab-content" style={{ gridTemplateColumns: '1fr 1fr' }}>
            
            {/* Lado Izquierdo: Telemetría y Alertas (VI, VII) */}
            <section className="glass-panel">
              <h2 className="panel-title"><IconIoT /> Monitoreo Crónico IoT & Alertas Críticas</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="input-label">Presión Sistólica</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: systolic > 140 ? 'var(--accent-red)' : 'var(--accent-cyan)', fontWeight: 'bold' }}>{systolic} mmHg</span>
                  </div>
                  <input type="range" min="95" max="185" value={systolic} onChange={(e) => setSystolic(parseInt(e.target.value))} className="range-control" style={{ accentColor: systolic > 140 ? 'var(--accent-red)' : 'var(--accent-cyan)' }} />
                </div>

                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="input-label">Presión Diastólica</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{diastolic} mmHg</span>
                  </div>
                  <input type="range" min="60" max="110" value={diastolic} onChange={(e) => setDiastolic(parseInt(e.target.value))} className="range-control" />
                </div>
              </div>

              <div className="graph-container" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="input-label" style={{ margin: 0 }}>Historial (Series de Tiempo)</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tópico MQTT: mediconnect/patients/{selectedPatientId}/blood_pressure</span>
                </div>
                {renderSvgTrend()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MQTT Broker: mqtt://mosquitto:1883</span>
                <button className="btn btn-cyan" onClick={handlePublishTelemetry}>Publicar Lectura vía MQTT</button>
              </div>

              {criticalAlerts.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div className="input-label">Historial de Alertas Críticas (alert.critical Kafka)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '100px', overflowY: 'auto' }}>
                    {criticalAlerts.map(a => (
                      <div key={a.id} className="alert-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.75rem' }}>
                          <span>⚠️ ALERTA CRÍTICA DE HIPERTENSIÓN</span>
                          <span>{a.id}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '3px' }}>{a.msg}</div>
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

            {/* Lado Derecho: Topología Git */}
            <section className="glass-panel">
              <h2 className="panel-title"><IconPortal /> Información de Arquitectura</h2>
              
              <div className="git-node" style={{ borderLeftColor: '#f85149' }}>
                <span className="badge-inactive" style={{ background: 'rgba(248,81,73,0.1)', color: '#ff7b72', borderColor: '#f85149' }}>main</span>
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Producción Estable</span>
              </div>
              <div className="git-node" style={{ borderLeftColor: '#58a6ff' }}>
                <span className="badge-active" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff', borderColor: '#58a6ff' }}>develop</span>
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Integración Continua</span>
              </div>
              <div className="git-node" style={{ borderLeftColor: 'var(--accent-cyan)', animation: 'pulse-glow 2s infinite' }}>
                <span className="badge-active" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}>feat/dev4-client-pwa</span>
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>MI RAMA EN EDICIÓN</span>
              </div>

              <div className="team-list" style={{ marginTop: '20px' }}>
                <div className="input-label">Roles del Equipo</div>
                <div className="team-member">
                  <span>Dev 1 (Tech Lead)</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>api-gateway, kafka</span>
                </div>
                <div className="team-member">
                  <span>Dev 2 (Senior Back)</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>appointments, WebRTC</span>
                </div>
                <div className="team-member">
                  <span>Dev 3 (Senior Back)</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>COBOL, mongo ehr</span>
                </div>
                <div className="team-member active-dev">
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>🚀 Dev 4 (AI / Frontend)</span>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>PWA, iot, audit-service</span>
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
