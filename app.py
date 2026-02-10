import secrets
import argparse
from datetime import datetime

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(32)

# Хранилище запросов
requests_log = []


def get_request_data(request) -> dict:
    return {
        "method": request.method,
        "url": str(request.url),
        "host": request.remote_addr,
        "date": datetime.now().strftime('%d-%m-%Y %H:%M:%S'),
        "headers": dict(request.headers),
        "query": dict(request.args),
        "body": request.get_data(as_text=True),
        "size": request.content_length or 0
    }


@app.route('/catch', methods=['GET', 'POST'])
def catch_request():
    data = get_request_data(request)
    data['id'] = len(requests_log) + 1
    requests_log.append(data)
    return data


@app.route('/clear', methods=['GET', 'POST'])
def clear_requests():
    global requests_log
    requests_log = []
    return jsonify({'status': 'cleared'})


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    return render_template("index.html")


@app.route('/api/requests', methods=['GET'])
def get_all_requests():
    return jsonify(requests_log)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', type=int, default=17032, help='Порт сервера (по умолчанию: 17032)')
    parser.add_argument('-d', '--debug', action='store_true', help='Включить debug режим')
    args = parser.parse_args()

    app.config['DEBUG'] = args.debug

    print("=" * 60)
    print("[+]  Сервер запущен!")
    print(f"[+]  Дашборд: http://localhost:{args.port}")
    print(f"[+]  Маршрут для перехвата: http://localhost:{args.port}/catch")
    print(f"[+]  app.config['SECRET_KEY']: {app.config['SECRET_KEY']}")
    print("=" * 60)

    app.run(host='0.0.0.0', port=args.port, debug=args.debug)
