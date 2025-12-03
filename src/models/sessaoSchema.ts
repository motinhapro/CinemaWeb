import { z } from 'zod';

export const sessaoSchema = z.object({
    // O select do HTML envia string, então convertemos para number
    filmeId: z.string().min(1, "Selecione um filme."),
    salaId: z.string().min(1, "Selecione uma sala."),
    
    // Validamos se é uma string de data válida
    horario: z.string().min(1, "O horário é obrigatório.")
        .refine((dateString) => {
            const dataSessao = new Date(dateString);
            const agora = new Date();
            // Regra: Data não pode ser retroativa
            return dataSessao > agora;
        }, {
            message: "A sessão não pode ser agendada no passado."
        })
});

export type SessaoSchema = z.infer<typeof sessaoSchema>;