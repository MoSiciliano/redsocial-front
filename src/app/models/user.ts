export interface User {
  _id?: string; // lo devuelve el back, no lo mandás vos
  name: string;
  lastname: string;
  username: string;
  email: string;
  profile: 'user' | 'admin';
  birthdate: string;
  description?: string;
  imageProfile?: string;
  password: string;
}