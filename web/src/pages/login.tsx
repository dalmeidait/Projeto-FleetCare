// web/src/pages/Login.tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Ferramenta de teletransporte

  async function handleLogin(e: FormEvent) {
    e.preventDefault(); // Evita que a página recarregue
    setError('');

    try {
      // Fazendo a chamada para o seu Backend!
      const response = await axios.post('http://localhost:3333/login', {
        email,
        password
      });

      const { token } = response.data;

      // Salvando o "crachá" no navegador
      localStorage.setItem('@FleetCare:token', token);

      // Manda o usuário para o dashboard!
      navigate('/dashboard'); 

    } catch (err) {
      setError('E-mail ou senha incorretos.');
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <Truck size={48} color="#1E3A8A" />
          <h1 style={{ color: '#1E3A8A', marginTop: '16px' }}>FleetCare</h1>
          <p style={{ color: '#6b7280' }}>Gestão de Frotas</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" 
            placeholder="Seu e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input 
            type="password" 
            placeholder="Sua senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />

          {error && <span style={{ color: 'red', fontSize: '14px' }}>{error}</span>}

          <button 
            type="submit" 
            style={{ background: '#F59E0B', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            Entrar no Sistema
          </button>
        </form>

      </div>
    </div>
  );
}

