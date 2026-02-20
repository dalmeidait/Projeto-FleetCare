// web/src/pages/Dashboard.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import { LogOut, LayoutDashboard, Car, Edit, Trash2, Users, UserCircle, ShieldAlert, ClipboardList } from 'lucide-react'; 

interface Client {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  plate: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  client: { name: string };
  clientId: string; 
}

export function Dashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const [formData, setFormData] = useState({
    plate: '', vin: '', brand: '', model: '', year: '', fuelType: 'COMBUSTION', clientId: ''
  });

  async function fetchVehicles() {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) { navigate('/'); return; }

    try {
      const response = await api.get('/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error("Erro ao buscar veículos", error);
    }
  }

  async function fetchClients() {
    const token = localStorage.getItem('@FleetCare:token');
    try {
      const response = await api.get('/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
    }
  }

  useEffect(() => {
    fetchVehicles();
    fetchClients().finally(() => setLoading(false));

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
    setFormData({ plate: '', vin: '', brand: '', model: '', year: '', fuelType: 'COMBUSTION', clientId: '' });
    setIsModalOpen(true);
  }

  function handleOpenEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setFormData({
      plate: vehicle.plate,
      vin: vehicle.vin || '', 
      brand: vehicle.brand,
      model: vehicle.model,
      year: String(vehicle.year),
      fuelType: vehicle.fuelType,
      clientId: vehicle.clientId 
    });
    setIsModalOpen(true);
  }

  async function handleSaveVehicle(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    if (!formData.clientId) return alert("Selecione o dono!");

    try {
      const payload = { ...formData, year: Number(formData.year) };
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload, config);
        alert('Veículo atualizado!');
      } else {
        await api.post('/vehicles', payload, config);
        alert('Veículo cadastrado!');
      }

      setIsModalOpen(false);
      fetchVehicles();
    } catch (error) {
      alert('Erro ao salvar veículo.');
    }
  }

  async function handleDeleteVehicle(id: string) {
    if (!window.confirm("Excluir veículo?")) return;
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.delete(`/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVehicles();
    } catch (error) {
      alert('Erro ao excluir.');
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
            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={20} /> Veículos</button>
            <button onClick={() => navigate('/clients')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Clientes</button>
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
          <h2 style={{ margin: 0 }}>Frota</h2>
          {/* ALTERAÇÃO AQUI: Troquei MECHANIC por RECEPTIONIST */}
          {['SYS_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(userRole) && (
            <button onClick={handleOpenCreate} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Novo Veículo</button>
          )}
        </div>

        {loading ? <p>Carregando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px' }}>Placa</th>
                <th style={{ padding: '12px' }}>Marca</th>
                <th style={{ padding: '12px' }}>Modelo</th>
                <th style={{ padding: '12px' }}>Dono</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{v.plate}</td>
                  <td style={{ padding: '12px' }}>{v.brand}</td>
                  <td style={{ padding: '12px' }}>{v.model}</td>
                  <td style={{ padding: '12px' }}>{v.client?.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {/* ALTERAÇÃO AQUI TAMBÉM: Recepção agora pode editar na tabela principal */}
                    {['SYS_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(userRole) ? (
                      <>
                        <button onClick={() => handleOpenEdit(v)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}><Edit size={18}/></button>
                        <button onClick={() => handleDeleteVehicle(v.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18}/></button>
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
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '500px' }}>
            <h3>{editingId ? 'Editar' : 'Cadastrar'} Veículo</h3>
            <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
                <option value="">Selecione o Dono...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input placeholder="Placa" required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
              <input placeholder="Chassi (VIN)" required value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
              <input placeholder="Marca" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
              <input placeholder="Modelo" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
              
              <select required value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
                <option value="COMBUSTION">Combustão (Flex/Gasolina/Etanol)</option>
                <option value="ELECTRIC">Elétrico</option>
                <option value="HYBRID">Híbrido</option>
              </select>

              <input placeholder="Ano" type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
              <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Salvar</button>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}