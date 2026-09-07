export type CheckInChannel = "qr" | "card" | "web";

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  idFormatNote: string;
  faculties: string[];
  libraries: string[];
}

export interface Device {
  id: string;
  studentId: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  status: "approved" | "pending" | "flagged";
  registeredOn: string;
}

export interface Visit {
  id: string;
  studentId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  durationMinutes: number | null;
  deviceId: string | null;
  channel: CheckInChannel;
  library: string;
}

export interface Student {
  id: string;
  institutionId: string;
  admissionNumber: string;
  cardIdentifier: string;
  fullName: string;
  course: string;
  faculty: string;
  year: number;
  email: string;
  devices: Device[];
  visits: Visit[];
}

export interface Kiosk {
  id: string;
  label: string;
  location: string;
  status: "online" | "offline" | "idle";
  lastScan: string;
  scansToday: number;
}