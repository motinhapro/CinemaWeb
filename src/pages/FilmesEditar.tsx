import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';
import { filmeSchema, type FilmeSchema } from '../models/filmeSchema';
import { Genero, type Filme } from '../types';

export default function FilmeEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState<FilmeSchema>({
        titulo: '',
        sinopse: '',
        classificacao: '',
        duracao: 0,
        genero: Genero.ACAO,
        dataInicioExibicao: '',
        dataFinalExibicao: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FilmeSchema, string>>>({});

    useEffect(() => {
        carregarFilme();
    }, [id]);

    const carregarFilme = async () => {
        try {
            const response = await api.get<Filme>(`/filmes/${id}`);
            const filme = response.data;
            setFormData({
                titulo: filme.titulo,
                sinopse: filme.sinopse,
                classificacao: filme.classificacao,
                duracao: filme.duracao,
                genero: filme.genero,
                dataInicioExibicao: filme.dataInicioExibicao,
                dataFinalExibicao: filme.dataFinalExibicao
            });
        } catch (error) {
            alert('Erro ao carregar filme.');
            navigate('/filmes');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FilmeSchema]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const validacao = filmeSchema.safeParse(formData);
        if (!validacao.success) {
            const novosErros: any = {};
            validacao.error.issues.forEach(err => {
                if (err.path[0]) novosErros[err.path[0]] = err.message;
            });
            setErrors(novosErros);
            setLoading(false);
            return;
        }

        try {
            await api.put(`/filmes/${id}`, validacao.data);
            alert('Filme atualizado com sucesso!');
            navigate('/filmes');
        } catch (error) {
            alert('Erro ao atualizar filme.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;

    return (
        <div className="container mt-4">
            <h2>Editar Filme</h2>
            <div className="card bg-light shadow-sm mt-3">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Título</label>
                            <input name="titulo" value={formData.titulo} onChange={handleChange} type="text" className={`form-control ${errors.titulo ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.titulo}</div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Classificação</label>
                            <select name="classificacao" value={formData.classificacao} onChange={handleChange} className={`form-select ${errors.classificacao ? 'is-invalid' : ''}`}>
                                <option value="">Selecione...</option>
                                <option value="L">Livre</option>
                                <option value="10">10 anos</option>
                                <option value="12">12 anos</option>
                                <option value="14">14 anos</option>
                                <option value="16">16 anos</option>
                                <option value="18">18 anos</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Duração (min)</label>
                            <input name="duracao" value={formData.duracao} onChange={handleChange} type="number" className={`form-control ${errors.duracao ? 'is-invalid' : ''}`} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Gênero</label>
                            <select name="genero" value={formData.genero} onChange={handleChange} className={`form-select ${errors.genero ? 'is-invalid' : ''}`}>
                                {Object.values(Genero).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold">Sinopse</label>
                            <textarea name="sinopse" value={formData.sinopse} onChange={handleChange} className={`form-control ${errors.sinopse ? 'is-invalid' : ''}`} rows={3}></textarea>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Início Exibição</label>
                            <input name="dataInicioExibicao" value={formData.dataInicioExibicao} onChange={handleChange} type="date" className={`form-control ${errors.dataInicioExibicao ? 'is-invalid' : ''}`} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Fim Exibição</label>
                            <input name="dataFinalExibicao" value={formData.dataFinalExibicao} onChange={handleChange} type="date" className={`form-control ${errors.dataFinalExibicao ? 'is-invalid' : ''}`} />
                        </div>
                        <div className="col-12 mt-4">
                            <button type="submit" className="btn btn-primary me-2" disabled={loading}>Atualizar</button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/filmes')}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}