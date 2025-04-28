from flask import Flask, jsonify, request, make_response, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import jwt
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import requests
import yfinance as yf

app = Flask(__name__)

# Configuración de la base de datos PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/forex_dashboard'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Inicialización
db = SQLAlchemy(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    preferences = db.Column(db.JSON, default={"preferred_currencies": ["EUR/USD", "USD/JPY"]})

class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    token = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    user = db.relationship('User', backref=db.backref('sessions', lazy=True))

# CORS
CORS(app,
     origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5001"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Funciones de autenticación
def generate_token(user_id):
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Revisar en cookies primero
        token = request.cookies.get('token')
        
        # Si no está en cookies, revisar el header de Authorization
        if not token and 'Authorization' in request.headers:
            auth_header = request.headers.get('Authorization')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Rutas
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and check_password_hash(user.password, data.get('password')):
        token = generate_token(user.id)
        response = make_response(jsonify({'status': 'success', 'message': 'Login successful', 'token': token}))
        response.set_cookie('token', token, httponly=True, samesite='Lax')

        session = Session(user_id=user.id, token=token)
        db.session.add(session)
        db.session.commit()

        return response
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@token_required
def logout(current_user):
    token = request.cookies.get('token')
    if token:
        Session.query.filter_by(user_id=current_user.id, token=token).delete()
        db.session.commit()
    response = make_response(jsonify({'message': 'Logout successful'}))
    response.set_cookie('token', '', expires=0)  # Eliminar la cookie
    return response

@app.route('/api/user/preferences', methods=['GET', 'PUT'])
@token_required
def preferences(current_user):
    if request.method == 'GET':
        return jsonify(current_user.preferences)
    elif request.method == 'PUT':
        data = request.get_json()
        if not data or 'preferred_currencies' not in data:
            return jsonify({"error": "Datos inválidos"}), 400
        current_user.preferences = data
        db.session.commit()
        return jsonify({"message": "Preferencias actualizadas exitosamente"}), 200

@app.route('/api/verify-token', methods=['GET', 'POST'])
@token_required
def verify_token(current_user):
    # Si llega aquí, el token es válido
    return jsonify({'isValid': True, 'user_id': current_user.id}), 200

@app.route('/api/currencies', methods=['GET'])
def get_currencies():
    return jsonify(["EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD"])

@app.route('/api/rates', methods=['GET'])
@token_required
def get_exchange_rates(current_user):
    api_url = 'https://openexchangerates.org/api/latest.json'
    app_id = 'e197206720a548a38bdc178d7ce33109'
    pairs = request.args.get('pairs', '')
    symbols = 'EUR,GBP,JPY,CHF,AUD,CAD,NZD'
    if pairs:
        pair_list = pairs.split(',')
        symbols = ','.join(set([currency for pair in pair_list for currency in pair.split('/')]))
    params = {'app_id': app_id, 'base': 'USD', 'symbols': symbols}
    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        data = response.json()
        if 'error' in data:
            return jsonify({"error": f"API error: {data.get('description', 'Unknown error')}"}), 500
        return jsonify(data.get('rates', {})), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analysis/<currency_pair>', methods=['GET'])
@token_required
def get_technical_analysis(current_user, currency_pair):
    return jsonify({
        "pair": currency_pair,
        "analysis": "BUY",
        "indicators": {
            "rsi": 65,
            "macd": "bullish",
            "moving_averages": "uptrend"
        }
    })

@app.route('/api/history/<path:currency_pair>', methods=['GET'])
@token_required
def get_price_history(current_user, currency_pair):
    try:
        # Separar EUR/USD
        base, quote = currency_pair.split('/')
        symbol = f"{base}{quote}=X"
        data = yf.download(symbol, period="1mo", interval="1d")
        if data.empty:
            return jsonify({"error": f"No se encontraron datos para {currency_pair}"}), 404
        history = []
        for date, row in data.iterrows():
            history.append({
                "date": date.strftime('%Y-%m-%d'),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
            })

        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def landing():
    return render_template('landing.html')

# Manejador de errores para rutas no encontradas
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found", "path": request.path}), 404

# Inicializar
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001, host='0.0.0.0')
