export interface Note {
  id: string;
  title: string;
  content: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}