// web/src/pages/Login.tsx
import { useState, type FormEvent } from 'react'; // <-- A correção está aqui: type FormEvent
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import { Truck } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/login', {
        email,
        password
      });

      const { token } = response.data;
      localStorage.setItem('@FleetCare:token', token);
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Erro no login:", err);
      setError('E-mail ou senha incorretos ou servidor offline.');
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <Truck size={48} color="#1E3A8A" />
          <h1 style={{ color: '#1E3A8A', marginTop: '16px', fontSize: '24px', fontWeight: 'bold' }}>FleetCare</h1>
          <p style={{ color: '#6b7280' }}>Gestão de Frotas</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" 
            placeholder="Seu e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
            required
          />
          <input 
            type="password" 
            placeholder="Sua senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
            required
          />

          {error && <span style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{error}</span>}

          <button 
            type="submit" 
            style={{ background: '#F59E0B', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'background 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#d97706')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#F59E0B')}
          >
            Entrar no Sistema
          </button>
        </form>

      </div>
    </div>
  );
}