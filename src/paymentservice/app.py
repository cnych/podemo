import os
import random
import time
import requests
from flask import Flask, request, jsonify, g, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from tracer import tracer
from opentelemetry import trace
from opentelemetry.semconv.trace import SpanAttributes
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://otel:otel321@localhost/bookdb'
CORS(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# 创建一个 propagator 实例
propagator = TraceContextTextMapPropagator()


@app.before_request
def start_span():
    # 从请求头中去获取 Trace Context
    parent_context = propagator.extract(request.headers)
    # 创建一个 Span
    span = tracer.start_span(f"{request.method} {request.path}", context=parent_context)
    # 设置 Span 的属性
    span.set_attribute(SpanAttributes.HTTP_METHOD, request.method)
    span.set_attribute(SpanAttributes.HTTP_URL, request.path)
    # 把 span 存储在 g 对象中，方便后续处理使用
    g.span = span


@app.after_request
def end_span(response):
    span = g.get("span")
    if span:
        # 设置 Span 的属性
        span.set_attribute(SpanAttributes.HTTP_STATUS_CODE, response.status_code)
        # 结束 Span
        span.end()
    return response


def jwt_middleware():
    def middleware():
        # 从 Header 中获取 JWT Token
        token = request.headers.get("Authorization")
        if not token:
            abort(401, "Token is missing")

        headers = {"Authorization": token}

        # 设置当前的 span
        with trace.use_span(g.span):
            # 注入 Trace Context（当前上下文中的span）
            propagator.inject(headers)

        # 请求用户服务获取用户信息
        response = requests.get(
            os.getenv("USER_SERVICE_URL") + "/api/userinfo",
            headers=headers,
        )
        # 检查响应状态
        if response.status_code != 200:
            abort(401, "Invalid Token")

        user_info = response.json()
        g.user_info = user_info

    return middleware


# 注册中间件
app.before_request(jwt_middleware())


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)
    payed_at = db.Column(db.DateTime, server_default=db.func.now())


@app.route("/api/payments", methods=["POST"])
def create_payment():
    # 从 g 对象中获取 Span
    span = g.span

    # 实际场景更多会从消息队列中去获取订单信息
    # 这里为了方便，直接从请求中获取
    order_id = request.json.get("order_id")
    # 应该先从 Header 中获取 JWT Token，然后请求用户服务获取用户信息
    token = request.headers.get("Authorization")

    user_id = g.user_info.get("id")

    amount = request.json.get("amount")

    span.set_attribute("order_id", order_id)
    span.set_attribute("user_id", user_id)

    # 模拟支付过程，随机 Sleep 0.5-2 秒
    time.sleep(random.randint(5, 20) / 10)

    payment = Payment(order_id=order_id, user_id=user_id, amount=amount, status=1)
    db.session.add(payment)
    db.session.commit()

    # 记录事件
    span.add_event(
        "payment_created",
        {"order_id": order_id, "user_id": user_id, "amount": amount},
    )

    # TODO：应该发送消息到消息队列，通知订单服务更新订单状态
    with trace.use_span(span):
        headers = {"Authorization": token}
        propagator.inject(headers)
        # 这里为了方便，直接调用订单服务的 API 来处理
        requests.post(
            "{}/api/orders/{}/status/{}".format(
                os.getenv("ORDER_SERVICE_URL"), order_id, 2
            ),
            headers=headers,
        )

    # TODO：记录日志
    span.add_event("payment_updated", {"order_id": order_id, "status": 2})

    return jsonify({"id": payment.id}), 201


@app.route("/api/payments", methods=["GET"])
def get_payments():
    payments = Payment.query.all()
    return jsonify(
        [
            {
                "id": p.id,
                "order_id": p.order_id,
                "user_id": p.user_id,
                "amount": p.amount,
            }
            for p in payments
        ]
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8083, debug=True)
