// web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Profile } from './pages/Profile';
import { Users } from './pages/Users'; // <-- Importamos a tela de Equipe

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} /> {/* <-- Nova Rota! */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;