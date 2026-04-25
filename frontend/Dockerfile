FROM node:20-slim

WORKDIR /app

# Copia os arquivos de dependências para dentro do container
COPY frontend/package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código para dentro do container
COPY frontend/ .

# Expõe a porta do Vite configurada no projeto
EXPOSE 3000

# Comando para rodar em modo desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]