from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import jwt
from datetime import datetime, timedelta
import requests
import yfinance as yf

app = Flask(__name__)

# Configuración de la base de datos PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/forex_dashboard'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Cambia esto en producción

db = SQLAlchemy(app)

# Modelo de Usuario
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    preferences = db.Column(db.JSON, default={"preferred_currencies": ["EUR/USD", "USD/JPY"]})

# Configuración de CORS
# Fix the CORS configuration
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5001"], # Add your actual frontend origin
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
# Función para generar token JWT
def generate_token(user_id):
    token = jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return token

# Decorador para proteger rutas
def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': f'Token validation error: {str(e)}'}), 401
        
        return f(current_user, *args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and user.password == data.get('password'):
        token = generate_token(user.id)
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'token': token
        })
    
    return jsonify({
        'status': 'error',
        'message': 'Invalid credentials'
    }), 401

@app.route('/api/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/user/preferences', methods=['GET', 'PUT'])
@token_required
def preferences(current_user):
    if request.method == 'GET':
        return jsonify(current_user.preferences)
    elif request.method == 'PUT':
        data = request.get_json()
        current_user.preferences = data
        db.session.commit()
        return jsonify({"message": "Preferencias actualizadas exitosamente"}), 200

@app.route('/api/currencies', methods=['GET'])
def get_currencies():
    currencies = [
        "EUR/USD", 
        "USD/JPY", 
        "GBP/USD", 
        "USD/CHF", 
        "USD/CAD", 
        "AUD/USD", 
        "NZD/USD"
    ]
    return jsonify(currencies)

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

    params = {
        'app_id': app_id,
        'base': 'USD',
        'symbols': symbols
    }

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
    analysis = {
        "pair": currency_pair,
        "analysis": "BUY",
        "indicators": {
            "rsi": 65,
            "macd": "bullish",
            "moving_averages": "uptrend"
        }
    }
    return jsonify(analysis)

@app.route('/api/history/<base>/<quote>', methods=['GET'])
def get_price_history(base, quote):
    try:
        app.logger.info(f"Requesting price history for {base}/{quote}")
        
        # Use the correct Yahoo Finance symbol format
        symbol = f"{base}{quote}=X"
        
        app.logger.info(f"Using Yahoo Finance symbol: {symbol}")
        
        # Improved error handling
        try:
            data = yf.download(symbol, period="1mo", interval="1d")
            app.logger.info(f"Downloaded data shape: {data.shape}")
        except Exception as e:
            app.logger.error(f"yfinance download error: {str(e)}")
            return jsonify({"error": f"Error downloading data: {str(e)}"}), 500
        
        if data.empty:
            app.logger.warning(f"No data found for {symbol}")
            return jsonify({"error": f"No se encontraron datos para {base}/{quote}"}), 404
        
        # Process data as before...
        history = []
        for date, row in data.iterrows():
            try:
                entry = {
                    "date": date.strftime('%Y-%m-%d'),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close'])
                }
                history.append(entry)
            except Exception as e:
                app.logger.warning(f"Error processing row: {e}")
                continue
        
        app.logger.info(f"Returning {len(history)} data points")
        return jsonify(history)

    except Exception as e:
        app.logger.error(f"Unexpected error in get_price_history: {str(e)}")
        return jsonify({"error": str(e)}), 500
        
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001, host='0.0.0.0')
