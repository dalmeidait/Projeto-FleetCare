// web/src/pages/WorkOrders.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; 
import { LogOut, LayoutDashboard, Car, Users, UserCircle, ShieldAlert, ClipboardList, Plus, Search } from 'lucide-react'; 

interface WorkOrder {
  id: string;
  number: number;
  status: string;
  priority: string;
  description: string;
  startDate: string;
  vehicle: {
    plate: string;
    model: string;
    brand: string;
    client: { name: string; phone: string };
  };
  mechanic?: { name: string } | null;
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  client: { name: string };
}

const statusTrans: Record<string, string> = {
  OPEN: 'Aberta', DIAGNOSIS: 'Em Diagnóstico', WAITING_APPROVAL: 'Aguard. Aprovação', 
  WAITING_PART: 'Aguardando Peça', IN_PROGRESS: 'Em Andamento', FINISHED: 'Finalizada', CANCELED: 'Cancelada'
};

const statusColors: Record<string, string> = {
  OPEN: '#3b82f6', DIAGNOSIS: '#f59e0b', WAITING_APPROVAL: '#eab308',
  WAITING_PART: '#8b5cf6', IN_PROGRESS: '#10b981', FINISHED: '#1f2937', CANCELED: '#ef4444' 
};

const priorityColors: Record<string, string> = { LOW: '#94a3b8', NORMAL: '#3b82f6', HIGH: '#f59e0b', URGENT: '#ef4444' };

export function WorkOrders() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const [createData, setCreateData] = useState({ vehicleId: '', description: '', mileage: '', priority: 'NORMAL' });

  async function fetchData() {
    const token = localStorage.getItem('@FleetCare:token');
    try {
      const [osResponse, vehResponse] = await Promise.all([
        api.get('/work-orders', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/vehicles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setWorkOrders(osResponse.data);
      setVehicles(vehResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) { navigate('/'); return; }

    api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setUserName(response.data.name);
        setUserRole(response.data.role);
        fetchData();
      })
      .catch(() => {
        localStorage.removeItem('@FleetCare:token');
        navigate('/');
      });
  }, [navigate]);

  const canCreateOS = ['SYS_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(userRole);

  function handleOpenCreate() {
    setCreateData({ vehicleId: '', description: '', mileage: '', priority: 'NORMAL' });
    setIsCreateModalOpen(true);
  }

  async function handleCreateOS(e: FormEvent) {
    e.preventDefault();
    if (!createData.vehicleId || !createData.description) return alert("Preencha todos os campos obrigatórios!");

    const token = localStorage.getItem('@FleetCare:token');
    try {
      const response = await api.post('/work-orders', createData, { headers: { Authorization: `Bearer ${token}` } });
      alert('Ordem de Serviço aberta com sucesso!');
      setIsCreateModalOpen(false);
      navigate(`/work-orders/${response.data.id}`); 
    } catch (error) {
      alert('Erro ao abrir O.S.');
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
            <button onClick={() => navigate('/clients')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Clientes</button>
            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Ordens de Serviço</button>
            {userRole === 'SYS_ADMIN' && (
              <button onClick={() => navigate('/users')} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={20} /> Equipe</button>
            )}
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
          <h2 style={{ margin: 0 }}>Fila de Atendimento</h2>
          {canCreateOS && (
            <button onClick={handleOpenCreate} style={{ background: '#1E3A8A', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20}/> Nova O.S. (Recepção)
            </button>
          )}
        </div>

        {loading ? <p>Carregando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px' }}>Nº O.S.</th>
                <th style={{ padding: '12px' }}>Veículo / Cliente</th>
                <th style={{ padding: '12px' }}>Abertura / Responsável</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(os => (
                <tr key={os.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '18px' }}>
                    #{os.number}
                    <div style={{ fontSize: '12px', color: priorityColors[os.priority], marginTop: '4px' }}>
                      {os.priority === 'URGENT' ? '🚨 URGENTE' : os.priority === 'HIGH' ? '🔥 ALTA' : os.priority === 'LOW' ? 'BAIXA' : 'NORMAL'}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <strong>{os.vehicle.plate}</strong> - {os.vehicle.brand} {os.vehicle.model}<br/>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{os.vehicle.client.name}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(os.startDate).toLocaleDateString('pt-BR')} <br/>
                    <span style={{ fontSize: '12px', color: os.mechanic ? '#2563eb' : '#d97706', fontWeight: 'bold' }}>
                      {os.mechanic ? `👨‍🔧 ${os.mechanic.name}` : '⏳ Aguardando Mecânico'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {/* CORREÇÃO DO NOME DA VARIÁVEL AQUI */}
                    <span style={{ backgroundColor: statusColors[os.status], color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {statusTrans[os.status]}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => navigate(`/work-orders/${os.id}`)} style={{ color: '#fff', background: '#10b981', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
                      <Search size={16}/> Abrir Painel
                    </button>
                  </td>
                </tr>
              ))}
              {workOrders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Nenhuma Ordem de Serviço encontrada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </main>

      {/* MODAL DE ABERTURA */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '600px' }}>
            <h3>Abrir Nova Ordem de Serviço</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Preencha os dados iniciais passados pelo cliente no balcão.</p>
            <form onSubmit={handleCreateOS} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Veículo / Cliente *</label>
              <select required value={createData.vehicleId} onChange={e => setCreateData({...createData, vehicleId: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">Selecione um veículo da frota...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model} ({v.client.name})</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Quilometragem</label>
                  <input type="number" placeholder="Ex: 85000" value={createData.mileage} onChange={e => setCreateData({...createData, mileage: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Prioridade</label>
                  <select required value={createData.priority} onChange={e => setCreateData({...createData, priority: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="LOW">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente (Veículo Parado)</option>
                  </select>
                </div>
              </div>

              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Reclamação do Cliente (Sintomas) *</label>
              <textarea 
                required 
                rows={4} 
                placeholder="Ex: Cliente relata barulho na roda dianteira direita ao frear e falha na partida de manhã..." 
                value={createData.description} 
                onChange={e => setCreateData({...createData, description: e.target.value})} 
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }} 
              />

              <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px', fontWeight: 'bold' }}>Criar e Abrir Painel da O.S.</button>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}