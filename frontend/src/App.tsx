import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApplicationListPage } from './pages/ApplicationListPage';
import { ApplicationFormPage } from './pages/ApplicationFormPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicationListPage />} />
        <Route path="/new" element={<ApplicationFormPage />} />
        <Route path="/edit/:id" element={<ApplicationFormPage />} />
        <Route path="/detail/:id" element={<ApplicationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;