export const Genero = {
    ACAO: "Ação",
    COMEDIA: "Comédia",
    DRAMA: "Drama",
    ROMANCE: "Romance",
    DOCUMENTARIO: "Documentário",
    SUSPENSE: "Suspense",
    TERROR: "Terror",
    FICCAO_CIENTIFICA: "Ficção Científica"
} as const;

// Cria o tipo baseado nas chaves do objeto acima
export type Genero = typeof Genero[keyof typeof Genero];

export interface Filme {
    id: number; 
    titulo: string;
    sinopse: string;
    classificacao: string;
    duracao: number;
    genero: Genero; 
    dataInicioExibicao: string;
    dataFinalExibicao: string;
}

export interface Sala {
    id: number;
    numero: number;
    capacidade: number;
}

export interface Sessao {
    id: number;
    filmeId: number; 
    salaId: number;
    horario: string;
}

export interface Ingresso {
    id: number;
    sessaoId: number;
    tipo: 'INTEIRA' | 'MEIA';
    valor: number;
}