// web/src/pages/Clients.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
// IMPORTAÇÃO NOVA: Adicionamos o ClipboardList aqui embaixo!
import { LogOut, LayoutDashboard, Users, Car, Edit, Trash2, UserCircle, ShieldAlert, ClipboardList } from 'lucide-react'; 

interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
}

export function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(''); 

  const [formData, setFormData] = useState({
    name: '', document: '', phone: '', email: ''
  });

  async function fetchClients() {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) return navigate('/');

    try {
      const response = await api.get('/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();

    const token = localStorage.getItem('@FleetCare:token');
    if (token) {
      api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          setUserName(response.data.name);
          setUserRole(response.data.role); 
        })
        .catch(() => console.error("Erro ao buscar usuário logado"));
    }
  }, [navigate]);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData({ name: '', document: '', phone: '', email: '' });
    setIsModalOpen(true);
  }

  function handleOpenEdit(client: Client) {
    setEditingId(client.id);
    setFormData({ name: client.name, document: client.document, phone: client.phone, email: client.email || '' });
    setIsModalOpen(true);
  }

  async function handleSaveClient(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData, config);
        alert('Cliente atualizado!');
      } else {
        await api.post('/clients', formData, config);
        alert('Cliente cadastrado!');
      }
      setIsModalOpen(false);
      fetchClients(); 
    } catch (error) {
      alert('Erro ao salvar cliente.');
    }
  }

  async function handleDeleteClient(id: string) {
    if (!window.confirm("Deseja excluir este cliente?")) return;
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.delete(`/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchClients();
    } catch (error) {
      alert('Erro ao excluir. Verifique se existem veículos vinculados.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E3A8A', color: '#fff', padding: '16px 24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutDashboard size={28} color="#F59E0B" />
            <h2 style={{ margin: 0 }}>FleetCare</h2>
          </div>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={20} /> Veículos</button>
            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Clientes</button>
            
            {/* NOVO BOTÃO DE ORDENS DE SERVIÇO AQUI */}
            <button onClick={() => navigate('/work-orders')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Ordens de Serviço</button>
            
            {userRole === 'SYS_ADMIN' && (
              <button onClick={() => navigate('/users')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={20} /> Equipe</button>
            )}
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }} title="Ver meu perfil">
            <UserCircle size={24} color="#10b981" />
            {userName || 'Carregando...'}
          </button>
          <button onClick={() => { localStorage.removeItem('@FleetCare:token'); navigate('/'); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </header>

      <main style={{ marginTop: '32px', backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Gestão de Clientes</h2>
          {['SYS_ADMIN', 'ADMIN', 'MANAGER', 'ADMIN_AUX', 'RECEPTIONIST'].includes(userRole) && (
            <button onClick={handleOpenCreate} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Novo Cliente</button>
          )}
        </div>

        {loading ? <p>Carregando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px' }}>Nome</th>
                <th style={{ padding: '12px' }}>Documento</th>
                <th style={{ padding: '12px' }}>Contato</th>
                <th style={{ padding: '12px' }}>E-mail</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '12px' }}>{c.document}</td>
                  <td style={{ padding: '12px' }}>{c.phone}</td>
                  <td style={{ padding: '12px' }}>{c.email || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {['SYS_ADMIN', 'ADMIN', 'MANAGER', 'ADMIN_AUX', 'RECEPTIONIST'].includes(userRole) ? (
                      <>
                        <button onClick={() => handleOpenEdit(c)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={18}/></button>
                        <button onClick={() => handleDeleteClient(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18}/></button>
                      </>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '14px' }}>Sem permissão</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3>{editingId ? 'Editar' : 'Novo'} Cliente</h3>
            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Nome / Razão Social" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="CPF / CNPJ" required value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="Telefone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="E-mail" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '10px' }} />
              <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer' }}>Salvar</button>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}