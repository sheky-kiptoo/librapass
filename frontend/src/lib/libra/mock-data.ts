import type { Device, Institution, Kiosk, Student, Visit, CheckInChannel } from "./types";

export const institution: Institution = {
  id: "inst_daystar",
  name: "Daystar University",
  shortName: "Daystar",
  primaryColor: "#006B3F",
  idFormatNote: "Opaque barcode string, 8–16 chars. Symbology-agnostic (Code 39 / Code 128 / QR).",
  faculties: [
    "School of Science, Engineering & Health",
    "School of Business & Economics",
    "School of Communication",
    "School of Human & Social Sciences",
    "School of Law",
  ],
  libraries: ["Athi River Main Library", "Nairobi Campus Library"],
};

const MAIN_LIBRARY = "Athi River Main Library";
const FACULTIES = institution.faculties as string[];
const faculty = (i: number): string => FACULTIES[i] ?? FACULTIES[0] ?? "General";

function mkVisits(studentId: string, deviceId: string | null): Visit[] {
  const rows: Array<[string, string, string | null, number | null, CheckInChannel]> = [
    ["2026-08-04", "08:42", null, null, "qr"],
    ["2026-08-03", "10:15", "13:05", 170, "card"],
    ["2026-08-01", "09:02", "11:40", 158, "qr"],
    ["2026-07-29", "14:20", "17:55", 215, "web"],
    ["2026-07-27", "08:05", "10:30", 145, "card"],
    ["2026-07-24", "11:10", "12:35", 85, "qr"],
    ["2026-07-21", "15:45", "18:20", 155, "card"],
  ];
  return rows.map(([date, ci, co, dur, channel], i) => ({
    id: `${studentId}_v${i}`,
    studentId,
    date,
    checkIn: ci,
    checkOut: co,
    durationMinutes: dur,
    deviceId: channel === "qr" ? deviceId : i % 2 === 0 ? deviceId : null,
    channel,
    library: MAIN_LIBRARY,
  }));
}

function mkDevices(studentId: string, specs: Array<[string, string, string, Device["status"]]>): Device[] {
  return specs.map(([name, manufacturer, serialNumber, status], i) => ({
    id: `${studentId}_d${i}`,
    studentId,
    name,
    manufacturer,
    serialNumber,
    status,
    registeredOn: "2026-01-14",
  }));
}

export const students: Student[] = [
  {
    id: "stu_1",
    institutionId: institution.id,
    admissionNumber: "21-0455",
    cardIdentifier: "DSU2100455X",
    fullName: "Amina Wanjiru",
    course: "BSc. Computer Science",
    faculty: faculty(0),
    year: 4,
    email: "amina.wanjiru@daystar.ac.ke",
    devices: mkDevices("stu_1", [
      ["Amina's MacBook Air", "Apple", "C02XK1QWJGH5", "approved"],
      ["Study Tablet", "Samsung", "R52T90ZKPLM", "pending"],
    ]),
    visits: mkVisits("stu_1", "stu_1_d0"),
  },
  {
    id: "stu_2",
    institutionId: institution.id,
    admissionNumber: "22-1180",
    cardIdentifier: "DSU2211800B",
    fullName: "Brian Otieno",
    course: "BCom. Finance",
    faculty: faculty(1),
    year: 3,
    email: "brian.otieno@daystar.ac.ke",
    devices: mkDevices("stu_2", [["Lenovo ThinkPad E14", "Lenovo", "PF3K92LM", "approved"]]),
    visits: mkVisits("stu_2", "stu_2_d0"),
  },
  {
    id: "stu_3",
    institutionId: institution.id,
    admissionNumber: "23-0902",
    cardIdentifier: "DSU2309022M",
    fullName: "Cynthia Mueni",
    course: "BA. Communication",
    faculty: faculty(2),
    year: 2,
    email: "cynthia.mueni@daystar.ac.ke",
    devices: [],
    visits: mkVisits("stu_3", null),
  },
  {
    id: "stu_4",
    institutionId: institution.id,
    admissionNumber: "20-0331",
    cardIdentifier: "DSU2003317K",
    fullName: "Daniel Kiprop",
    course: "LLB. Law",
    faculty: faculty(4),
    year: 4,
    email: "daniel.kiprop@daystar.ac.ke",
    devices: mkDevices("stu_4", [["Dell Latitude 5430", "Dell", "8HTQ4F3", "flagged"]]),
    visits: mkVisits("stu_4", "stu_4_d0"),
  },
  {
    id: "stu_5",
    institutionId: institution.id,
    admissionNumber: "22-0774",
    cardIdentifier: "DSU2207746N",
    fullName: "Esther Njeri",
    course: "BSc. Nursing",
    faculty: faculty(0),
    year: 3,
    email: "esther.njeri@daystar.ac.ke",
    devices: mkDevices("stu_5", [["HP Pavilion 14", "HP", "5CD1234ABC", "approved"]]),
    visits: mkVisits("stu_5", "stu_5_d0"),
  },
];

