import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import api from '../services/api';

import { filmeSchema } from '../models/filmeSchema';
import type { FilmeSchema } from '../models/filmeSchema'; // Import type separado
import { Genero } from '../types';

export default function FilmesForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Estado inicial do formulário
    const [formData, setFormData] = useState<FilmeSchema>({
        titulo: '',
        sinopse: '',
        classificacao: '',
        duracao: 0,
        genero: Genero.ACAO, // Valor padrão vindo do nosso objeto constante
        dataInicioExibicao: '',
        dataFinalExibicao: ''
    });

    // Estado para guardar os erros de validação (ex: "Título obrigatório")
    const [errors, setErrors] = useState<Partial<Record<keyof FilmeSchema, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpa o erro visual daquele campo assim que o usuário começa a corrigir
        if (errors[name as keyof FilmeSchema]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // Limpa erros anteriores

        // 1. Validação Segura com safeParse (Não explode erro, retorna um objeto)
        const validacao = filmeSchema.safeParse(formData);

        // Se a validação falhar, entramos aqui
        if (!validacao.success) {
            const novosErros: any = {};
            
            // Usamos .issues em vez de .errors (é mais compatível com TS estrito)
            validacao.error.issues.forEach(issue => {
                // Mapeia o erro para o campo certo
                if (issue.path[0]) {
                    novosErros[issue.path[0]] = issue.message;
                }
            });
            
            setErrors(novosErros);
            setLoading(false);
            return; // Para a execução aqui, não tenta enviar pro servidor
        }

        // 2. Envio para a API (Só chega aqui se os dados estiverem válidos)
        try {
            // validacao.data contém os dados já tipados e limpos
            await api.post('/filmes', validacao.data);

            alert('Filme cadastrado com sucesso!');
            navigate('/filmes');

        } catch (error) {
            console.error(error);
            alert('Erro ao salvar no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Novo Filme</h2>
            </div>
            
            {/* INÍCIO DO CONTAINER CINZA */}
            <div className="card bg-light shadow-sm">
                <div className="card-body p-4">
                    
                    <form onSubmit={handleSubmit} className="row g-3 needs-validation">
                        {/* Título */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Título do Filme</label>
                            <input 
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                type="text" 
                                className={`form-control ${errors.titulo ? 'is-invalid' : ''}`} 
                                placeholder="Ex: O Poderoso Chefão"
                            />
                            <div className="invalid-feedback">{errors.titulo}</div>
                        </div>

                        {/* Classificação */}
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Classificação</label>
                            <select 
                                name="classificacao" 
                                value={formData.classificacao}
                                onChange={handleChange}
                                className={`form-select ${errors.classificacao ? 'is-invalid' : ''}`}
                            >
                                <option value="">Selecione...</option>
                                <option value="L">Livre</option>
                                <option value="10">10 anos</option>
                                <option value="12">12 anos</option>
                                <option value="14">14 anos</option>
                                <option value="16">16 anos</option>
                                <option value="18">18 anos</option>
                            </select>
                            <div className="invalid-feedback">{errors.classificacao}</div>
                        </div>

                        {/* Duração */}
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Duração (min)</label>
                            <input 
                                name="duracao"
                                value={formData.duracao}
                                onChange={handleChange}
                                type="number" 
                                className={`form-control ${errors.duracao ? 'is-invalid' : ''}`} 
                            />
                            <div className="invalid-feedback">{errors.duracao}</div>
                        </div>

                        {/* Gênero */}
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Gênero</label>
                            <select 
                                name="genero" 
                                value={formData.genero}
                                onChange={handleChange}
                                className={`form-select ${errors.genero ? 'is-invalid' : ''}`}
                            >
                                {Object.values(Genero).map(genero => (
                                    <option key={genero} value={genero}>{genero}</option>
                                ))}
                            </select>
                            <div className="invalid-feedback">{errors.genero}</div>
                        </div>

                        {/* Sinopse */}
                        <div className="col-12">
                            <label className="form-label fw-bold">Sinopse</label>
                            <textarea 
                                name="sinopse"
                                value={formData.sinopse}
                                onChange={handleChange}
                                className={`form-control ${errors.sinopse ? 'is-invalid' : ''}`} 
                                rows={3}
                                placeholder="Descreva brevemente o filme (mínimo 10 caracteres)..."
                            ></textarea>
                            <div className="invalid-feedback">{errors.sinopse}</div>
                        </div>

                        <div className="col-12">
                            <hr className="text-muted" />
                            <h5 className="mb-3 text-secondary">Período de Exibição</h5>
                        </div>

                        {/* Datas */}
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Data de Início</label>
                            <input 
                                name="dataInicioExibicao"
                                value={formData.dataInicioExibicao}
                                onChange={handleChange}
                                type="date" 
                                className={`form-control ${errors.dataInicioExibicao ? 'is-invalid' : ''}`} 
                            />
                            <div className="invalid-feedback">{errors.dataInicioExibicao}</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Data de Fim</label>
                            <input 
                                name="dataFinalExibicao"
                                value={formData.dataFinalExibicao}
                                onChange={handleChange}
                                type="date" 
                                className={`form-control ${errors.dataFinalExibicao ? 'is-invalid' : ''}`} 
                            />
                            <div className="invalid-feedback">{errors.dataFinalExibicao}</div>
                        </div>

                        {/* Botões */}
                        <div className="col-12 mt-4 text-end">
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary me-2" 
                                onClick={() => navigate('/filmes')}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save me-2"></i> Salvar Filme
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* FIM DO CONTAINER CINZA */}
        </div>
    );
}