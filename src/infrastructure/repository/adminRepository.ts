import IAdminRepository from "../../use-cases/interface/IAdminRepository";
import { AdminModel } from "../database/adminModel";
import Admin from "../../domain/entitites/admin";

class AdminRepository implements IAdminRepository {
    
  async findByEmail(email: string): Promise<Admin | null> {
    const adminExists = await AdminModel.findOne({ email: email });
    if (adminExists) {
      return adminExists;
    }
    return null;
  }

  async create(admin: Admin): Promise<void> {
      const newAdmin = new AdminModel(admin)
      await newAdmin.save()
  }
}

export default AdminRepository;
