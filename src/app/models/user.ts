export interface User {
  _id: string; 
  name: string;
  lastname: string;
  username: string;
  email: string;
  profile: 'user' | 'admin';
  birthdate: string;
  description?: string;
  imageProfile?: string;
  password: string;
  rol: 'usuario' | 'administrador';
  createdAt: string;
}