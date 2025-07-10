export interface Segment {
  id: number;
  name: string;
  color: 'white' | 'blue' | 'yellow' | 'red';
}

export const BULLSEYE_SEGMENTS: Segment[] = [
  { id: 1,  name: 'Basal Anterior',      color: 'white' },
  { id: 2,  name: 'Basal Anteroseptal',  color: 'white' },
  { id: 3,  name: 'Basal Inferoseptal',  color: 'white' },
  { id: 4,  name: 'Basal Inferior',      color: 'white' },
  { id: 5,  name: 'Basal Inferolateral', color: 'white' },
  { id: 6,  name: 'Basal Anterolateral', color: 'white' },
  { id: 7,  name: 'Mid Anterior',        color: 'white' },
  { id: 8,  name: 'Mid Anteroseptal',    color: 'white' },
  { id: 9,  name: 'Mid Inferoseptal',    color: 'white' },
  { id: 10, name: 'Mid Inferior',        color: 'white' },
  { id: 11, name: 'Mid Inferolateral',   color: 'white' },
  { id: 12, name: 'Mid Anterolateral',   color: 'white' },
  { id: 13, name: 'Apical Anterior',     color: 'white' },
  { id: 14, name: 'Apical Septal',       color: 'white' },
  { id: 15, name: 'Apical Inferior',     color: 'white' },
  { id: 16, name: 'Apical Lateral',      color: 'white' },
  { id: 17, name: 'Apex',                color: 'white' }
];
