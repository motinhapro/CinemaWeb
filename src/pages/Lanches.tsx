import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Lanche } from '../types';

export default function Lanches() {
    const [lanches, setLanches] = useState<Lanche[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarLanches();
    }, []);

    const carregarLanches = async () => {
        try {
            const response = await api.get<Lanche[]>('/lanches');
            setLanches(response.data);
        } catch (error) {
            alert('Erro ao carregar lanches.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este combo?')) return;
        try {
            await api.delete(`/lanches/${id}`);
            setLanches(lanches.filter(l => l.id !== id));
        } catch (error) {
            alert('Erro ao excluir.');
        }
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Lanches e Combos</h1>
                <Link to="/lanches/novo" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i> Novo Combo
                </Link>
            </div>

            {lanches.length === 0 ? (
                <div className="alert alert-info">Nenhum lanche cadastrado.</div>
            ) : (
                <div className="row">
                    {lanches.map(lanche => (
                        <div key={lanche.id} className="col-md-4 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h5 className="card-title fw-bold text-primary">{lanche.nome}</h5>
                                        <span className="badge bg-success fs-6">
                                            R$ {lanche.valorUnitario.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="card-text text-muted mt-2">{lanche.descricao}</p>
                                </div>
                                <div className="card-footer bg-white border-top-0 text-end">
                                    <button 
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(lanche.id)}
                                    >
                                        <i className="bi bi-trash"></i> Excluir
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