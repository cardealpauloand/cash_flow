# Money API – Laravel 11 + JWT (PostgreSQL)

## Requisitos

-   PHP 8.2+
-   Composer
-   PostgreSQL 13+ (pode usar MySQL alterando o .env)

## Setup rápido

```bash
composer create-project laravel/laravel money-api
cd money-api
composer require php-open-source-saver/jwt-auth:^2.2
composer require doctrine/dbal --dev
composer require pestphp/pest --dev --with-all-dependencies
php artisan pest:install

# Copie o overlay deste repositório por cima do projeto

php artisan vendor:publish --provider="PHPOpenSourceSaver\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret

# .env (exemplo)
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=money
# DB_USERNAME=postgres
# DB_PASSWORD=postgres

php artisan migrate --seed
php artisan serve
```

Rotas
• Auth: POST /api/auth/register, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout
• Users: GET /api/users/me, PUT /api/users/me
• Accounts: CRUD /api/accounts
• Transactions: GET/POST/GET(id)/DELETE em /api/transactions

Notas
• Campo de senha usa password_hash conforme o schema; a autenticação JWT lê via getAuthPassword() no User.
• Transferências são persistidas como uma transação com dois installments: income (destino) e expense (origem).
• Validações com FormRequests.
• Policies restringem acesso a recursos do próprio usuário.
• Coleções Postman/Insomnia em docs/.
