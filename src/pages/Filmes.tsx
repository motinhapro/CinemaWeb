import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Filme } from '../types';

export default function Filmes() {
    // Estado para guardar a lista de filmes
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [loading, setLoading] = useState(true);

    // Carrega os dados assim que a tela abre
    useEffect(() => {
        carregarFilmes();
    }, []);

    const carregarFilmes = async () => {
        try {
            // GET /filmes do json-server
            const response = await api.get<Filme[]>('/filmes');
            setFilmes(response.data);
        } catch (error) {
            console.error('Erro ao carregar filmes:', error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Confirmação simples antes de deletar
        if (!confirm('Tem certeza que deseja excluir este filme?')) return;

        try {
            await api.delete(`/filmes/${id}`);
            // Atualiza a lista visualmente removendo o item
            setFilmes(filmes.filter(f => f.id !== id));
        } catch (error) {
            alert('Erro ao excluir filme.');
        }
    };

    if (loading) return <div className="container mt-4 text-center">Carregando...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Filmes em Cartaz</h1>
                {/* Botão para ir para a tela de Cadastro (que faremos a seguir) */}
                <Link to="/filmes/novo" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>
                    Novo Filme
                </Link>
            </div>

            {filmes.length === 0 ? (
                <div className="alert alert-info">
                    Nenhum filme cadastrado. Clique em "Novo Filme" para começar.
                </div>
            ) : (
                <div className="row">
                    {filmes.map((filme) => (
                        <div key={filme.id} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{filme.titulo}</h5>
                                    <h6 className="card-subtitle mb-3 text-muted">{filme.genero}</h6>
                                    <p className="card-text text-truncate">{filme.sinopse}</p>
                                    
                                    <ul className="list-unstyled small text-muted">
                                        {/* ADICIONE className="mb-2" AQUI 👇 */}
                                        <li className="mb-3">
                                            <i className="bi bi-clock me-1"></i> {filme.duracao} min
                                        </li>
                                        <li>
                                            <i className="bi bi-person-badge me-1"></i> Classificação: {filme.classificacao}
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-footer bg-transparent border-top-0 d-flex gap-2 justify-content-end">
                                    <Link to={`/filmes/${filme.id}/editar`} className="btn btn-outline-primary btn-sm">
                                        <i className="bi bi-pencil"></i>
                                    </Link>
                                    <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDelete(filme.id)}
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