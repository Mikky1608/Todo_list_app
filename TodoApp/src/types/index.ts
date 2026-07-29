export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  email: string;
  token: string;
}

export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
export type StatusFilter = 'all' | 'pending' | 'completed';
