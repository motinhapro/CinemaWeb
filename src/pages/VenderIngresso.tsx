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
    
    // Controle de Assentos
    const [ingressosVendidos, setIngressosVendidos] = useState<Ingresso[]>([]);
    const [assentoSelecionado, setAssentoSelecionado] = useState<string>('');

    const PRECO_BASE = 20.0;
    const COLUNAS_POR_FILA = 8; // Define a largura da sala visualmente

    useEffect(() => {
        if (sessaoId) carregarDados();
    }, [sessaoId]);

    const carregarDados = async () => {
        try {
            const [respSessao, respIngressos] = await Promise.all([
                api.get<SessaoDetalhada>(`/sessoes/${sessaoId}?_expand=filme&_expand=sala`),
                api.get<Ingresso[]>(`/ingressos?sessaoId=${sessaoId}`)
            ]);
            setSessao(respSessao.data);
            setIngressosVendidos(respIngressos.data);
        } catch (error) {
            alert('Erro ao carregar dados.');
            navigate('/sessoes');
        } finally {
            setLoading(false);
        }
    };

    const valorFinal = tipoIngresso === 'MEIA' ? PRECO_BASE / 2 : PRECO_BASE;

    const handleVenda = async () => {
        if (!sessao || !assentoSelecionado) return;
        setLoading(true);

        const novoIngresso = {
            sessaoId: sessao.id,
            tipo: tipoIngresso,
            valor: valorFinal,
            assento: assentoSelecionado
        };

        try {
            await api.post('/ingressos', novoIngresso);
            alert(`Venda confirmada para o assento ${assentoSelecionado}!`);
            navigate('/sessoes');
        } catch (error) {
            alert('Erro ao realizar venda.');
        } finally {
            setLoading(false);
        }
    };

    // Função para gerar o Grid de Assentos
    const renderizarMapaSala = () => {
        if (!sessao?.sala) return null;

        const totalAssentos = sessao.sala.capacidade;
        const assentos = [];
        
        // Pega todos os códigos de assentos já vendidos (Ex: ["A-1", "B-3"])
        const assentosOcupados = ingressosVendidos.map(i => i.assento);

        // Gera as cadeiras
        for (let i = 0; i < totalAssentos; i++) {
            const filaLetra = String.fromCharCode(65 + Math.floor(i / COLUNAS_POR_FILA)); // A, B, C...
            const numeroCadeira = (i % COLUNAS_POR_FILA) + 1; // 1, 2, 3...
            const codigoAssento = `${filaLetra}-${numeroCadeira}`;

            const ocupado = assentosOcupados.includes(codigoAssento);
            const selecionado = assentoSelecionado === codigoAssento;

            let classeBtn = "btn-outline-secondary"; // Livre
            if (ocupado) classeBtn = "btn-danger disabled"; // Vendido
            else if (selecionado) classeBtn = "btn-primary"; // Selecionado

            assentos.push(
                <button
                    key={codigoAssento}
                    type="button"
                    className={`btn btn-sm m-1 ${classeBtn}`}
                    style={{ width: '50px' }}
                    onClick={() => !ocupado && setAssentoSelecionado(codigoAssento)}
                    disabled={ocupado}
                >
                    {codigoAssento}
                </button>
            );
        }

        return (
            <div className="d-flex flex-wrap justify-content-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="w-100 text-center mb-2 bg-secondary text-white small py-1 rounded">TELA</div>
                {assentos}
            </div>
        );
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;
    if (!sessao) return <div className="container mt-4">Sessão não encontrada.</div>;

    return (
        <div className="container mt-4">
            <h2>Selecionar Assento</h2>
            
            <div className="row mt-3">
                {/* Coluna da Esquerda: Mapa da Sala */}
                <div className="col-lg-7 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-light fw-bold text-center">
                            Mapa da Sala {sessao.sala.numero}
                        </div>
                        <div className="card-body bg-light d-flex align-items-center justify-content-center">
                            {renderizarMapaSala()}
                        </div>
                        <div className="card-footer text-center small text-muted">
                            <span className="me-3"><i className="bi bi-square-fill text-secondary"></i> Livre</span>
                            <span className="me-3"><i className="bi bi-square-fill text-danger"></i> Ocupado</span>
                            <span><i className="bi bi-square-fill text-primary"></i> Selecionado</span>
                        </div>
                    </div>
                </div>

                {/* Coluna da Direita: Detalhes e Pagamento */}
                <div className="col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Resumo do Pedido</h5>
                        </div>
                        <div className="card-body">
                            <h4 className="card-title text-primary fw-bold">{sessao.filme?.titulo}</h4>
                            <p className="text-muted mb-4">
                                {new Date(sessao.horario).toLocaleString('pt-BR')}
                            </p>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Assento Selecionado:</label>
                                <div className="form-control form-control-lg text-center fw-bold bg-light">
                                    {assentoSelecionado || <span className="text-muted small">Selecione no mapa</span>}
                                </div>
                            </div>

                            <hr />

                            <div className="mb-3">
                                <label className="form-label fw-bold d-block">Tipo de Ingresso:</label>
                                <div className="btn-group w-100" role="group">
                                    <input 
                                        type="radio" 
                                        className="btn-check" 
                                        name="btnradio" 
                                        id="btn-inteira" 
                                        autoComplete="off" 
                                        checked={tipoIngresso === 'INTEIRA'}
                                        onChange={() => setTipoIngresso('INTEIRA')}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="btn-inteira">Inteira (R$ {PRECO_BASE})</label>

                                    <input 
                                        type="radio" 
                                        className="btn-check" 
                                        name="btnradio" 
                                        id="btn-meia" 
                                        autoComplete="off" 
                                        checked={tipoIngresso === 'MEIA'}
                                        onChange={() => setTipoIngresso('MEIA')}
                                    />
                                    <label className="btn btn-outline-primary" htmlFor="btn-meia">Meia (R$ {PRECO_BASE/2})</label>
                                </div>
                            </div>

                            <div className="alert alert-success text-center fw-bold fs-5 mt-4">
                                Total: R$ {valorFinal.toFixed(2)}
                            </div>

                            <div className="d-grid gap-2 mt-4">
                                <button 
                                    className="btn btn-success btn-lg" 
                                    onClick={handleVenda}
                                    disabled={loading || !assentoSelecionado}
                                >
                                    {loading ? 'Processando...' : 'Confirmar e Imprimir'}
                                </button>
                                <button 
                                    className="btn btn-outline-secondary" 
                                    onClick={() => navigate('/sessoes')}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}