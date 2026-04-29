export interface ParentChild {
  _id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  isActive?: boolean;
}
