// frontend/src/styles/scrollbar.ts
import type { SxProps } from '@mui/material';

export const scrollbarSx: SxProps = {
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: '8px',
    border: '2px solid #f1f1f1',
    backgroundClip: 'padding-box',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#a8a8a8',
  },
  scrollbarWidth: 'thin',
  scrollbarColor: '#c1c1c1 #f1f1f1',
};