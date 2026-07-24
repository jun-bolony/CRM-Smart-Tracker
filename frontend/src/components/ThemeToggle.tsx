// frontend/src/components/ThemeToggle.tsx
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeContext();
  return (
    <IconButton color="inherit" onClick={toggleTheme}>
      {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};