export const currentStudent: Student = students[0] as Student;
export const currentSession = {
  active: true,
  checkedInAt: "08:42 AM",
  channel: "qr" as CheckInChannel,
  library: MAIN_LIBRARY,
  deviceId: "stu_1_d0",
};

export const kiosks: Kiosk[] = [
  { id: "k1", label: "Kiosk A", location: "Main Entrance — Turnstile 1", status: "online", lastScan: "2 min ago", scansToday: 148 },
  { id: "k2", label: "Kiosk B", location: "Main Entrance — Turnstile 2", status: "online", lastScan: "just now", scansToday: 121 },
  { id: "k3", label: "Librarian Desk", location: "Ground Floor Help Desk", status: "idle", lastScan: "26 min ago", scansToday: 39 },
  { id: "k4", label: "Kiosk C", location: "Nairobi Campus Library", status: "offline", lastScan: "Yesterday, 6:10 PM", scansToday: 0 },
];

export const hourlyCheckIns = [
  { hour: "8 AM", checkIns: 34 },
  { hour: "9 AM", checkIns: 62 },
  { hour: "10 AM", checkIns: 88 },
  { hour: "11 AM", checkIns: 104 },
  { hour: "12 PM", checkIns: 71 },
  { hour: "1 PM", checkIns: 58 },
  { hour: "2 PM", checkIns: 96 },
  { hour: "3 PM", checkIns: 112 },
  { hour: "4 PM", checkIns: 84 },
  { hour: "5 PM", checkIns: 47 },
];

export const weeklyVisits = [
  { day: "Mon", visits: 412 },
  { day: "Tue", visits: 486 },
  { day: "Wed", visits: 521 },
  { day: "Thu", visits: 468 },
  { day: "Fri", visits: 390 },
  { day: "Sat", visits: 218 },
  { day: "Sun", visits: 96 },
];

export const facultyUsage = [
  { faculty: "Science", visits: 320 },
  { faculty: "Business", visits: 265 },
  { faculty: "Comms", visits: 198 },
  { faculty: "Social Sci.", visits: 154 },
  { faculty: "Law", visits: 121 },
];

export const deviceRegistrations = [
  { month: "Mar", devices: 120 },
  { month: "Apr", devices: 168 },
  { month: "May", devices: 205 },
  { month: "Jun", devices: 244 },
  { month: "Jul", devices: 301 },
  { month: "Aug", devices: 338 },
];

export const channelSplit: Array<{ channel: CheckInChannel; label: string; value: number }> = [
  { channel: "qr", label: "QR (phone)", value: 268 },
  { channel: "card", label: "ID card scan", value: 174 },
  { channel: "web", label: "Web login", value: 62 },
];

export interface ActivityRow {
  id: string;
  student: string;
  admissionNumber: string;
  action: "Check In" | "Check Out";
  time: string;
  device: string;
  channel: CheckInChannel;
}

export const recentActivity: ActivityRow[] = [
  { id: "a1", student: "Amina Wanjiru", admissionNumber: "21-0455", action: "Check In", time: "08:42 AM", device: "MacBook Air", channel: "qr" },
  { id: "a2", student: "Brian Otieno", admissionNumber: "22-1180", action: "Check In", time: "08:47 AM", device: "ThinkPad E14", channel: "card" },
  { id: "a3", student: "Cynthia Mueni", admissionNumber: "23-0902", action: "Check In", time: "09:03 AM", device: "—", channel: "web" },
  { id: "a4", student: "Daniel Kiprop", admissionNumber: "20-0331", action: "Check Out", time: "09:15 AM", device: "Latitude 5430", channel: "card" },
  { id: "a5", student: "Esther Njeri", admissionNumber: "22-0774", action: "Check In", time: "09:21 AM", device: "Pavilion 14", channel: "qr" },
  { id: "a6", student: "Amina Wanjiru", admissionNumber: "21-0455", action: "Check Out", time: "09:40 AM", device: "MacBook Air", channel: "qr" },
];

export const dashboardStats = {
  visitorsToday: 504,
  currentlyInside: 137,
  registeredDevices: 338,
  peakHour: "3:00 PM",
  averageVisit: "1h 52m",
  todayByChannel: { qr: 268, card: 174, web: 62 },
};

export function findStudentByCard(card: string): Student | undefined {
  const normalized = card.trim().toUpperCase();
  return students.find((s) => s.cardIdentifier.toUpperCase() === normalized);
}

export function findStudentByAdmission(adm: string): Student | undefined {
  const normalized = adm.trim().toLowerCase();
  return students.find((s) => s.admissionNumber.toLowerCase() === normalized);
}