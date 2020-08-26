export class User {
  email: string;
  password: string;
}

export class currentUser {
  createdAt: Date;
  email: string;
  id: number;
  permission: string;
  role: string;
  cmp: string;
  room: string;
  status: string;
}

export class Provider {
  connection: boolean;
  createdAt: Date;
  email: string;
  cmp: string;
  firstName: string;
  image: string;
  lastName: string;
  password: string;
  permission: string;
  phoneNumber: string;
  role: string;
  room: string;
  status: string;
  updatedAt: Date;
  _id: string;
  socketId: string;
  peerId: string;
}

export class Patient {
  connection: boolean;
  dni: string;
  email: string;
  phoneNumber: string;
  providerId: string;
  record: string;
  room: string;
  fullName: string;
  calling: boolean;
  _id: string;;
  socketId: string;
  peerId: string;
}

export class Consult {  
  patientId: String;
  providerId : String;
  dni: String;
  birthDate: number;
  allergy: Object;
  complain: Object;
  timeOfDisease: Object;
  wayOfStart: Object;
  symptom: Object;
  historyId: Object;
  subjective: Object;
  objective: Object;
  assessment: Object;
  plan: Object;
  files: Object;
  createDate: Date;
  patient: Object;
  _id: String;
}