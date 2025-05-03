# backend/run.py
from app import create_app, db
from flask_migrate import Migrate

app = create_app()
migrate = Migrate(app, db) # Certifique-se que o migrate está configurado aqui também

# Comandos úteis do Flask-Migrate (executar no terminal na pasta backend)
# flask db init  (apenas na primeira vez)
# flask db migrate -m "Mensagem da migração" (sempre que mudar models.py)
# flask db upgrade (para aplicar as migrações ao banco de dados)

if __name__ == '__main__':
    # Cria as tabelas se o banco de dados (SQLite) não existir
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000) # Executa em modo debug na porta 5000