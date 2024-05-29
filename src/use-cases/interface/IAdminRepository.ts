import Admin from '../../domain/entitites/admin'


interface IAdminRepository {
    
    findByEmail(email: string): Promise<Admin | null>
    create(admin: Admin): Promise<void>

}


export default IAdminRepository