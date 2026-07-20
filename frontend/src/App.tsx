import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApplicationListPage } from './pages/ApplicationListPage';
import { ApplicationFormPage } from './pages/ApplicationFormPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicationListPage />} />
        <Route path="/new" element={<ApplicationFormPage />} />
        <Route path="/edit/:id" element={<ApplicationFormPage />} />
        {/* Detail page will be added in Stage 4 – placeholder for now */}
        <Route path="/detail/:id" element={<div>Application Details (coming soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;