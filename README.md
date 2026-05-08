# 🍽️ MBER - Minas Bar e Restaurante

Plataforma digital para **visualização de cardápio online** e **gerenciamento administrativo** de um bar/restaurante. Permite que clientes visualizem o menu, entrem em contato com o estabelecimento via WhatsApp.

---

## 🎯 Objetivo do Projeto

Criar uma solução web moderna para restaurantes/bares que desejam:
- ✅ Exibir cardápio online e atualizado
- ✅ Organizar pratos por categorias
- ✅ Permitir contato direto via WhatsApp
- ✅ Gerenciar menu e categorias de forma simples (painel administrativo)
- ✅ Agendamentos e informações para prato destaque do dia

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Interface de usuário
- **TypeScript** - Type safety
- **Vite** - Build tool rápido
- **Tailwind CSS** - Estilização responsiva
- **React Router** - Navegação
- **Axios** - Requisições HTTP

### Backend
- **Django 6.0** - Framework web Python
- **Django REST Framework** - API RESTful
- **PostgreSQL** - Banco de dados
- **JWT (djangorestframework-simplejwt)** - Autenticação
- **drf-spectacular** - Documentação automática da API

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **Gunicorn** - Servidor WSGI
- **Render.com** - Hospedagem em produção

---

## 📋 Funcionalidades

### 👥 Para Clientes (Home)
-  Visualização responsiva do cardápio (desktop e mobile)
-  Cardápio filtrado por categorias
-  Botão de "telefone" para direcionamento no WhatsApp com mensagem pré-preenchida
-  Acesso ao endereço da loja via Google Maps
-  Interface moderna e intuitiva com cores oficial da marca

### 🔧 Administrativo
- 👤 Autenticação JWT (login/logout seguro)
- 📝 Gerenciamento de itens do menu (Create, Read, Update, Delete)
- 🏷️ Gerenciamento de categorias
- 📅 Agendamento e informações de horário
- ⚙️ Painel com acesso restrito

---

## 🚀 Como Instalar e Executar

### Pré-requisitos
- **Docker & Docker Compose** instalados, OU
- **Node.js 18+** + **Python 3.12+** (para execução local sem Docker)
- **PostgreSQL** (se rodar sem Docker)

---

### Opção 1: Com Docker Compose (Recomendado) ⭐

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/RonaldoMontan/mber.git
   cd mber
   ```

2. **Inicie os containers:**
   ```bash
   docker-compose up -d --build
   ```

3. **Acesse a aplicação:**
   - **Frontend:** http://localhost:3000
   - **Backend (API):** http://localhost:8000
   - **Docs API:** http://localhost:8000/api/schema/swagger/

4. **Parar os containers:**
   ```bash
   docker-compose down
   ```

---

### Opção 2: Execução Local (sem Docker)

#### Backend Setup

1. **Configure o ambiente Python:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure o banco de dados:**
   ```bash
   python manage.py migrate
   python manage.py setup_permissions
   ```

4. **Inicie o servidor:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

#### Frontend Setup

1. **Em outro terminal, acesse o frontend:**
   ```bash
   cd frontend
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev -- --host 0.0.0.0 --port 3000
   ```

3. **Acesse em:** http://localhost:3000

---

## 📁 Estrutura do Projeto

```
mber/
├── backend/                    # API Django
│   ├── accounts/              # Autenticação e usuários
│   ├── menu/                  # Gestão de cardápio e categorias
│   ├── config/                # Configurações Django
│   ├── manage.py
│   └── requirements.txt
├── frontend/                  # Aplicação React
│   ├── src/
│   │   ├── api/              # Chamadas HTTP para backend
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── pages/            # Páginas (Home, Admin, Login)
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Funções utilitárias
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml        # Orquestração de containers
└── README.md
```

---

## 🔐 Autenticação e Acesso

### Criar Usuário Admin
```bash
python manage.py createsuperuser
```

### Login
1. Acesse http://localhost:3000/login
2. Insira suas credenciais
3. Token JWT armazenado localmente (validade: configurável)

---

## 🌐 Deploy em Produção

### Render.com
Use o arquivo `docker-compose.yml` como referência para CI/CD.

**Variáveis de Ambiente:**
- `DEBUG=0` (produção)
- `ALLOWED_HOSTS` (domínio da aplicação)
- `DATABASE_URL` (PostgreSQL externa)
- `SECRET_KEY` (chave Django segura)

---

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.example` com:
```
DJANGO_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@db:5432/mber
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🤝 Contribuição

### Workflow de commits
1. Crie uma branch a partir de `staging`: `git checkout -b feature/sua-feature`
2. Faça seus commits com mensagens descritivas
3. Sincronize com `staging` antes de push
4. Abra um Pull Request

---

## 📞 Contato

**MBER - Minas Bar e Restaurante**
- 📱 WhatsApp: [Disponível no app]
- 📍 Endereço: [Disponível no app]

---

## 📜 Licença

Este projeto é privado e de propriedade da MBER.

---

**Última atualização:** Maio/2026 | **Status:** Em desenvolvimento ✅
