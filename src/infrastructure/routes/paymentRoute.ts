import express from 'express'
const router = express.Router()

import PaymentController from '../../adaptors/controllers/paymentController'
import PaymentUseCase from '../../use-cases/paymentUseCase'
import StripePayment from '../utils/stripePayment'
import PaymentRepository from '../repository/paymentRepository'
import candidateAuthenticate from "../middlewares/candidateAuth"


const stripe = new StripePayment()
const repository = new PaymentRepository()
const useCase = new PaymentUseCase(stripe, repository)
const controller = new PaymentController(useCase)

router.post('/create-payment', candidateAuthenticate, (req, res, next) => controller.makePayment(req, res, next))

router.post('/webhook', express.raw({type: 'application/json'}), (req, res, next ) => controller.handleWebhook(req, res, next))




export default router  