import Admin from "../domain/entitites/admin";
import AppError from "../infrastructure/utils/appError";
import IAdminRepository from "../interface/repositories/IAdminRepository";
import IJwtToken from "../interface/utils/IJwtToken";

class AdminUseCase {
  constructor(
    public iAdminRepository: IAdminRepository,
    private jwtToken: IJwtToken
  ) {}

  async adminLogin(email: string, password: string) {
    const adminFound = await this.iAdminRepository.findByEmail(email);

    if (!adminFound) {
      throw new AppError("Invalid Email", 400);
    }

    if (adminFound.password !== password) {
      throw new AppError("Invalid Password", 401);
    }

    const token = this.jwtToken.createJwtToken(
      adminFound._id as string,
      "admin"
    );

    return { success: true, adminData: adminFound._id, token };
  }

  async createAdmin(name: string, email: string, password: string) {
    const existingAdmin = await this.iAdminRepository.findByEmail(email);
    if (existingAdmin) {
      throw new AppError("Admin with this email already exists", 400);
    }

    const newAdmin = { name, email, password };
    await this.iAdminRepository.create(newAdmin);

    return {
      success: true,
      message: "Admin created successfully",
      adminData: newAdmin,
    };
  }

  async getAllCandidates() {
    const candidateList = await this.iAdminRepository.findAllCandidates();
    return candidateList;
  }

  async getAllInterviewers() {
    const interviewersList = await this.iAdminRepository.findAllInterviewers();
    return interviewersList;
  }

  async interviewerDetails(id: string) {
    const interviewerDetails =
      await this.iAdminRepository.getInterviewerDetails(id);
    return interviewerDetails;
  }

  async blockCandidate(candidateId: string) {
    const candidateBlocked = await this.iAdminRepository.blockCandidate(
      candidateId
    );
    return candidateBlocked;
  }

  async unlistStack(stackId: string) {
    const stackUnlist = await this.iAdminRepository.unlistStack(stackId);
    return stackUnlist;
  }

  async approveInterviewer(interviewerId: string) {
    const interviewerApproved = await this.iAdminRepository.approveInterviewer(
      interviewerId
    );
    return interviewerApproved;
  }

  async addStack(stackName: string, technologies: string[]) {
    const stackAdded = await this.iAdminRepository.addStack(
      stackName,
      technologies
    );
    if (stackAdded) {
      return { success: true, message: "Stack added successfully" };
    }
    throw new AppError("Failed to add stack", 400);
  }

  async getAllStacks() {
    const stacksList = this.iAdminRepository.findAllStacks();
    return stacksList;
  }
}

export default AdminUseCase;
