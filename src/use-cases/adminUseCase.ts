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

  async getAllCandidates(page: number, limit: number) {
    const {candidates, total} = await this.iAdminRepository.findAllCandidates(page, limit);
    return {candidates, total};
  }

  async getAllInterviewers(page: number, limit: number) {
    const {interviewers, total} = await this.iAdminRepository.findAllInterviewers(page, limit);
    return {interviewers, total};
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

  async getAllStacks(page: number, limit: number) {
    const {stacks, total} = await this.iAdminRepository.findAllStacks(page, limit);
    return {stacks, total};
  }


  async getAllInterviews(page: number, limit: number) {
    const {interviews, total} = await this.iAdminRepository.findAllInterviews(page, limit)
    return {interviews, total}
  }

  async getDashboardDetails() {
    const details = await this.iAdminRepository.dashboardDetails()
    return details
  }
}

export default AdminUseCase;
