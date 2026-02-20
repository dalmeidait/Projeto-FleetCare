// web/src/pages/Clients.tsx
import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, LayoutDashboard, Users, Car, Plus, X, Edit, Trash2 } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null); // Para saber se estamos editando

  const [formData, setFormData] = useState({
    name: '', document: '', phone: '', email: ''
  });

  async function fetchClients() {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) return navigate('/');

    try {
      const response = await axios.get('http://localhost:3333/clients', {
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
  }, [navigate]);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData({ name: '', document: '', phone: '', email: '' });
    setIsModalOpen(true);
  }

  function handleOpenEdit(client: Client) {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      document: client.document,
      phone: client.phone,
      email: client.email || ''
    });
    setIsModalOpen(true);
  }

  async function handleSaveClient(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      if (editingId) {
        await axios.put(`http://localhost:3333/clients/${editingId}`, formData, config);
        alert('Cliente atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:3333/clients', formData, config);
        alert('Cliente cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      fetchClients(); 
    } catch (error) {
      alert('Erro ao salvar. Verifique se o CPF/CNPJ ou e-mail já existem.');
      console.error(error);
    }
  }

  async function handleDeleteClient(id: string) {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este cliente?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('@FleetCare:token');
    
    try {
      await axios.delete(`http://localhost:3333/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cliente excluído com sucesso!');
      fetchClients();
    } catch (error) {
      alert('Erro ao excluir. Talvez este cliente ainda tenha veículos cadastrados!');
    }
  }

  function handleLogout() {
    localStorage.removeItem('@FleetCare:token');
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '24px', position: 'relative' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E3A8A', color: '#fff', padding: '16px 24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutDashboard size={28} color="#F59E0B" />
            <h2 style={{ margin: 0 }}>FleetCare Painel</h2>
          </div>
          
          <nav style={{ display: 'flex', gap: '16px', marginLeft: '32px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              <Car size={20} /> Veículos
            </button>
            <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #F59E0B', paddingBottom: '4px' }}>
              <Users size={20} /> Clientes
            </button>
          </nav>
        </div>

        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <LogOut size={20} /> Sair
        </button>
      </header>

      <main style={{ marginTop: '32px', backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="#1E3A8A" />
            <h2 style={{ margin: 0, color: '#1f2937' }}>Clientes Cadastrados</h2>
          </div>
          
          <button 
            onClick={handleOpenCreate}
            style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Carregando clientes...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', color: '#4b5563' }}>Nome / Empresa</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>CPF / CNPJ</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>Telefone</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>E-mail</th>
                <th style={{ padding: '12px', color: '#4b5563', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '12px' }}>{c.document}</td>
                  <td style={{ padding: '12px' }}>{c.phone}</td>
                  <td style={{ padding: '12px' }}>{c.email}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleOpenEdit(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }} title="Editar Cliente"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteClient(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Excluir Cliente"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Nome ou Razão Social" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input placeholder="CPF ou CNPJ (apenas números)" required value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input placeholder="Telefone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input placeholder="E-mail" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', marginTop: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editingId ? 'Salvar Alterações' : 'Salvar Cliente'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}