// web/src/pages/WorkOrderDetails.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle, Clock, Wrench, Package, DollarSign, FileText, Plus, AlertCircle, Save, Car, Printer, Lock, Unlock } from 'lucide-react';

// --- TIPAGENS ---
interface OsHistory { id: string; action: string; createdAt: string; }
interface OsService { id: string; description: string; estimatedTime: number; realTime: number; price: number; }
interface OsPart { id: string; name: string; quantity: number; unitPrice: number; origin: string; }

interface WorkOrder {
  id: string; number: number; status: string; priority: string; description: string; mileage: number | null;
  diagnostic: string | null; cause: string | null; notes: string | null;
  laborTotal: number; partsTotal: number; discount: number; grandTotal: number;
  startDate: string; endDate: string | null;
  vehicle: { 
    id: string; plate: string; model: string; brand: string; 
    year: number; vin: string; fuelType: string; clientId: string;
    client: { name: string; phone: string; document?: string }; 
  };
  mechanic: { id: string; name: string } | null;
  services: OsService[]; parts: OsPart[]; history: OsHistory[];
}

// "Finalizada" agora é "Concluída"
const statusTrans: Record<string, string> = { OPEN: 'Aberta', DIAGNOSIS: 'Em Diagnóstico', WAITING_APPROVAL: 'Aguard. Aprovação', WAITING_PART: 'Aguardando Peça', IN_PROGRESS: 'Em Andamento', FINISHED: 'Concluída', CANCELED: 'Cancelada' };
const statusColors: Record<string, string> = { OPEN: '#3b82f6', DIAGNOSIS: '#f59e0b', WAITING_APPROVAL: '#eab308', WAITING_PART: '#8b5cf6', IN_PROGRESS: '#10b981', FINISHED: '#1f2937', CANCELED: '#ef4444' };
const priorityTrans: Record<string, string> = { LOW: 'Baixa', NORMAL: 'Normal', HIGH: 'Alta', URGENT: 'Urgente' };
const priorityColors: Record<string, string> = { LOW: '#94a3b8', NORMAL: '#3b82f6', HIGH: '#f59e0b', URGENT: '#ef4444' };

