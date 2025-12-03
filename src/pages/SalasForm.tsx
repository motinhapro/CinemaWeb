import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { salaSchema, type SalaSchema } from '../models/salaSchema';

export default function SalasForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<SalaSchema>({ numero: 0, capacidade: 0 });
    const [errors, setErrors] = useState<Partial<Record<keyof SalaSchema, string>>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof SalaSchema]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // 1. Validação Segura
        const validacao = salaSchema.safeParse(formData);

        if (!validacao.success) {
            const novosErros: any = {};
            validacao.error.issues.forEach(issue => {
                if (issue.path[0]) novosErros[issue.path[0]] = issue.message;
            });
            setErrors(novosErros);
            setLoading(false);
            return;
        }

        // 2. Envio para API
        try {
            await api.post('/salas', validacao.data);
            alert('Sala cadastrada com sucesso!');
            navigate('/salas');
        } catch (error) {
            alert('Erro ao salvar sala.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Nova Sala</h2>
            </div>

            {/* Container Cinza (Padrão Visual) */}
            <div className="card bg-light shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} className="row g-3" style={{ maxWidth: '600px' }}>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Número da Sala</label>
                            <input 
                                type="number" 
                                name="numero"
                                className={`form-control ${errors.numero ? 'is-invalid' : ''}`}
                                value={formData.numero || ''}
                                onChange={handleChange}
                                placeholder="Ex: 1"
                            />
                            <div className="invalid-feedback">{errors.numero}</div>
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Capacidade Máxima</label>
                            <input 
                                type="number" 
                                name="capacidade"
                                className={`form-control ${errors.capacidade ? 'is-invalid' : ''}`}
                                value={formData.capacidade || ''}
                                onChange={handleChange}
                                placeholder="Ex: 50"
                            />
                            <div className="invalid-feedback">{errors.capacidade}</div>
                        </div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary px-4 me-2" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar Sala'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary" 
                                onClick={() => navigate('/salas')}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}