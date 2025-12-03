import { z } from 'zod';
import { Genero } from '../types';

// O Zod precisa de uma lista de strings NÃO vazia
const generosValidos = Object.values(Genero) as [string, ...string[]];

export const filmeSchema = z.object({
    titulo: z.string().min(1, "O título é obrigatório."),
    
    sinopse: z.string().min(10, "A sinopse deve ter pelo menos 10 caracteres."),
    
    classificacao: z.string().min(1, "A classificação é obrigatória."),
    
    duracao: z.coerce.number().min(1, "A duração deve ser maior que 0 minutos."),
    
    genero: z.enum(generosValidos, {
        message: "Selecione um gênero válido."
    }),
    
    dataInicioExibicao: z.string().min(1, "Data de início é obrigatória."),
    dataFinalExibicao: z.string().min(1, "Data final é obrigatória."),
}).refine((data) => {
    if (data.dataInicioExibicao && data.dataFinalExibicao) {
        return new Date(data.dataFinalExibicao) >= new Date(data.dataInicioExibicao);
    }
    return true;
}, {
    message: "A data final deve ser posterior à data inicial.",
    path: ["dataFinalExibicao"],
});

export type FilmeSchema = z.infer<typeof filmeSchema>;