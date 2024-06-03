
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
 


router.post('/login', (req, res) => controller.login(req, res)) 
router.post('/create', (req, res) => controller.createAdmin(req, res))
router.get('/candidates-list',adminAuthenticate,  (req, res) => controller.getAllCandidates(req, res))
router.put('/block-candidate/:id',adminAuthenticate, (req, res) => controller.blockCandidate(req, res) )
router.post('/logout', (req, res) => controller.logout(req, res))

router.post('/add-stack',adminAuthenticate, (req, res) => controller.addStack(req, res))
router.get('/stacks-list',adminAuthenticate, (req, res) => controller.getAllStacks(req, res))
router.get('/unlist')

router.get('/interviewers-list',adminAuthenticate, (req, res) => controller.getAllInterviewers(req, res))
router.get('/interviewer/:id',adminAuthenticate, (req, res) => controller.getInterviewerDetails(req, res))

router.put('/approve-interviewer/:id',adminAuthenticate, (req, res) => controller.approveInterviewer(req, res))


export default router