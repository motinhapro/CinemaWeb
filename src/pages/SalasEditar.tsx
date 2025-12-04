import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { salaSchema, type SalaSchema } from '../models/salaSchema';
import type { Sala } from '../types';

export default function SalaEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<SalaSchema>({ numero: 0, capacidade: 0 });
    const [errors, setErrors] = useState<Partial<Record<keyof SalaSchema, string>>>({});

    useEffect(() => {
        carregarSala();
    }, [id]);

    const carregarSala = async () => {
        try {
            const response = await api.get<Sala>(`/salas/${id}`);
            setFormData({
                numero: response.data.numero,
                capacidade: response.data.capacidade
            });
        } catch (error) {
            alert('Erro ao carregar sala.');
            navigate('/salas');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof SalaSchema]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const validacao = salaSchema.safeParse(formData);
        if (!validacao.success) {
            const novosErros: any = {};
            validacao.error.issues.forEach(err => { if (err.path[0]) novosErros[err.path[0]] = err.message; });
            setErrors(novosErros);
            setLoading(false);
            return;
        }

        try {
            await api.put(`/salas/${id}`, validacao.data);
            alert('Sala atualizada com sucesso!');
            navigate('/salas');
        } catch (error) {
            alert('Erro ao atualizar sala.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;

    return (
        <div className="container mt-4">
            <h2>Editar Sala</h2>
            <div className="card bg-light shadow-sm mt-3">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} className="row g-3" style={{ maxWidth: '500px' }}>
                        <div className="col-md-12">
                            <label className="form-label fw-bold">Número da Sala</label>
                            <input type="number" name="numero" value={formData.numero} onChange={handleChange} className={`form-control ${errors.numero ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.numero}</div>
                        </div>
                        <div className="col-md-12">
                            <label className="form-label fw-bold">Capacidade</label>
                            <input type="number" name="capacidade" value={formData.capacidade} onChange={handleChange} className={`form-control ${errors.capacidade ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.capacidade}</div>
                        </div>
                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary me-2" disabled={loading}>Atualizar</button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/salas')}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}