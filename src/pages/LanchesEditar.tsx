import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { lancheSchema, type LancheSchema } from '../models/lancheSchema';
import type { Lanche } from '../types';

export default function LancheEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState<LancheSchema>({
        nome: '',
        descricao: '',
        valorUnitario: 0
    });

    const [errors, setErrors] = useState<Partial<Record<keyof LancheSchema, string>>>({});

    useEffect(() => {
        carregarLanche();
    }, [id]);

    const carregarLanche = async () => {
        try {
            const response = await api.get<Lanche>(`/lanches/${id}`);
            const lanche = response.data;
            setFormData({
                nome: lanche.nome,
                descricao: lanche.descricao,
                valorUnitario: lanche.valorUnitario
            });
        } catch (error) {
            alert('Erro ao carregar combo.');
            navigate('/lanches');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof LancheSchema]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const validacao = lancheSchema.safeParse(formData);
        if (!validacao.success) {
            const novosErros: any = {};
            validacao.error.issues.forEach(issue => {
                if (issue.path[0]) novosErros[issue.path[0]] = issue.message;
            });
            setErrors(novosErros);
            setLoading(false);
            return;
        }

        try {
            await api.put(`/lanches/${id}`, validacao.data);
            alert('Combo atualizado com sucesso!');
            navigate('/lanches');
        } catch (error) {
            alert('Erro ao atualizar combo.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;

    return (
        <div className="container mt-4">
            <h2>Editar Combo</h2>
            <div className="card bg-light shadow-sm mt-3">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} className="row g-3" style={{ maxWidth: '600px' }}>
                        
                        <div className="col-md-8">
                            <label className="form-label fw-bold">Nome do Produto</label>
                            <input 
                                name="nome" 
                                value={formData.nome} 
                                onChange={handleChange} 
                                type="text" 
                                className={`form-control ${errors.nome ? 'is-invalid' : ''}`} 
                            />
                            <div className="invalid-feedback">{errors.nome}</div>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-bold">Preço (R$)</label>
                            <input 
                                name="valorUnitario" 
                                value={formData.valorUnitario} 
                                onChange={handleChange} 
                                type="number" 
                                step="0.01"
                                className={`form-control ${errors.valorUnitario ? 'is-invalid' : ''}`} 
                            />
                            <div className="invalid-feedback">{errors.valorUnitario}</div>
                        </div>

                        <div className="col-12">
                            <label className="form-label fw-bold">Descrição</label>
                            <textarea 
                                name="descricao" 
                                value={formData.descricao} 
                                onChange={handleChange} 
                                className={`form-control ${errors.descricao ? 'is-invalid' : ''}`} 
                                rows={3}
                            ></textarea>
                            <div className="invalid-feedback">{errors.descricao}</div>
                        </div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary px-4 me-2" disabled={loading}>
                                Atualizar
                            </button>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/lanches')}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}