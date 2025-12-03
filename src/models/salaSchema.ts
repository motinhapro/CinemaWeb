import { z } from 'zod';

export const salaSchema = z.object({
    // coerce.number() transforma a string do input em número automaticamente
    numero: z.coerce.number().min(1, "O número da sala é obrigatório."),
    capacidade: z.coerce.number().min(1, "A capacidade deve ser maior que 0.")
});

export type SalaSchema = z.infer<typeof salaSchema>;