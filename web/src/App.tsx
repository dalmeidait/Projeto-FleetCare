// web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients'; // <-- 1. Importamos a nossa nova tela!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} /> {/* <-- 2. Criamos o caminho para ela! */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;