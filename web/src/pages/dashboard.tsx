// web/src/pages/Dashboard.tsx
import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, LayoutDashboard, Car, Edit, Trash2, Plus, X } from 'lucide-react';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  client: { name: string };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    plate: '', vin: '', brand: '', model: '', year: '', fuelType: 'COMBUSTION'
  });

  async function fetchVehicles() {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) return navigate('/');

    try {
      const response = await axios.get('http://localhost:3333/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error("Erro ao buscar veículos", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles();
  }, [navigate]);

  async function handleCreateVehicle(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    
    try {
      await axios.post('http://localhost:3333/vehicles', {
        ...formData,
        year: Number(formData.year),
        clientId: 'becf817d-d254-4edd-ad9a-127f751c45e1' // ID do seu cliente padrão
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Veículo cadastrado com sucesso!');
      setIsModalOpen(false);
      fetchVehicles();
      setFormData({ plate: '', vin: '', brand: '', model: '', year: '', fuelType: 'COMBUSTION' });
    } catch (error) {
      alert('Erro ao cadastrar veículo. Verifique se a placa ou chassi já existem.');
      console.error(error);
    }
  }

  async function handleDeleteVehicle(id: string) {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este veículo?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('@FleetCare:token');
    
    try {
      await axios.delete(`http://localhost:3333/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Veículo excluído com sucesso!');
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao excluir", error);
      alert('Erro ao excluir o veículo. Verifique o console.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('@FleetCare:token');
    navigate('/');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '24px', position: 'relative' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E3A8A', color: '#fff', padding: '16px 24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard size={28} color="#F59E0B" />
          <h2 style={{ margin: 0 }}>FleetCare Painel</h2>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <LogOut size={20} /> Sair
        </button>
      </header>

      <main style={{ marginTop: '32px', backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={24} color="#1E3A8A" />
            <h2 style={{ margin: 0, color: '#1f2937' }}>Veículos Cadastrados</h2>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            <Plus size={18} /> Novo Veículo
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Carregando frota...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', color: '#4b5563' }}>Placa</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>Veículo</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>Ano</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>Combustível</th>
                <th style={{ padding: '12px', color: '#4b5563' }}>Cliente</th>
                <th style={{ padding: '12px', color: '#4b5563', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{v.plate}</td>
                  <td style={{ padding: '12px' }}>{v.brand} {v.model}</td>
                  <td style={{ padding: '12px' }}>{v.year}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>{v.fuelType}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{v.client.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}><Edit size={18} /></button>
                    <button 
                      onClick={() => handleDeleteVehicle(v.id)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Excluir Veículo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Cadastrar Novo Veículo</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Placa (ex: ABC-1234)" required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input placeholder="Chassi (VIN)" required value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input placeholder="Marca" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input placeholder="Modelo" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input placeholder="Ano" type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <select value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="COMBUSTION">Combustão</option>
                  <option value="ELECTRIC">Elétrico</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', marginTop: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                Salvar Veículo
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}