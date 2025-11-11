import { User } from './user';

export type ReactionType = 'heart' | 'rocket' | 'doubt';
export interface Publication {
  _id: string;
  title: string;
  message: string;
  imageUrl?: string;
  autor: User; 
  comments: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hearts: string[];
  rockets: string[];
  doubts: string[];
  heartCount: number;
  rocketCount: number;
  doubtCount: number;
}
