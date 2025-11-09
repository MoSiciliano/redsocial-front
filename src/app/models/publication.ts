import { User } from './user';

export interface Publication {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  autor: User;
  likes: string[]; 
  comments: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
