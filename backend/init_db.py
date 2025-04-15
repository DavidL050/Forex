from app import app, db, User

def init_db():
    with app.app_context():
        try:
            # Drop existing tables
            db.drop_all()
            print("Tablas existentes eliminadas.")
            
            # Create all tables
            db.create_all()
            print("Nuevas tablas creadas.")

            # Create test user if not exists
            if not User.query.filter_by(username='admin').first():
                user = User(
                    username='admin',
                    password='admin123',
                    preferences={"preferred_currencies": ["EUR/USD", "USD/JPY"]}
                )
                db.session.add(user)
                db.session.commit()
                print("Usuario de prueba creado exitosamente!")
            else:
                print("El usuario admin ya existe")
                
        except Exception as e:
            print(f"Error durante la inicialización: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    print("Inicializando la base de datos...")
    try:
        init_db()
        print("Base de datos inicializada con éxito!")
    except Exception as e:
        print(f"Error al inicializar la base de datos: {str(e)}")