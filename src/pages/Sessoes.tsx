import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Sessao, Filme, Sala } from '../types';

// Interface estendida para incluir os objetos completos que virão do Join
interface SessaoExpandida extends Sessao {
    filme: Filme;
    sala: Sala;
}

export default function Sessoes() {
    const [sessoes, setSessoes] = useState<SessaoExpandida[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarSessoes();
    }, []);

    const carregarSessoes = async () => {
        try {
            // O TRUQUE MÁGICO DO JSON-SERVER:
            // ?_expand=filme -> Troca o 'filmeId' pelo objeto 'filme' completo
            // &_expand=sala  -> Troca o 'salaId' pelo objeto 'sala' completo
            const response = await api.get<SessaoExpandida[]>('/sessoes?_expand=filme&_expand=sala');
            setSessoes(response.data);
        } catch (error) {
            alert('Erro ao carregar sessões.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Deseja cancelar esta sessão?')) return;
        try {
            await api.delete(`/sessoes/${id}`);
            setSessoes(sessoes.filter(s => s.id !== id));
        } catch (error) {
            alert('Erro ao excluir sessão.');
        }
    };

    const formatarData = (dataIso: string) => {
        return new Date(dataIso).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="container mt-4 text-center">Carregando...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Sessões Agendadas</h1>
                {/* O BOTÃO QUE FALTAVA 👇 */}
                <Link to="/sessoes/nova" className="btn btn-primary">
                    <i className="bi bi-calendar-plus me-2"></i>
                    Nova Sessão
                </Link>
            </div>

            {sessoes.length === 0 ? (
                <div className="alert alert-info">Nenhuma sessão agendada.</div>
            ) : (
                <div className="row">
                    {sessoes.map(sessao => (
                        <div key={sessao.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card shadow-sm h-100 border-start border-4 border-primary">
                                <div className="card-body">
                                    {/* Graças ao _expand, podemos acessar .filme.titulo */}
                                    <h5 className="card-title fw-bold text-primary">
                                        {sessao.filme?.titulo || 'Filme não encontrado'}
                                    </h5>
                                    
                                    <div className="mt-3">
                                        <p className="mb-1 text-muted">
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            Sala {sessao.sala?.numero}
                                        </p>
                                        <p className="mb-1 text-muted">
                                            <i className="bi bi-clock-fill me-2"></i>
                                            {formatarData(sessao.horario)}
                                        </p>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top-0 text-end">
                                    <button 
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(sessao.id)}
                                    >
                                        Cancelar Sessão
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}