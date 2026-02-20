// web/src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LogOut, ArrowLeft, UserCircle, Briefcase, Mail, ShieldAlert } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  department: string;
}

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('@FleetCare:token');
      if (!token) return navigate('/');

      try {
        const response = await api.get('/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        localStorage.removeItem('@FleetCare:token');
        navigate('/');
      }
    }
    loadProfile();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('@FleetCare:token');
    navigate('/');
  }

  // NOVA TRADUÇÃO DOS CARGOS!
  function translateRole(role: string) {
    const roles: Record<string, string> = {
      SYS_ADMIN: 'Administrador de Sistemas',
      ADMIN: 'Administração',
      MANAGER: 'Gerente',
      MECHANIC: 'Mecânico',
      RECEPTIONIST: 'Recepcionista'
    };
    return roles[role] || role;
  }

  if (!profile) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando perfil...</p>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '24px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E3A8A', color: '#fff', padding: '16px 24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ margin: 0 }}>Meu Perfil</h2>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <LogOut size={20} /> Sair
        </button>
      </header>

      <main style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <UserCircle size={80} color="#1E3A8A" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: 0, color: '#1f2937' }}>{profile.name}</h2>
          <span style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>Oficina Avance</span>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Mail size={20} color="#3b82f6" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>E-mail corporativo</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{profile.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Briefcase size={20} color="#10b981" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Departamento</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{profile.department || 'Não informado'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <ShieldAlert size={20} color="#f59e0b" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Nível de Acesso (Cargo)</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{translateRole(profile.role)}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}