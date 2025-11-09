export interface Publication {
  _id: string;
  title: string;
 message: string;
  imageUrl?: string;
  //autor: Autor; // El backend nos lo da 'populado'
  likes: string[]; // Por ahora, un array de IDs de usuarios
  isActive: boolean;
  createdAt: string;
  updatedAt: string;  
}