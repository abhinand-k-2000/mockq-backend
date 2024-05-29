import Admin from "../domain/entitites/admin";
import IAdminRepository from "./interface/IAdminRepository";
import JwtToken from "../infrastructure/utils/JwtToken";


class AdminUseCase {
    constructor(public iAdminRepository: IAdminRepository,
        private jwtToken: JwtToken 
    ){
        this.iAdminRepository = iAdminRepository;
        this.jwtToken = jwtToken
    }

    async adminLogin(email: string, password: string){
        try {
            const adminFound = await this.iAdminRepository.findByEmail(email);
            if(adminFound){
                if(adminFound.password === password){
                    const token = this.jwtToken.createJwtToken(adminFound._id as string, 'admin')
                    return {success: true, adminData: adminFound, token}
                }else {
                    return {success: false, message: 'Invalid Password'}
                }
            }else {
                return {success: false, message: 'Invalid Email'}
            }
        } catch (error) {
            console.log(error)
        }
    }

    async createAdmin(name: string, email: string, password: string){
        try {
            const existingAdmin = await this.iAdminRepository.findByEmail(email);
            if(existingAdmin){
                return {success: false, message: "Admin with this email already exists"}
            }
            
            const newAdmin: Admin = {name, email, password};
             await this.iAdminRepository.create(newAdmin)
            
            return {success: true, message: "Admin created successfully", adminData: newAdmin}
        } catch (error) {
            console.log(error)
        }
    }

    adminLogout() {

    }
}


export default AdminUseCase


