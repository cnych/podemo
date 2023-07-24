from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://otel:otel321@localhost/bookdb'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    

@app.route('/payments', methods=['POST'])
def create_payment():
    # 实际场景更多会从消息队列中去获取订单信息
    # 这里为了方便，直接从请求中获取
    order_id = request.json.get('order_id')
    user_id = request.json.get('user_id')
    amount = request.json.get('amount')

    # TOOD：模拟支付过程，随机失败
    
    payment = Payment(order_id=order_id, user_id=user_id, amount=amount)
    db.session.add(payment)
    db.session.commit()

    return jsonify({'id': payment.id}), 201


@app.route('/payments', methods=['GET'])
def get_payments():
    payments = Payment.query.all()
    return jsonify([{'id': p.id, 'order_id': p.order_id, 'user_id': p.user_id, 'amount': p.amount} for p in payments])


if __name__ == '__main__':
    app.run(port=5002, debug=True)
    