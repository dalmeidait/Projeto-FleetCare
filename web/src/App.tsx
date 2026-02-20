// web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Profile } from './pages/Profile'; // <-- Importamos a tela de Perfil!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/profile" element={<Profile />} /> {/* <-- Rota adicionada! */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;