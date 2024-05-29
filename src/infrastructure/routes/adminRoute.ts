
import express from 'express'
import AdminController from '../../adaptors/controllers/adminController'
import AdminUseCase from '../../use-cases/adminUseCase'
import AdminRepository from '../repository/adminRepository' 
import JwtToken from '../utils/JwtToken'
const router = express.Router()



const jwt = new JwtToken(process.env.JWT_SECRET as string)
const adminRepository = new AdminRepository()
const adminCase = new AdminUseCase(adminRepository, jwt)

const controller = new AdminController(adminCase)
 


router.post('/login', (req, res) => controller.login(req, res))
router.post('/create', (req, res) => controller.createAdmin(req, res))


export default router