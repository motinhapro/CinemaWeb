FROM node:22-alpine

WORKDIR /app

# Copia os arquivos de configuração de dependências
COPY package.json package-lock.json* ./

# Instala todas as dependências do projeto
RUN npm install

# Copia o restante do código
COPY . .

# Expõe as portas usadas (3000 para API, 5173 para React)
EXPOSE 3000 5173

# Comando padrão
CMD ["npm", "run", "dev"]