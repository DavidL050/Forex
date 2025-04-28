from app import app, db, User, Session  # Asegúrate de que Session esté importado
from werkzeug.security import generate_password_hash

def init_db():
    with app.app_context():
        try:
            # Eliminar todas las tablas existentes
            db.drop_all()
            print("✅ Tablas existentes eliminadas.")
            
            # Crear todas las tablas
            db.create_all()
            print("✅ Nuevas tablas creadas.")

            # Crear usuario de prueba con contraseña hasheada
            if not User.query.filter_by(username='admin').first():
                user = User(
                    username='admin',
                    password=generate_password_hash('admin123'),  # Contraseña segura
                    preferences={"preferred_currencies": ["EUR/USD", "USD/JPY"]}
                )
                db.session.add(user)
                db.session.commit()
                print("✅ Usuario de prueba creado exitosamente!")
            else:
                print("ℹ️ El usuario admin ya existe")
                
        except Exception as e:
            print(f"❌ Error durante la inicialización: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    print("🔄 Inicializando la base de datos...")
    try:
        init_db()
        print("🎉 Base de datos inicializada con éxito!")
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {str(e)}")
