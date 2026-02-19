// web/src/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();

  // Função para deslogar
  function handleLogout() {
    localStorage.removeItem('@FleetCare:token'); // Joga o crachá fora
    navigate('/'); // Manda de volta pro login
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '24px' }}>
      
      {/* Cabeçalho do Dashboard */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E3A8A', color: '#fff', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard size={28} color="#F59E0B" />
          <h2 style={{ margin: 0 }}>FleetCare Painel</h2>
        </div>
        
        <button 
          onClick={handleLogout} 
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}
        >
          <LogOut size={20} />
          Sair
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main style={{ marginTop: '32px' }}>
        <h1 style={{ color: '#1f2937' }}>Bem-vindo ao Sistema!</h1>
        <p style={{ color: '#6b7280', fontSize: '18px', marginTop: '8px' }}>
          Aqui você verá os gráficos, listas de veículos e ordens de serviço.
        </p>
      </main>

    </div>
  );
}