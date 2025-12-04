import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Sala } from '../types';

export default function Salas() {
    const [salas, setSalas] = useState<Sala[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarSalas();
    }, []);

    const carregarSalas = async () => {
        try {
            const response = await api.get<Sala[]>('/salas');
            setSalas(response.data);
        } catch (error) {
            alert('Erro ao carregar salas.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta sala?')) return;
        try {
            await api.delete(`/salas/${id}`);
            setSalas(salas.filter(s => s.id !== id));
        } catch (error) {
            alert('Erro ao excluir sala.');
        }
    };

    if (loading) return <div className="container mt-4 text-center">Carregando...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Gerenciar Salas</h1>
                <Link to="/salas/nova" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i> Nova Sala
                </Link>
            </div>

            {salas.length === 0 ? (
                <div className="alert alert-info">Nenhuma sala cadastrada.</div>
            ) : (
                <div className="row">
                    {salas.map(sala => (
                        <div key={sala.id} className="col-md-3 mb-4">
                            <div className="card text-center shadow-sm h-100">
                                <div className="card-body d-flex flex-column justify-content-center">
                                    <h6 className="text-muted text-uppercase small">Sala</h6>
                                    <h1 className="display-4 fw-bold text-primary">{sala.numero}</h1>
                                    <hr />
                                    <p className="card-text mb-0">
                                        <i className="bi bi-people-fill me-2"></i>
                                        Capacidade: <strong>{sala.capacidade}</strong>
                                    </p>
                                </div>
                                <div className="card-footer bg-transparent border-top-0 d-flex flex-column gap-2">
                                    <Link to={`/salas/${sala.id}/editar`} className="btn btn-outline-primary btn-sm w-100">
                                        <i className="bi bi-pencil"></i> Editar
                                    </Link>
                                    <button 
                                        className="btn btn-outline-danger btn-sm w-100"
                                        onClick={() => handleDelete(sala.id)}
                                    >
                                        <i className="bi bi-trash"></i> Remover
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