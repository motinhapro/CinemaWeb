import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Sessao, Filme, Sala, Ingresso } from '../types';

interface SessaoDetalhada extends Sessao {
    filme: Filme;
    sala: Sala;
}

export default function VenderIngresso() {
    const { sessaoId } = useParams();
    const navigate = useNavigate();

    const [sessao, setSessao] = useState<SessaoDetalhada | null>(null);
    const [tipoIngresso, setTipoIngresso] = useState<'INTEIRA' | 'MEIA'>('INTEIRA');
    const [loading, setLoading] = useState(true);
    
    // Novos estados para controle de capacidade
    const [ingressosVendidos, setIngressosVendidos] = useState<Ingresso[]>([]);
    const [assentosRestantes, setAssentosRestantes] = useState(0);

    const PRECO_BASE = 20.0;

    useEffect(() => {
        if (sessaoId) {
            carregarDados();
        }
    }, [sessaoId]);

    const carregarDados = async () => {
        try {
            // Buscamos a SESSÃO (com sala e filme) e os INGRESSOS já vendidos para ela
            const [respSessao, respIngressos] = await Promise.all([
                api.get<SessaoDetalhada>(`/sessoes/${sessaoId}?_expand=filme&_expand=sala`),
                api.get<Ingresso[]>(`/ingressos?sessaoId=${sessaoId}`)
            ]);

            const sessaoAtual = respSessao.data;
            const vendidos = respIngressos.data;

            setSessao(sessaoAtual);
            setIngressosVendidos(vendidos);

            // Cálculo Matemático: Capacidade - Vendidos
            if (sessaoAtual.sala) {
                setAssentosRestantes(sessaoAtual.sala.capacidade - vendidos.length);
            }

        } catch (error) {
            alert('Erro ao carregar dados.');
            navigate('/sessoes');
        } finally {
            setLoading(false);
        }
    };

    const valorFinal = tipoIngresso === 'MEIA' ? PRECO_BASE / 2 : PRECO_BASE;
    const sessaoEsgotada = assentosRestantes <= 0;

    const handleVenda = async () => {
        if (!sessao || sessaoEsgotada) return;
        setLoading(true);

        const novoIngresso = {
            sessaoId: sessao.id,
            tipo: tipoIngresso,
            valor: valorFinal
        };

        try {
            await api.post('/ingressos', novoIngresso);
            alert(`Venda realizada!\nAssentos restantes: ${assentosRestantes - 1}`);
            navigate('/sessoes');
        } catch (error) {
            alert('Erro ao realizar venda.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;
    if (!sessao) return <div className="container mt-4">Sessão não encontrada.</div>;

    // Cálculo para a barra de progresso (porcentagem de ocupação)
    const ocupacao = sessao.sala ? ((sessao.sala.capacidade - assentosRestantes) / sessao.sala.capacidade) * 100 : 0;

    return (
        <div className="container mt-4">
            <h2>Venda de Ingresso</h2>
            
            <div className="card shadow-sm mt-3">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Resumo da Sessão</h5>
                    {sessaoEsgotada && <span className="badge bg-danger">ESGOTADO</span>}
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <h3 className="card-title text-primary fw-bold">{sessao.filme?.titulo}</h3>
                            <ul className="list-group list-group-flush mt-3">
                                <li className="list-group-item">
                                    <i className="bi bi-geo-alt-fill me-2"></i> 
                                    Sala {sessao.sala?.numero}
                                </li>
                                <li className="list-group-item">
                                    <i className="bi bi-calendar-event me-2"></i> 
                                    {new Date(sessao.horario).toLocaleString('pt-BR')}
                                </li>
                            </ul>
                        </div>
                        
                        {/* Painel de Lotação */}
                        <div className="col-md-4 bg-light p-3 rounded border">
                            <h6 className="fw-bold text-center">Lotação da Sala</h6>
                            <div className="progress mb-2" style={{ height: '20px' }}>
                                <div 
                                    className={`progress-bar ${sessaoEsgotada ? 'bg-danger' : 'bg-success'}`} 
                                    role="progressbar" 
                                    style={{ width: `${ocupacao}%` }}
                                >
                                    {Math.round(ocupacao)}%
                                </div>
                            </div>
                            <div className="d-flex justify-content-between small fw-bold">
                                <span>Vendidos: {ingressosVendidos.length}</span>
                                <span>Total: {sessao.sala?.capacidade}</span>
                            </div>
                            <div className="text-center mt-2">
                                {sessaoEsgotada ? (
                                    <span className="text-danger fw-bold">Não há mais assentos!</span>
                                ) : (
                                    <span className="text-success fw-bold">{assentosRestantes} assentos livres</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    {!sessaoEsgotada && (
                        <div className="mb-3">
                            <label className="form-label fw-bold d-block">Tipo de Ingresso:</label>
                            
                            <div className="form-check form-check-inline">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="tipoIngresso" 
                                    id="inteira" 
                                    checked={tipoIngresso === 'INTEIRA'}
                                    onChange={() => setTipoIngresso('INTEIRA')}
                                />
                                <label className="form-check-label" htmlFor="inteira">Inteira (R$ {PRECO_BASE.toFixed(2)})</label>
                            </div>
                            
                            <div className="form-check form-check-inline">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="tipoIngresso" 
                                    id="meia" 
                                    checked={tipoIngresso === 'MEIA'}
                                    onChange={() => setTipoIngresso('MEIA')}
                                />
                                <label className="form-check-label" htmlFor="meia">Meia-Entrada (R$ {(PRECO_BASE/2).toFixed(2)})</label>
                            </div>
                            
                            <div className="alert alert-success text-center fw-bold mt-3">
                                Valor Final: R$ {valorFinal.toFixed(2)}
                            </div>
                        </div>
                    )}

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button 
                            className="btn btn-secondary me-md-2" 
                            onClick={() => navigate('/sessoes')}
                        >
                            Voltar
                        </button>
                        <button 
                            className="btn btn-success px-5" 
                            onClick={handleVenda}
                            disabled={loading || sessaoEsgotada}
                        >
                            {loading ? 'Processando...' : sessaoEsgotada ? 'Esgotado' : 'Confirmar Venda'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}