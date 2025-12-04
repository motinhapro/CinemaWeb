import { z } from 'zod';

export const lancheSchema = z.object({
    nome: z.string().min(1, "O nome do combo é obrigatório."),
    descricao: z.string().min(1, "A descrição ajuda na venda."),
    // coerce garante que vire número mesmo vindo de input texto
    valorUnitario: z.coerce.number().min(0.01, "O valor deve ser maior que zero.")
});

export type LancheSchema = z.infer<typeof lancheSchema>;