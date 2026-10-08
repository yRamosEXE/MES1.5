📱 MES 1.5 - Aplicativo Mobile

O MES 1.5 Mobile é o aplicativo móvel da suíte de execução de manufatura da GRAEST. Desenvolvido com React Native e Expo, o app destina-se ao monitoramento fabril, verificação do status das máquinas em tempo real, visualização de telemetria e recebimento de alertas com suporte a funcionamento resiliente/offline.

🛠️ Tecnologias Utilizadas

Framework: React Native + Expo (SDK 57)

Linguagem: TypeScript

Navegação: React Navigation (Native Stack)

Comunicação HTTP: Axios (com interceptors para JWT)

Armazenamento Local: @react-native-async-storage/async-storage

Monitoramento de Rede: @react-native-community/netinfo

Build & Distribuição: EAS Build (Expo Application Services)

📂 Estrutura de Diretórios

MES1.5_mobile/
├── assets/                 # Imagens, ícones e splash screen
├── src/
│   ├── components/         # Componentes compartilhados (ex: OfflineBanner)
│   ├── contexts/           # Context API (AuthContext, sessão, JWT)
│   ├── navigation/         # Definição e proteção de rotas públicas/privadas
│   ├── screens/            # Telas do aplicativo (Login, Dashboard, ForgotPassword, etc.)
│   ├── services/           # Instância e interceptors do Axios (api.ts)
│   └── types/              # Tipagens TypeScript e contratos da API
├── .env.example            # Modelo de variáveis de ambiente do projeto
├── app.json                # Configuração do Expo e metadados nativos
├── eas.json                # Perfis de build para Android/iOS via EAS
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configuração do TypeScript


⚙️ Pré-requisitos

Antes de iniciar, certifique-se de possuir instalado em sua máquina de desenvolvimento:

Node.js (versão 18 LTS ou superior)

npm ou yarn

Expo CLI e EAS CLI instalados globalmente:

npm install -g expo-cli eas-cli


Expo Go instalado no smartphone (disponível na Google Play Store e Apple App Store) para testes rápidos durante o desenvolvimento.

### ⚙️ Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou copie de `.env.example`):

```bash
cp .env.example .env

Preencha as variáveis com os endereços da infraestrutura:

# URL base da API NestJS (via ngrok estático ou rede local)
EXPO_PUBLIC_API_URL=[https://keep-deck-coauthor.ngrok-free.dev/api/v1](https://keep-deck-coauthor.ngrok-free.dev/api/v1)

# URL da plataforma Web para solicitação e cadastro de acesso
EXPO_PUBLIC_WEB_REGISTER_URL=[https://keep-deck-coauthor.ngrok-free.dev/cadastro](https://keep-deck-coauthor.ngrok-free.dev/cadastro)

Atenção:

O arquivo .env real nunca deve ser versionado no Git (ele já está listado no .gitignore).

Se estiver testando localmente com o backend no seu computador e o app no celular, ambos precisam estar conectados na mesma rede Wi-Fi (ou utilizando a URL estática do Ngrok para acesso externo).

🚀 Como Executar o Projeto Localmente

Instale as dependências:

npm install

Inicie o servidor de desenvolvimento Metro Bundler:

npx expo start --host lan -c

Abrir o aplicativo:

No Celular: Abra o app Expo Go e aponte a câmera para o QR Code impresso no terminal.

No Emulador Android: Pressione a tecla a no terminal.

No Simulador iOS (macOS): Pressione a tecla i no terminal.

📦 Como Gerar o Arquivo APK Independente (Standalone)

Para rodar o aplicativo de forma nativa e independente em aparelhos Android (sem precisar abrir o Expo Go), utilizamos o EAS Build.

    Autenticar no EAS

Faça login com a sua conta da Expo no terminal:

eas login

    Definir Variáveis de Ambiente no EAS (Nuvem)

Como o arquivo .env não é enviado para o repositório remoto, configure as variáveis diretamente no EAS para que o build na nuvem tenha acesso a elas:

eas env:set preview --name EXPO_PUBLIC_API_URL --value https://keep-deck-coauthor.ngrok-free.dev/api/v1 --type string
eas env:set preview --name EXPO_PUBLIC_WEB_REGISTER_URL --value https://keep-deck-coauthor.ngrok-free.dev/cadastro --type string

    Verificar a Configuração de Build (eas.json)

Certifique-se de que o arquivo eas.json na raiz contém o profile preview configurado para gerar apk:

{
"cli": {
"version": ">= 15.0.0",
"appVersionSource": "remote"
},
"build": {
"development": {
"developmentClient": true,
"distribution": "internal"
},
"preview": {
"distribution": "internal",
"android": {
"buildType": "apk"
}
},
"production": {
"autoIncrement": true
}
}
}

    Disparar a Compilação do APK

Execute o comando de build na nuvem:

eas build -p android --profile preview

    Instalação do APK

Ao concluir a compilação, o terminal exibirá uma URL de download e um QR Code.

Abra o link ou escaneie o QR Code em qualquer dispositivo Android para fazer o download direto do .apk.

No Android, autorize a instalação de aplicativos de fontes externas quando solicitado e conclua a instalação.

📡 Resiliência e Comportamento Offline

Redirecionamento para Cadastro Web: O cadastro de novos usuários é centralizado na aplicação web corporativa; na tela de login, o usuário é redirecionado nativamente ao navegador padrão para solicitar acesso.

Persistência de Sessão: Ao realizar login com sucesso, o token JWT e os dados cadastrais do operador são salvos no AsyncStorage.

Abertura sem Conexão: Caso o app seja reiniciado sem conectividade com o servidor, ele não fecha nem retorna abruptamente à tela de login; o usuário autenticado é recuperado do cache local.

Detecção de Queda de Rede: O componente global OfflineBanner monitora o estado da interface via @react-native-community/netinfo, notificando visualmente o operador caso a conexão com a rede fabril seja interrompida.