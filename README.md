# Option Pricing Calculator

## Table of Contents

- [Overview](#overview)
- [Black Scholes Merton Model](#black-scholes-merton-model)
- [Greeks](#greeks)
- [How To Use The Website](#how-to-use-the-website)
  - [Calculated Information](#calculated-information)

## Overview

This project aims to offer an easy-to-use calculator to determine the price of European options given the parameters.

The project uses the Black Scholes Merton model to efficiently and accurately calculate the options values and their Greeks.

## Black Scholes Merton Model

This model prices options such that a continuously delta hedged portfolio has an expected discounted return of 0. Equivalently, with the risk-neutral assumption, holding an option should have the same expected return as the risk free rate.

Merton's contribution added the dividend into the formula, assuming a continuously paid dividend.

Given the following parameters:

- $S$: asset spot, or current, price,
- $K$: option strike price,
- $r$: risk free return rate,
- $\tau$: years left until option expiry date,
- $q$: dividend yield of the asset,
- $\sigma$: volatility of the asset.

The prices for a call is given by:
$$C = e^{-r\tau}(FN(d_1)-KN(d_2))$$
and the price of a put option is given by:
$$P = e^{-r\tau}(KN(-d_2)-FN(-d_1))$$

where:

- $F=Se^{(r-q)\tau}$.
- $d_1 =\frac{1}{\sigma\sqrt{\tau}}[\ln{\frac S K}+(r-q+\frac{\sigma^2}{2})\tau]$.
- $d_2 = d_1 - \sigma\sqrt{\tau}$.

and $N$ is the cumulative distribution function of the standard normal distribution, given by:
$$N(x) = \frac{1}{\sqrt{2\pi}} \int\limits_{-\infty}^x{e^{-\frac{t^2}{2}}dt}$$

## Greeks

The Greeks are the partial derivatives of the options prices with respect to the variables:

- Delta ($\Delta$) is the partial derivative with respect to the asset's spot price ($\frac{\partial C}{\partial S}$).
- Gamma ($\Gamma$) is the second partial derivative with respect to the asset's spot price ($\frac{\partial^2 C}{\partial S^2}$).
- Vega ($\nu$) is the partial derivative with respect to the asset's volatility ($\frac{\partial C}{\partial \sigma}$).
- Theta ($\Theta$) is the partial derivative with respect to the contract's time until expire ($\frac{\partial C}{\partial \tau}$).
- Rho ($\rho$) is the partial derivative with respect to the risk free rate ($\frac{\partial C}{\partial r}$).

## How To Use The Website

The website is straightforward:

- Input the asset's data, the contract's expiry date and the risk free rate,
- Click on "Calculate Options"
- Admire the results!

### Calculated Information

The calculator returns multiple values. The most interesting information are the option prices and the greeks, all shown in the table below the form. Here you will find the different values for both a call option and put option.

Below the table, there is an option to view 3 different graphs:

- The "P&L at expiry" shows how much profit or loss you can expect depending on the actual price of the asset at the expiry.
- The "Volatility impact" shows the contracts' prices depending on volatility, allowing you to analyse the price with uncertainty in the asset's volatility
- The "Time Decay" is there to represent the _memento mori_, be careful with holding your options too long since they lose value quickly, especially at the end!
