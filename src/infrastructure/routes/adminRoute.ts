
import express from 'express'
import AdminController from '../../adaptors/controllers/adminController'
import AdminUseCase from '../../use-cases/adminUseCase'
import AdminRepository from '../repository/adminRepository'
 
import JwtToken from '../utils/JwtToken'
import adminAuthenticate from "../middlewares/adminAuth"
const router = express.Router()



const jwt = new JwtToken(process.env.JWT_SECRET as string)
const adminRepository = new AdminRepository()
const adminCase = new AdminUseCase(adminRepository, jwt)


const controller = new AdminController(adminCase)   
 


router.post('/login', (req, res, next) => controller.login(req, res, next)) 
router.post('/create', (req, res, next) => controller.createAdmin(req, res, next))
router.get('/candidates-list',adminAuthenticate,  (req, res, next) => controller.getAllCandidates(req, res, next))
router.put('/block-candidate/:id',adminAuthenticate, (req, res, next) => controller.blockCandidate(req, res, next) )
router.post('/logout', (req, res, next) => controller.logout(req, res, next))

router.post('/add-stack',adminAuthenticate, (req, res, next) => controller.addStack(req, res, next))
router.get('/stacks-list',adminAuthenticate, (req, res, next) => controller.getAllStacks(req, res, next))
router.put('/unlist-stack/:id', adminAuthenticate, (req, res, next) => controller.unlistStack(req, res, next))

router.get('/interviewers-list',adminAuthenticate, (req, res, next) => controller.getAllInterviewers(req, res, next))
router.get('/interviewer/:id',adminAuthenticate, (req, res, next) => controller.getInterviewerDetails(req, res, next))

router.put('/approve-interviewer/:id',adminAuthenticate, (req, res, next) => controller.approveInterviewer(req, res, next))


export default router