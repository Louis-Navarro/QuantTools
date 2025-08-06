import math
from datetime import datetime
from enum import Enum

# import numpy as np
from flask import Flask, render_template, request


class Asset:
    def __init__(self, price: float, volatility: float, dividend: float = 0):
        self.price = price
        self.dividend = dividend
        self.volatility = volatility


class OptionType(Enum):
    CALL = "call"
    PUT = "put"


class BlackScholesMertonOption:
    def __init__(self, asset: Asset, tau: float, strike: float, risk_free: float, option_type: OptionType):
        self.asset = asset
        self.tau = tau
        self.strike = strike
        self.r_f = risk_free
        self.type = option_type

    @staticmethod
    def _normal_cdf(x, mu=0.0, sigma=1.0):
        z = (x - mu) / (sigma * math.sqrt(2))
        return 0.5 * (1 + math.erf(z))

    @property
    def d_plus(self):
        k1 = math.log(self.asset.price / self.strike)
        k2 = (self.r_f - self.asset.dividend +
              self.asset.volatility**2/2) * self.tau

        return 1 / (self.asset.volatility *
                    math.sqrt(self.tau)) * (k1 + k2)

    @property
    def d_minus(self):
        return self.d_plus - self.asset.volatility * math.sqrt(self.tau)

    def price(self):
        F = self.asset.price * \
            math.exp((self.r_f - self.asset.dividend) * self.tau)

        if self.type == OptionType.CALL:
            call = math.exp(-self.r_f * self.tau) * (self._normal_cdf(self.d_plus) * F - self._normal_cdf(self.d_minus) *
                                                     self.strike)
            return call
        else:
            put = math.exp(-self.r_f * self.tau) * (self._normal_cdf(-self.d_minus)
                                                    * self.strike - self._normal_cdf(-self.d_plus) * F)
            return put

    def delta(self):
        prob = math.exp(-self.asset.dividend * self.tau) * \
            self._normal_cdf(self.d_plus)

        if self.type == OptionType.CALL:
            return prob
        else:
            return prob - 1

    def gamma(self):
        return math.exp(-self.asset.dividend * self.tau) * math.exp(-self.d_plus**2 / 2) / (math.sqrt(2*math.pi) * self.asset.price * self.asset.volatility * math.sqrt(self.tau))

    def vega(self, vol_point=True):
        v = math.exp(-self.asset.dividend * self.tau) * self.asset.price * \
            math.sqrt(self.tau) *\
            math.exp(-self.d_plus **
                     2 / 2) / math.sqrt(2*math.pi)

        if vol_point:
            return v/100
        else:
            return v

    def theta(self, dayed=365):
        k1 = self.asset.price * self.asset.volatility * \
            math.exp(-self.d_plus**2 / 2) / \
            (2 * math.sqrt(self.tau) * math.sqrt(2*math.pi))

        k2 = self.r_f * self.strike * math.exp(-self.r_f * self.tau)

        if self.type == OptionType.CALL:
            return math.exp(-self.asset.dividend * self.tau) * (-k1 - k2 * self._normal_cdf(self.d_minus)) / dayed
        else:
            return math.exp(-self.asset.dividend * self.tau) * (-k1 + k2 * self._normal_cdf(-self.d_minus)) / dayed

    def rho(self, points=100):
        prod = self.strike * self.tau * math.exp(-self.r_f * self.tau)

        if self.type == OptionType.CALL:
            return prod * self._normal_cdf(self.d_minus) / points
        else:
            return -prod * self._normal_cdf(-self.d_minus) / points


app = Flask(__name__)


def date_to_days(date_str):
    expire_date = datetime.strptime(date_str, '%Y-%m-%d')
    today = datetime.now()
    days = (expire_date - today).days
    return days


@app.route('/')
def home():
    strike_price = request.args.get('strike_price', type=float, default=100.0)
    current_price = request.args.get(
        'current_price', type=float, default=100.0)
    volatility = request.args.get('volatility', type=float, default=0.2)
    interest_rate = request.args.get('interest_rate', type=float, default=0.05)
    expire_date = request.args.get(
        'expire_date', type=str, default='2025-01-01')
    dividend_yield = request.args.get(
        'dividend_yield', type=float, default=0.02)

    option_settings = {
        'strike_price': strike_price,
        'current_price': current_price,
        'volatility': volatility*100,
        'interest_rate': interest_rate*100,
        'expire_date': expire_date,
        'dividend_yield': dividend_yield*100
    }

    if request.args.get('strike_price', type=float, default=-1.0) == -1.0:
        return render_template('home.html', **option_settings)

    days = date_to_days(expire_date)
    if days <= 0:
        return render_template('home.html', error="Invalid expiry date. Please select a future date.", **option_settings)

    asset = Asset(price=current_price, volatility=volatility,
                  dividend=dividend_yield)

    option_call = BlackScholesMertonOption(
        asset=asset,
        tau=days / 365.0,
        strike=strike_price,
        risk_free=interest_rate,
        option_type=OptionType.CALL
    )
    option_put = BlackScholesMertonOption(
        asset=asset,
        tau=days / 365.0,
        strike=strike_price,
        risk_free=interest_rate,
        option_type=OptionType.PUT
    )

    option_data = {
        'call_price': option_call.price(),
        'put_price': option_put.price(),
        'call_delta': option_call.delta(),
        'put_delta': option_put.delta(),
        'call_gamma': option_call.gamma(),
        'put_gamma': option_put.gamma(),
        'call_vega': option_call.vega(),
        'put_vega': option_put.vega(),
        'call_theta': option_call.theta(),
        'put_theta': option_put.theta(),
        'call_rho': option_call.rho(),
        'put_rho': option_put.rho()
    }

    vol_chart_data = {
        'vols': [],
        'vol_call_prices': [],
        'vol_put_prices': [],
    }

    for vol in range(int(volatility*100*0.5), int(volatility*100*1.5), 1):
        vol /= 100.0

        option_call.asset.volatility = vol
        option_put.asset.volatility = vol

        vol_chart_data['vols'].append(vol)
        vol_chart_data['vol_call_prices'].append(option_call.price())
        vol_chart_data['vol_put_prices'].append(option_put.price())

    time_chart_data = {
        'times': [],
        'time_call_prices': [],
        'time_put_prices': [],
    }

    for day in range(1, days):
        option_call.tau = day / 365.0
        option_put.tau = day / 365.0

        time_chart_data['times'].append(day)
        time_chart_data['time_call_prices'].append(option_call.price())
        time_chart_data['time_put_prices'].append(option_put.price())

    return render_template('home.html', **option_settings, **option_data, **vol_chart_data, **time_chart_data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
