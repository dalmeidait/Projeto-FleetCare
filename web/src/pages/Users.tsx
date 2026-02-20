// web/src/pages/Users.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import { LogOut, LayoutDashboard, Users as UsersIcon, Car, ShieldAlert, Edit, Key, UserCircle, CheckCircle, XCircle, ClipboardList } from 'lucide-react'; 

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

export function Users() {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'MECHANIC', department: '', isActive: true
  });
  const [newPassword, setNewPassword] = useState('');

  async function fetchUsers() {
    const token = localStorage.getItem('@FleetCare:token');
    try {
      const response = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) { navigate('/'); return; } // CORREÇÃO DO TYPESCRIPT AQUI

    api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setUserName(response.data.name);
        setUserRole(response.data.role);
        
        if (response.data.role !== 'SYS_ADMIN') {
          alert('Acesso negado. Apenas o Administrador de Sistemas pode acessar esta tela.');
          navigate('/dashboard');
        } else {
          fetchUsers();
        }
      })
      .catch(() => {
        localStorage.removeItem('@FleetCare:token');
        navigate('/');
      });
  }, [navigate]);

  function translateRole(role: string) {
    const roles: Record<string, string> = {
      SYS_ADMIN: 'Admin. de Sistemas',
      ADMIN: 'Administração',
      MANAGER: 'Gerência',
      MECHANIC: 'Mecânico',
      RECEPTIONIST: 'Recepção'
    };
    return roles[role] || role;
  }

  function handleOpenCreate() {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'MECHANIC', department: '', isActive: true });
    setIsModalOpen(true);
  }

  function handleOpenEdit(u: User) {
    setEditingId(u.id);
    setFormData({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '', isActive: u.isActive });
    setIsModalOpen(true);
  }

  function handleOpenPassword(id: string) {
    setEditingId(id);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  }

  async function handleSaveUser(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      if (editingId) {
        const payload = { ...formData };
        await api.put(`/users/${editingId}`, payload, config);
        alert('Usuário atualizado!');
      } else {
        if (!formData.password || formData.password.length < 6) return alert("A senha deve ter no mínimo 6 caracteres!");
        await api.post('/users', formData, config);
        alert('Usuário criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar usuário.');
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.patch(`/users/${editingId}/password`, { newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Senha alterada com sucesso!');
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao alterar a senha.');
    }
  }

  if (userRole !== 'SYS_ADMIN') return <p style={{textAlign: 'center', marginTop: '50px'}}>Verificando permissões...</p>;

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
            <button onClick={() => navigate('/clients')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><UsersIcon size={20} /> Clientes</button>
            <button onClick={() => navigate('/work-orders')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Ordens de Serviço</button>
            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={20} /> Equipe</button>
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <UserCircle size={24} color="#10b981" /> {userName}
          </button>
          <button onClick={() => { localStorage.removeItem('@FleetCare:token'); navigate('/'); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </header>

      <main style={{ marginTop: '32px', backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Gestão de Acessos (Equipe)</h2>
          <button onClick={handleOpenCreate} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Novo Funcionário</button>
        </div>

        {loading ? <p>Carregando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px' }}>Nome</th>
                <th style={{ padding: '12px' }}>Cargo / Depto</th>
                <th style={{ padding: '12px' }}>E-mail</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee', backgroundColor: u.isActive ? 'transparent' : '#fef2f2' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: u.isActive ? '#1f2937' : '#9ca3af' }}>{u.name}</td>
                  <td style={{ padding: '12px', color: u.isActive ? '#1f2937' : '#9ca3af' }}>{translateRole(u.role)} <br/><span style={{fontSize: '12px', color: '#6b7280'}}>{u.department}</span></td>
                  <td style={{ padding: '12px', color: u.isActive ? '#1f2937' : '#9ca3af' }}>{u.email}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {/* CORREÇÃO DO TYPESCRIPT AQUI (SPAN ENVOLVENDO O ÍCONE) */}
                    {u.isActive ? <span title="Ativo"><CheckCircle size={20} color="#10b981" /></span> : <span title="Inativo"><XCircle size={20} color="#ef4444" /></span>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => handleOpenEdit(u)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }} title="Editar"><Edit size={18}/></button>
                    <button onClick={() => handleOpenPassword(u.id)} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }} title="Trocar Senha"><Key size={18}/></button>
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
            <h3>{editingId ? 'Editar' : 'Novo'} Funcionário</h3>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Nome Completo" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px' }} />
              <input placeholder="E-mail (Login)" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '10px' }} />
              
              {!editingId && (
                <input placeholder="Senha provisória (mínimo 6)" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '10px' }} />
              )}

              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ padding: '10px' }}>
                <option value="MECHANIC">Mecânico</option>
                <option value="RECEPTIONIST">Recepção</option>
                <option value="ADMIN">Administração</option>
                <option value="MANAGER">Gerência</option>
                <option value="SYS_ADMIN">Administrador de Sistemas</option>
              </select>

              <input placeholder="Departamento (Ex: Oficina, Diretoria)" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ padding: '10px' }} />
              
              {editingId && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  Funcionário Ativo no Sistema
                </label>
              )}

              <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Salvar</button>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3>Alterar Senha do Usuário</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Nova Senha (mínimo 6)" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: '10px' }} />
              <button type="submit" style={{ background: '#f59e0b', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Redefinir Senha</button>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}