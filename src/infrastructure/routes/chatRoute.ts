import express from 'express'
import ChatController from '../../adaptors/controllers/chatController'
import ChatUseCase from '../../use-cases/chatUseCase'
import ChatRepository from '../repository/chatRepository'
import MessageRepository from '../repository/messageRepository'
import candidateAuth from '../middlewares/candidateAuth'

const router = express.Router()


const chatRepository = new ChatRepository()
const messageRepository = new MessageRepository()

const useCase = new ChatUseCase(messageRepository, chatRepository)
const controller = new ChatController(useCase)



router.post('/',candidateAuth, (req, res, next) => controller.accessChat(req, res, next))
router.get('/', candidateAuth, (req, res, next) => controller.fetchChats(req, res, next))

router.post('/group', candidateAuth, (req, res, next) => controller.createGroupChat(req, res, next))
router.put('/group-add', candidateAuth, (req, res, next) => controller.addToGroup(req, res, next))
router.put('/group-remove', candidateAuth, (req, res, next) => controller.removeFromGroup(req, res, next))





router.post('/send-message', candidateAuth, (req, res, next) => controller.saveMessage(req, res, next))
router.get('/messages/:chatId', candidateAuth, (req, res, next) => controller.getAllMessages(req, res, next))


 
export default router

   