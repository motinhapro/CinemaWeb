import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { sessaoSchema, type SessaoSchema } from '../models/sessaoSchema';
import type { Filme, Sala, Sessao } from '../types';

export default function SessaoEditar() {
    const { id } = useParams(); // Pega o ID da sessão na URL
    const navigate = useNavigate();
    
    // Dados para popular os Selects
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [salas, setSalas] = useState<Sala[]>([]);
    
    // Estado do formulário
    const [formData, setFormData] = useState<SessaoSchema>({ filmeId: '', salaId: '', horario: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof SessaoSchema, string>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarDados();
    }, [id]);

    const carregarDados = async () => {
        try {
            // Busca tudo que precisamos em paralelo: Filmes, Salas e a Sessão atual
            const [respFilmes, respSalas, respSessao] = await Promise.all([
                api.get<Filme[]>('/filmes'),
                api.get<Sala[]>('/salas'),
                api.get<Sessao>(`/sessoes/${id}`)
            ]);

            setFilmes(respFilmes.data);
            setSalas(respSalas.data);

            const sessao = respSessao.data;
            // Preenche o formulário com os dados que vieram do banco
            setFormData({
                filmeId: sessao.filmeId,
                salaId: sessao.salaId,
                horario: sessao.horario
            });

        } catch (error) {
            alert('Erro ao carregar dados da sessão.');
            navigate('/sessoes');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof SessaoSchema]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // 1. Validação Zod (Campos obrigatórios e data futura)
        const validacao = sessaoSchema.safeParse(formData);
        if (!validacao.success) {
            const novosErros: any = {};
            validacao.error.issues.forEach(issue => {
                if (issue.path[0]) novosErros[issue.path[0]] = issue.message;
            });
            setErrors(novosErros);
            setLoading(false);
            return;
        }

        // 2. Regra de Negócio: Validar Janela de Exibição do Filme
        const filmeSelecionado = filmes.find(f => f.id === formData.filmeId);
        if (filmeSelecionado) {
            const dataSessao = new Date(formData.horario);
            const inicioFilme = new Date(filmeSelecionado.dataInicioExibicao);
            const fimFilme = new Date(filmeSelecionado.dataFinalExibicao);
            
            // Zera as horas para comparar apenas os dias
            inicioFilme.setHours(0,0,0,0);
            fimFilme.setHours(23,59,59,999);

            if (dataSessao < inicioFilme || dataSessao > fimFilme) {
                setErrors({ 
                    horario: `O filme só está em cartaz entre ${inicioFilme.toLocaleDateString()} e ${fimFilme.toLocaleDateString()}.` 
                });
                setLoading(false);
                return;
            }
        }

        // 3. Envio (PUT)
        try {
            await api.put(`/sessoes/${id}`, validacao.data);
            alert('Sessão atualizada com sucesso!');
            navigate('/sessoes');
        } catch (error) {
            alert('Erro ao atualizar sessão.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;

    return (
        <div className="container mt-4">
            <h2>Editar Sessão</h2>
            <div className="card bg-light shadow-sm mt-3">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} className="row g-3" style={{ maxWidth: '600px' }}>
                        
                        <div className="col-12">
                            <label className="form-label fw-bold">Filme</label>
                            <select 
                                name="filmeId" 
                                className={`form-select ${errors.filmeId ? 'is-invalid' : ''}`}
                                value={formData.filmeId} 
                                onChange={handleChange}
                            >
                                <option value="">Selecione um filme...</option>
                                {filmes.map(filme => (
                                    <option key={filme.id} value={filme.id}>
                                        {filme.titulo}
                                    </option>
                                ))}
                            </select>
                            <div className="invalid-feedback">{errors.filmeId}</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Sala</label>
                            <select 
                                name="salaId" 
                                className={`form-select ${errors.salaId ? 'is-invalid' : ''}`}
                                value={formData.salaId} 
                                onChange={handleChange}
                            >
                                <option value="">Selecione uma sala...</option>
                                {salas.map(sala => (
                                    <option key={sala.id} value={sala.id}>
                                        Sala {sala.numero}
                                    </option>
                                ))}
                            </select>
                            <div className="invalid-feedback">{errors.salaId}</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Data e Horário</label>
                            <input 
                                type="datetime-local" 
                                name="horario"
                                className={`form-control ${errors.horario ? 'is-invalid' : ''}`}
                                value={formData.horario}
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">{errors.horario}</div>
                        </div>

                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary px-4 me-2" disabled={loading}>
                                Atualizar
                            </button>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/sessoes')}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}