export function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [userId, setUserId] = useState(''); 
  const [userRole, setUserRole] = useState('');

  // Estados dos Modais
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState('');
  
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ description: '', estimatedTime: '', price: '' });

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [partForm, setPartForm] = useState({ name: '', quantity: '1', unitPrice: '', origin: 'Estoque Interno' });

  const [detailsForm, setDetailsForm] = useState({ diagnostic: '', cause: '', notes: '', discount: '', priority: 'NORMAL' });
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ plate: '', brand: '', model: '', year: '', vin: '', fuelType: '' });

  // Modal de Reabertura
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  async function fetchOS() {
    const token = localStorage.getItem('@FleetCare:token');
    try {
      const response = await api.get(`/work-orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setOs(response.data);
      setDetailsForm({
        diagnostic: response.data.diagnostic || '',
        cause: response.data.cause || '',
        notes: response.data.notes || '',
        discount: String(response.data.discount || 0),
        priority: response.data.priority || 'NORMAL'
      });
    } catch (error) {
      alert("Erro ao carregar OS.");
      navigate('/work-orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('@FleetCare:token');
    if (!token) { navigate('/'); return; }
    api.get('/me', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      setUserId(res.data.id);
      setUserRole(res.data.role);
    });
    fetchOS();
  }, [id]);

  // --- FUNÇÕES DE AÇÃO ---
  async function handleAssumirOS() {
    if (!os) return;
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.patch(`/work-orders/${id}/status`, { status: os.status, mechanicId: userId }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Sucesso! Você assumiu a responsabilidade desta Ordem de Serviço!");
      fetchOS();
    } catch (error) { alert("Erro ao assumir O.S."); }
  }

  async function handleUpdateStatus(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.patch(`/work-orders/${id}/status`, { status: statusForm }, { headers: { Authorization: `Bearer ${token}` } });
      setIsStatusModalOpen(false);
      fetchOS();
    } catch (error) { alert("Erro ao atualizar status"); }
  }

  // Função para o Gerente reabrir a O.S. com motivo
  async function handleReopenOS(e: FormEvent) {
    e.preventDefault();
    if (!reopenReason) return alert("É obrigatório informar o motivo!");
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.patch(`/work-orders/${id}/status`, { 
        status: 'IN_PROGRESS', // Ao reabrir, volta para Em Andamento
        reason: reopenReason 
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIsReopenModalOpen(false);
      setReopenReason('');
      fetchOS();
    } catch (error) { alert("Erro ao reabrir O.S."); }
  }

  async function handleSaveDetails() {
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.put(`/work-orders/${id}/details`, detailsForm, { headers: { Authorization: `Bearer ${token}` } });
      setIsEditingDetails(false);
      alert("Dossiê atualizado com sucesso!");
      fetchOS();
    } catch (error) { alert("Erro ao salvar detalhes"); }
  }

  async function handleAddService(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.post(`/work-orders/${id}/services`, serviceForm, { headers: { Authorization: `Bearer ${token}` } });
      setIsServiceModalOpen(false);
      setServiceForm({ description: '', estimatedTime: '', price: '' });
      fetchOS(); 
    } catch (error) { alert("Erro ao adicionar serviço"); }
  }

  async function handleAddPart(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.post(`/work-orders/${id}/parts`, partForm, { headers: { Authorization: `Bearer ${token}` } });
      setIsPartModalOpen(false);
      setPartForm({ name: '', quantity: '1', unitPrice: '', origin: 'Estoque Interno' });
      fetchOS();
    } catch (error) { alert("Erro ao adicionar peça"); }
  }

  function handleOpenVehicleEdit() {
    if (!os) return;
    setVehicleForm({
      plate: os.vehicle.plate, brand: os.vehicle.brand, model: os.vehicle.model,
      year: String(os.vehicle.year), vin: os.vehicle.vin || '', fuelType: os.vehicle.fuelType
    });
    setIsVehicleModalOpen(true);
  }

  async function handleUpdateVehicle(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('@FleetCare:token');
    try {
      await api.put(`/vehicles/${os?.vehicle.id}`, { ...vehicleForm, year: Number(vehicleForm.year), clientId: os?.vehicle.clientId }, { headers: { Authorization: `Bearer ${token}` } });
      setIsVehicleModalOpen(false);
      alert("Veículo atualizado!");
      fetchOS(); 
    } catch (error) { alert("Erro ao atualizar veículo"); }
  }

  if (loading || !os) return <p style={{ padding: '24px' }}>Carregando Painel da OS...</p>;

  // REGRAS DE TRAVA DE SEGURANÇA (LOCK)
  const isLocked = os.status === 'FINISHED' || os.status === 'CANCELED';
  const canReopen = ['SYS_ADMIN', 'MANAGER'].includes(userRole);
  const canEditTechnical = !isLocked && ['SYS_ADMIN', 'ADMIN', 'MANAGER', 'MECHANIC'].includes(userRole);

  return (
    <>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background-color: #ffffff; margin: 0; padding: 0; }
            .print-only { display: block !important; color: #111; font-family: Arial, sans-serif; font-size: 12px; }
            .pdf-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 24px; }
            .pdf-table th { background-color: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #ccc; font-weight: bold; }
            .pdf-table td { padding: 8px; border-bottom: 1px solid #eee; }
            .pdf-table tr:nth-child(even) { background-color: #fafafa; }
            .pdf-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
            .pdf-box-title { font-weight: bold; font-size: 14px; margin-top: 0; margin-bottom: 12px; color: #1f2937; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          }
          @media screen {
            .print-only { display: none !important; }
          }
        `}
      </style>

      {/* MODO TELA: INTERFACE NORMAL DO SISTEMA */}
      <div className="no-print" style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        
        {/* CABEÇALHO FIXO DA O.S. */}
        <div style={{ backgroundColor: isLocked ? '#1f2937' : '#1E3A8A', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={() => navigate('/work-orders')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isLocked && <Lock size={20} color="#ef4444" />}
                Gestão da OS #{os.number}
                <span style={{ fontSize: '14px', backgroundColor: statusColors[os.status], padding: '4px 12px', borderRadius: '20px' }}>{statusTrans[os.status]}</span>
                <span style={{ fontSize: '14px', backgroundColor: priorityColors[os.priority], padding: '4px 12px', borderRadius: '20px' }}>{priorityTrans[os.priority]}</span>
              </h1>
              <p style={{ margin: '4px 0 0 0', color: isLocked ? '#9ca3af' : '#93c5fd' }}>{os.vehicle.plate} • {os.vehicle.brand} {os.vehicle.model} • Dono: {os.vehicle.client.name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            
            <button onClick={() => window.print()} style={{ backgroundColor: '#fff', color: isLocked ? '#1f2937' : '#1E3A8A', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={20}/> {isLocked ? 'Imprimir Recibo' : 'Gerar PDF'}
            </button>

            {/* BOTÕES DE STATUS E REABERTURA */}
            {!isLocked && canEditTechnical && (
              <button onClick={() => { setStatusForm(os.status); setIsStatusModalOpen(true); }} style={{ backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20}/> Mudar Status
              </button>
            )}

            {isLocked && canReopen && (
              <button onClick={() => setIsReopenModalOpen(true)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Unlock size={20}/> Reabrir O.S.
              </button>
            )}
          </div>
        </div>

        {/* ALERTA DE O.S. BLOQUEADA */}
        {isLocked && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #f87171' }}>
            ⚠️ Esta Ordem de Serviço está fechada. A edição de serviços, peças e detalhes técnicos está bloqueada.
          </div>
        )}

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          
          {/* NAVEGAÇÃO DE ABAS */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb', marginBottom: '24px' }}>
            {[ 
              { id: 'overview', label: 'Visão Geral', icon: <FileText size={18}/> },
              { id: 'services', label: 'Serviços', icon: <Wrench size={18}/> },
              { id: 'parts', label: 'Peças', icon: <Package size={18}/> },
              { id: 'financial', label: 'Financeiro', icon: <DollarSign size={18}/> },
              { id: 'history', label: 'Histórico', icon: <Clock size={18}/> }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === tab.id ? (isLocked ? '#1f2937' : '#1E3A8A') : '#6b7280', borderBottom: activeTab === tab.id ? `3px solid ${isLocked ? '#1f2937' : '#1E3A8A'}` : '3px solid transparent' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ================= ABA 1: VISÃO GERAL ================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={20}/> Reclamação do Cliente</h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px' }}>{os.description}</p>
                
                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><strong>Abertura:</strong> <br/>{new Date(os.startDate).toLocaleString('pt-BR')}</div>
                  <div><strong>Quilometragem:</strong> <br/>{os.mileage ? `${os.mileage} km` : 'Não informada'}</div>
                  <div><strong>Contato:</strong> <br/>{os.vehicle.client.phone}</div>
                  <div>
                    <strong>Responsável:</strong> <br/>
                    {os.mechanic ? (
                      <span style={{ color: '#1d4ed8', fontWeight: 'bold' }}>👨‍🔧 {os.mechanic.name}</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳ Não atribuído</span>
                    )}

                    {!os.mechanic && canEditTechnical && (
                      <button onClick={handleAssumirOS} style={{ display: 'block', marginTop: '8px', padding: '6px 12px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🙋‍♂️ Assumir esta O.S.
                      </button>
                    )}
                  </div>
                </div>

                {canEditTechnical && (
                  <button onClick={handleOpenVehicleEdit} style={{ marginTop: '24px', background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                    <Car size={18} /> Editar Dados Deste Veículo
                  </button>
                )}
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}><Wrench size={20}/> Dossiê Técnico</h3>
                  {canEditTechnical && !isEditingDetails && (
                    <button onClick={() => setIsEditingDetails(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                  )}
                  {isEditingDetails && (
                    <button onClick={handleSaveDetails} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={16}/> Salvar</button>
                  )}
                </div>

                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Prioridade da OS:</label>
                {isEditingDetails ? (
                  <select value={detailsForm.priority} onChange={e => setDetailsForm({...detailsForm, priority: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                    <option value="LOW">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                ) : (
                  <p style={{ color: priorityColors[os.priority], fontWeight: 'bold', marginTop: '4px', marginBottom: '16px' }}>{priorityTrans[os.priority]}</p>
                )}

                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Diagnóstico Encontrado:</label>
                {isEditingDetails ? (
                  <textarea rows={3} value={detailsForm.diagnostic} onChange={e => setDetailsForm({...detailsForm, diagnostic: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }} />
                ) : (
                  <p style={{ color: '#4b5563', marginTop: '4px', marginBottom: '16px' }}>{os.diagnostic || 'Nenhum diagnóstico registrado ainda.'}</p>
                )}

                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Causa do Problema:</label>
                {isEditingDetails ? (
                  <input value={detailsForm.cause} onChange={e => setDetailsForm({...detailsForm, cause: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                ) : (
                  <p style={{ color: '#4b5563', marginTop: '4px', marginBottom: '16px' }}>{os.cause || 'Não identificada.'}</p>
                )}

                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>Observações / Testes:</label>
                {isEditingDetails ? (
                  <textarea rows={2} value={detailsForm.notes} onChange={e => setDetailsForm({...detailsForm, notes: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }} />
                ) : (
                  <p style={{ color: '#4b5563', marginTop: '4px' }}>{os.notes || 'Sem observações adicionais.'}</p>
                )}
              </div>
            </div>
          )}

          {/* ================= ABA 2: SERVIÇOS ================= */}
          {activeTab === 'services' && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Serviços Executados</h3>
                {canEditTechnical && <button onClick={() => setIsServiceModalOpen(true)} style={{ background: '#1E3A8A', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16}/> Adicionar Serviço</button>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={{ padding: '12px' }}>Descrição do Serviço</th><th style={{ padding: '12px' }}>Tempo Est.</th><th style={{ padding: '12px' }}>Valor (R$)</th></tr></thead>
                <tbody>
                  {os.services.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '12px' }}>{s.description}</td><td style={{ padding: '12px' }}>{s.estimatedTime ? `${s.estimatedTime}h` : '-'}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>R$ {s.price.toFixed(2)}</td></tr>
                  ))}
                  {os.services.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Nenhum serviço lançado.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= ABA 3: PEÇAS ================= */}
          {activeTab === 'parts' && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Peças Utilizadas</h3>
                {canEditTechnical && <button onClick={() => setIsPartModalOpen(true)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16}/> Adicionar Peça</button>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={{ padding: '12px' }}>Peça</th><th style={{ padding: '12px' }}>Origem</th><th style={{ padding: '12px' }}>Qtd.</th><th style={{ padding: '12px' }}>Valor Unit.</th><th style={{ padding: '12px' }}>Total</th></tr></thead>
                <tbody>
                  {os.parts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '12px' }}>{p.name}</td><td style={{ padding: '12px' }}>{p.origin}</td><td style={{ padding: '12px' }}>{p.quantity}</td><td style={{ padding: '12px' }}>R$ {p.unitPrice.toFixed(2)}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>R$ {(p.unitPrice * p.quantity).toFixed(2)}</td></tr>
                  ))}
                  {os.parts.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Nenhuma peça lançada.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= ABA 4: FINANCEIRO ================= */}
          {activeTab === 'financial' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Mão de Obra</p>
                <h2 style={{ margin: '8px 0 0 0', color: '#1f2937' }}>R$ {os.laborTotal.toFixed(2)}</h2>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', borderLeft: '4px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Peças</p>
                <h2 style={{ margin: '8px 0 0 0', color: '#1f2937' }}>R$ {os.partsTotal.toFixed(2)}</h2>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Descontos</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <h2 style={{ margin: 0, color: '#ef4444' }}>- R$</h2>
                  {isEditingDetails ? (
                    <input type="number" value={detailsForm.discount} onChange={e => setDetailsForm({...detailsForm, discount: e.target.value})} style={{ width: '80px', padding: '4px', fontSize: '18px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                  ) : (
                    <h2 style={{ margin: 0, color: '#ef4444' }}>{os.discount.toFixed(2)}</h2>
                  )}
                  {isEditingDetails && <button onClick={handleSaveDetails} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>}
                  {!isEditingDetails && canEditTechnical && <button onClick={() => setIsEditingDetails(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>Editar</button>}
                </div>
              </div>
              <div style={{ background: isLocked ? '#1f2937' : '#1E3A8A', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                <p style={{ margin: 0, color: isLocked ? '#9ca3af' : '#93c5fd', fontSize: '14px', fontWeight: 'bold' }}>VALOR TOTAL DA O.S.</p>
                <h1 style={{ margin: '8px 0 0 0', color: '#fff', fontSize: '36px' }}>R$ {os.grandTotal.toFixed(2)}</h1>
              </div>
            </div>
          )}

          {/* ================= ABA 5: HISTÓRICO ================= */}
          {activeTab === 'history' && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>Linha do Tempo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                {os.history.map(h => (
                  <div key={h.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: h.action.includes('REABERTA') ? '#ef4444' : '#10b981', marginTop: '4px' }}></div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>{h.action}</p>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(h.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* MODAIS (JANELAS FLUTUANTES) */}
        {/* ========================================= */}
        
        {/* MODAL DE REABRIR O.S. (Só Gerente) */}
        {isReopenModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '500px', borderTop: '4px solid #ef4444' }}>
              <h3 style={{ color: '#ef4444', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Unlock size={24}/> Reabrir Ordem de Serviço</h3>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>Atenção: A reabertura deste documento ficará registrada no histórico da auditoria. Por favor, justifique o motivo.</p>
              
              <form onSubmit={handleReopenOS} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <textarea 
                  required 
                  rows={3}
                  placeholder="Ex: Cliente retornou no dia seguinte relatando que a peça apresentou defeito de fábrica..." 
                  value={reopenReason} 
                  onChange={e => setReopenReason(e.target.value)} 
                  style={{ padding: '10px', width: '100%', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', resize: 'none' }} 
                />
                <button type="submit" style={{ background: '#ef4444', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Confirmar Reabertura</button>
                <button type="button" onClick={() => setIsReopenModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {/* OUTROS MODAIS DA TELA NORMAL (Ocultos se travado) */}
        {isVehicleModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '500px' }}>
              <h3>Corrigir Dados do Veículo</h3>
              <form onSubmit={handleUpdateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input placeholder="Placa" required value={vehicleForm.plate} onChange={e => setVehicleForm({...vehicleForm, plate: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <input placeholder="Chassi (VIN)" required value={vehicleForm.vin} onChange={e => setVehicleForm({...vehicleForm, vin: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <input placeholder="Marca" required value={vehicleForm.brand} onChange={e => setVehicleForm({...vehicleForm, brand: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <input placeholder="Modelo" required value={vehicleForm.model} onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <select required value={vehicleForm.fuelType} onChange={e => setVehicleForm({...vehicleForm, fuelType: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
                  <option value="COMBUSTION">Combustão (Flex/Gasolina/Etanol)</option>
                  <option value="ELECTRIC">Elétrico</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
                <input placeholder="Ano" type="number" required value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <button type="submit" style={{ background: '#3b82f6', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>Salvar Correções</button>
                <button type="button" onClick={() => setIsVehicleModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {isStatusModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
              <h3>Mudar Status da O.S.</h3>
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select value={statusForm} onChange={e => setStatusForm(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}>
                  {Object.entries(statusTrans).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
                <button type="submit" style={{ background: '#f59e0b', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Salvar Status</button>
                <button type="button" onClick={() => setIsStatusModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {isServiceModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
              <h3>Lançar Serviço</h3>
              <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input required placeholder="Descrição (Ex: Troca de óleo)" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" step="0.1" placeholder="Tempo Estimado (em horas)" value={serviceForm.estimatedTime} onChange={e => setServiceForm({...serviceForm, estimatedTime: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <input required type="number" step="0.01" placeholder="Valor Cobrado (R$)" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <button type="submit" style={{ background: '#1E3A8A', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Serviço</button>
                <button type="button" onClick={() => setIsServiceModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}

        {isPartModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
              <h3>Lançar Peça</h3>
              <form onSubmit={handleAddPart} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input required placeholder="Nome da Peça (Ex: Filtro de Óleo)" value={partForm.name} onChange={e => setPartForm({...partForm, name: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input required type="number" placeholder="Quantidade" value={partForm.quantity} onChange={e => setPartForm({...partForm, quantity: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                  <input required type="number" step="0.01" placeholder="Valor Unitário (R$)" value={partForm.unitPrice} onChange={e => setPartForm({...partForm, unitPrice: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }} />
                </div>
                <select value={partForm.origin} onChange={e => setPartForm({...partForm, origin: e.target.value})} style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
                  <option value="Estoque Interno">Estoque Interno</option>
                  <option value="Comprado Externo">Comprado Fora</option>
                  <option value="Trazido pelo Cliente">Trazido pelo Cliente</option>
                </select>
                <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Peça</button>
                <button type="button" onClick={() => setIsPartModalOpen(false)} style={{ background: '#eee', padding: '10px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
        MODO DE IMPRESSÃO (O PDF INVISÍVEL NA TELA)
        =========================================================
      */}
      <div className="print-only" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        
        {/* CABEÇALHO DO PDF */}
        <div style={{ borderBottom: '2px solid #1E3A8A', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1E3A8A', fontSize: '24px' }}>OFICINA AVANCE</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Rua Exemplo, 123 - Centro | Contato: (11) 99999-9999</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>Ordem de Serviço #{os.number}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              <strong>Abertura:</strong> {new Date(os.startDate).toLocaleDateString('pt-BR')} <br/>
              <strong>Status:</strong> {statusTrans[os.status]}
            </p>
          </div>
        </div>

        {/* BLOCO CLIENTE E VEÍCULO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div className="pdf-box">
            <h4 className="pdf-box-title">DADOS DO CLIENTE</h4>
            <p style={{ margin: '4px 0' }}><strong>Nome:</strong> {os.vehicle.client.name}</p>
            <p style={{ margin: '4px 0' }}><strong>Telefone:</strong> {os.vehicle.client.phone}</p>
          </div>
          <div className="pdf-box">
            <h4 className="pdf-box-title">DADOS DO VEÍCULO</h4>
            <p style={{ margin: '4px 0' }}><strong>Veículo:</strong> {os.vehicle.brand} {os.vehicle.model} ({os.vehicle.year})</p>
            <p style={{ margin: '4px 0' }}><strong>Placa:</strong> {os.vehicle.plate} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>KM:</strong> {os.mileage ? os.mileage : 'Não inf.'}</p>
            <p style={{ margin: '4px 0' }}><strong>Chassi:</strong> {os.vehicle.vin || 'Não informado'}</p>
          </div>
        </div>

        {/* RELATO DO CLIENTE */}
        <div className="pdf-box" style={{ backgroundColor: '#f9fafb' }}>
          <h4 className="pdf-box-title">RELATO DO CLIENTE</h4>
          <p style={{ margin: 0, fontStyle: 'italic', color: '#374151' }}>"{os.description}"</p>
        </div>

        {/* DIAGNÓSTICO TÉCNICO */}
        <div className="pdf-box">
          <h4 className="pdf-box-title">DIAGNÓSTICO TÉCNICO</h4>
          <p style={{ margin: '0 0 8px 0' }}><strong>Diagnóstico:</strong> {os.diagnostic || 'N/A'}</p>
          <p style={{ margin: '0 0 8px 0' }}><strong>Causa Provável:</strong> {os.cause || 'N/A'}</p>
          <p style={{ margin: 0 }}><strong>Observações:</strong> {os.notes || 'N/A'}</p>
        </div>

        {/* TABELA DE SERVIÇOS */}
        {os.services.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>SERVIÇOS EXECUTADOS</h4>
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Descrição do Serviço</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Tempo</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {os.services.map(s => (
                  <tr key={s.id}>
                    <td>{s.description}</td>
                    <td style={{ textAlign: 'center' }}>{s.estimatedTime ? `${s.estimatedTime}h` : '-'}</td>
                    <td style={{ textAlign: 'right' }}>{s.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABELA DE PEÇAS */}
        {os.parts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>PEÇAS E MATERIAIS</h4>
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Descrição da Peça</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Qtd.</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>V. Unit.</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {os.parts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name} <br/><span style={{ fontSize: '10px', color: '#6b7280' }}>Origem: {p.origin}</span></td>
                    <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{p.unitPrice.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{(p.unitPrice * p.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RESUMO FINANCEIRO */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', pageBreakInside: 'avoid' }}>
          <div style={{ width: '300px', border: '1px solid #1E3A8A', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal Serviços:</span> <strong>R$ {os.laborTotal.toFixed(2)}</strong>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal Peças:</span> <strong>R$ {os.partsTotal.toFixed(2)}</strong>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
              <span>Descontos:</span> <strong>- R$ {os.discount.toFixed(2)}</strong>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#1E3A8A', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>VALOR TOTAL:</span>
              <strong style={{ fontSize: '20px' }}>R$ {os.grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* RODAPÉ E ASSINATURAS */}
        <div style={{ marginTop: '64px', paddingTop: '16px', borderTop: '1px solid #ccc', fontSize: '10px', color: '#6b7280', textAlign: 'center', pageBreakInside: 'avoid' }}>
          <p style={{ margin: '0 0 32px 0' }}>Garantia de 90 dias para serviços executados. Peças sujeitas à garantia do fabricante. Agradecemos a preferência!</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
            <div style={{ width: '250px', borderTop: '1px solid #000', paddingTop: '8px' }}>
              <strong>OFICINA AVANCE</strong><br/>Responsável Técnico
            </div>
            <div style={{ width: '250px', borderTop: '1px solid #000', paddingTop: '8px' }}>
              <strong>{os.vehicle.client.name}</strong><br/>De acordo com os serviços prestados
            </div>
          </div>
        </div>

      </div>
    </>
  );
}