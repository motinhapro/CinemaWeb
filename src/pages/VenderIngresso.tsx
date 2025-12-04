import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Sessao, Filme, Sala, Ingresso, Lanche } from '../types';

interface SessaoDetalhada extends Sessao {
    filme: Filme;
    sala: Sala;
}

// Tipo local para controlar o carrinho na tela
interface CarrinhoLanche {
    [lancheId: string]: number; // ID -> Quantidade
}

export default function VenderIngresso() {
    const { sessaoId } = useParams();
    const navigate = useNavigate();

    // Dados da API
    const [sessao, setSessao] = useState<SessaoDetalhada | null>(null);
    const [lanchesDisponiveis, setLanchesDisponiveis] = useState<Lanche[]>([]);
    const [ingressosVendidos, setIngressosVendidos] = useState<Ingresso[]>([]);
    
    // Estado do Formulário
    const [tipoIngresso, setTipoIngresso] = useState<'INTEIRA' | 'MEIA'>('INTEIRA');
    const [assentoSelecionado, setAssentoSelecionado] = useState<string>('');
    const [carrinhoLanches, setCarrinhoLanches] = useState<CarrinhoLanche>({});
    
    const [loading, setLoading] = useState(true);
    const PRECO_BASE = 20.0;
    const COLUNAS_POR_FILA = 8;

    useEffect(() => {
        if (sessaoId) carregarDados();
    }, [sessaoId]);

    const carregarDados = async () => {
        try {
            const [respSessao, respIngressos, respLanches] = await Promise.all([
                api.get<SessaoDetalhada>(`/sessoes/${sessaoId}?_expand=filme&_expand=sala`),
                api.get<Ingresso[]>(`/ingressos?sessaoId=${sessaoId}`),
                api.get<Lanche[]>('/lanches')
            ]);
            setSessao(respSessao.data);
            setIngressosVendidos(respIngressos.data);
            setLanchesDisponiveis(respLanches.data);
        } catch (error) {
            alert('Erro ao carregar dados.');
            navigate('/sessoes');
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE VALORES ---
    const valorIngresso = tipoIngresso === 'MEIA' ? PRECO_BASE / 2 : PRECO_BASE;

    const calcularTotalLanches = () => {
        let total = 0;
        Object.entries(carrinhoLanches).forEach(([id, qtd]) => {
            const lanche = lanchesDisponiveis.find(l => l.id === id);
            if (lanche) total += lanche.valorUnitario * qtd;
        });
        return total;
    };

    const valorTotalPedido = valorIngresso + calcularTotalLanches();

    // --- MANIPULAÇÃO DO CARRINHO ---
    const atualizarLanche = (id: string, delta: number) => {
        setCarrinhoLanches(prev => {
            const novaQtd = (prev[id] || 0) + delta;
            if (novaQtd <= 0) {
                const novoCarrinho = { ...prev };
                delete novoCarrinho[id];
                return novoCarrinho;
            }
            return { ...prev, [id]: novaQtd };
        });
    };

    // --- SALVAR TUDO (INGRESSO + PEDIDO) ---
    const handleVenda = async () => {
        if (!sessao || !assentoSelecionado) return;
        setLoading(true);

        try {
            // Passo 1: Criar o Ingresso (Reserva o assento)
            const novoIngresso = {
                sessaoId: sessao.id,
                tipo: tipoIngresso,
                valor: valorIngresso,
                assento: assentoSelecionado
            };
            const respIngresso = await api.post<Ingresso>('/ingressos', novoIngresso);
            const ingressoCriado = respIngresso.data;

            // Passo 2: Preparar os itens do lanche para o Pedido
            const itensLanche = Object.entries(carrinhoLanches).map(([id, qtd]) => {
                const lanche = lanchesDisponiveis.find(l => l.id === id);
                return {
                    lancheId: id,
                    quantidade: qtd,
                    precoNoMomento: lanche ? lanche.valorUnitario : 0
                };
            });

            // Passo 3: Criar o Pedido Completo (Vincula Ingresso + Lanches)
            const novoPedido = {
                dataCompra: new Date().toISOString(),
                valorTotal: valorTotalPedido,
                ingressosIds: [ingressoCriado.id], // Array conforme UML
                itensLanche: itensLanche
            };

            await api.post('/pedidos', novoPedido);

            alert(`Pedido confirmado com sucesso!\nAssento: ${assentoSelecionado}\nTotal: R$ ${valorTotalPedido.toFixed(2)}`);
            navigate('/sessoes');

        } catch (error) {
            console.error(error);
            alert('Erro ao processar venda. O assento pode ter sido ocupado.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO MAPA (Igual anterior) ---
    const renderizarMapaSala = () => {
        if (!sessao?.sala) return null;
        const totalAssentos = sessao.sala.capacidade;
        const assentos = [];
        const assentosOcupados = ingressosVendidos.map(i => i.assento);

        for (let i = 0; i < totalAssentos; i++) {
            const filaLetra = String.fromCharCode(65 + Math.floor(i / COLUNAS_POR_FILA));
            const numeroCadeira = (i % COLUNAS_POR_FILA) + 1;
            const codigoAssento = `${filaLetra}-${numeroCadeira}`;
            const ocupado = assentosOcupados.includes(codigoAssento);
            const selecionado = assentoSelecionado === codigoAssento;

            let classeBtn = "btn-outline-secondary";
            if (ocupado) classeBtn = "btn-danger disabled";
            else if (selecionado) classeBtn = "btn-primary";

            assentos.push(
                <button
                    key={codigoAssento}
                    type="button"
                    className={`btn btn-sm m-1 ${classeBtn}`}
                    style={{ width: '40px', fontSize: '10px' }}
                    onClick={() => !ocupado && setAssentoSelecionado(codigoAssento)}
                    disabled={ocupado}
                >
                    {codigoAssento}
                </button>
            );
        }
        return (
            <div className="d-flex flex-wrap justify-content-center" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="w-100 text-center mb-2 bg-secondary text-white small py-1 rounded">TELA</div>
                {assentos}
            </div>
        );
    };

    if (loading) return <div className="container mt-4">Carregando...</div>;
    if (!sessao) return <div className="container mt-4">Sessão não encontrada.</div>;

    return (
        <div className="container mt-4 mb-5">
            <h2>Novo Pedido</h2>
            
            <div className="row mt-3">
                {/* ESQUERDA: Mapa e Lanches */}
                <div className="col-lg-7">
                    {/* Mapa */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light fw-bold text-center">1. Escolha o Assento</div>
                        <div className="card-body bg-light text-center">
                            {renderizarMapaSala()}
                        </div>
                    </div>

                    {/* Lista de Lanches */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-warning bg-opacity-25 fw-bold text-center">
                            <i className="bi bi-cup-straw me-2"></i> 
                            2. Adicionar Bomboniere (Opcional)
                        </div>
                        <div className="card-body p-0">
                            {lanchesDisponiveis.length === 0 ? (
                                <div className="p-3 text-center text-muted">Nenhum combo cadastrado.</div>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {lanchesDisponiveis.map(lanche => (
                                        <li key={lanche.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">{lanche.nome}</div>
                                                <div className="small text-muted">R$ {lanche.valorUnitario.toFixed(2)}</div>
                                            </div>
                                            <div className="btn-group" role="group">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => atualizarLanche(lanche.id, -1)}
                                                    disabled={!carrinhoLanches[lanche.id]}
                                                >
                                                    <i className="bi bi-dash"></i>
                                                </button>
                                                <span className="btn btn-sm btn-light border" style={{width: '40px'}}>
                                                    {carrinhoLanches[lanche.id] || 0}
                                                </span>
                                                <button 
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => atualizarLanche(lanche.id, 1)}
                                                >
                                                    <i className="bi bi-plus"></i>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* DIREITA: Resumo do Pedido (Fixo) */}
                <div className="col-lg-5">
                    <div className="card shadow border-primary position-sticky" style={{ top: '20px' }}>
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0"><i className="bi bi-receipt me-2"></i>Resumo do Pedido</h5>
                        </div>
                        <div className="card-body">
                            <h5 className="text-primary fw-bold">{sessao.filme?.titulo}</h5>
                            <p className="text-muted small mb-3">
                                {new Date(sessao.horario).toLocaleString('pt-BR')} | Sala {sessao.sala?.numero}
                            </p>

                            {/* Seleção do Ingresso */}
                            <div className="mb-3 p-2 bg-light rounded border">
                                <label className="form-label fw-bold small">Assento: {assentoSelecionado || '?'}</label>
                                <div className="btn-group w-100 btn-group-sm">
                                    <input type="radio" className="btn-check" name="ingresso" id="int" 
                                        checked={tipoIngresso === 'INTEIRA'} onChange={() => setTipoIngresso('INTEIRA')} />
                                    <label className="btn btn-outline-primary" htmlFor="int">Inteira (R$ {PRECO_BASE})</label>

                                    <input type="radio" className="btn-check" name="ingresso" id="meia" 
                                        checked={tipoIngresso === 'MEIA'} onChange={() => setTipoIngresso('MEIA')} />
                                    <label className="btn btn-outline-primary" htmlFor="meia">Meia (R$ {PRECO_BASE/2})</label>
                                </div>
                            </div>

                            {/* Resumo Financeiro */}
                            <ul className="list-group mb-3">
                                <li className="list-group-item d-flex justify-content-between lh-sm">
                                    <div>
                                        <h6 className="my-0">Ingresso ({tipoIngresso})</h6>
                                        <small className="text-muted">{assentoSelecionado}</small>
                                    </div>
                                    <span className="text-muted">R$ {valorIngresso.toFixed(2)}</span>
                                </li>
                                {Object.entries(carrinhoLanches).map(([id, qtd]) => {
                                    const l = lanchesDisponiveis.find(x => x.id === id);
                                    if (!l) return null;
                                    return (
                                        <li key={id} className="list-group-item d-flex justify-content-between lh-sm">
                                            <div>
                                                <h6 className="my-0">{l.nome}</h6>
                                                <small className="text-muted">x {qtd}</small>
                                            </div>
                                            <span className="text-muted">R$ {(l.valorUnitario * qtd).toFixed(2)}</span>
                                        </li>
                                    );
                                })}
                                <li className="list-group-item d-flex justify-content-between bg-light">
                                    <span className="fw-bold">Total (R$)</span>
                                    <strong className="fs-5 text-success">R$ {valorTotalPedido.toFixed(2)}</strong>
                                </li>
                            </ul>

                            <button 
                                className="btn btn-success w-100 py-2 fw-bold" 
                                onClick={handleVenda}
                                disabled={!assentoSelecionado}
                            >
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}