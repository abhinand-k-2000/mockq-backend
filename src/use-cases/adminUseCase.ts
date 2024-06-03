import Admin from "../domain/entitites/admin";
import IAdminRepository from "./interface/IAdminRepository";
import JwtToken from "../infrastructure/utils/JwtToken";

class AdminUseCase {
  constructor(
    public iAdminRepository: IAdminRepository,
    private jwtToken: JwtToken
  ) {
    this.iAdminRepository = iAdminRepository;
    this.jwtToken = jwtToken;
  }

  async adminLogin(email: string, password: string) {
    try {
      const adminFound = await this.iAdminRepository.findByEmail(email);
      if (adminFound) {
        if (adminFound.password === password) {
          const token = this.jwtToken.createJwtToken(
            adminFound._id as string,
            "admin"
          );
          return { success: true, adminData: adminFound, token };
        } else {
          return { success: false, message: "Invalid Password" };
        }
      } else {
        return { success: false, message: "Invalid Email" };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createAdmin(name: string, email: string, password: string) {
    try {
      const existingAdmin = await this.iAdminRepository.findByEmail(email);
      if (existingAdmin) {
        return {
          success: false,
          message: "Admin with this email already exists",
        };
      }

      const newAdmin: Admin = { name, email, password };
      await this.iAdminRepository.create(newAdmin);

      return {
        success: true,
        message: "Admin created successfully",
        adminData: newAdmin,
      };
    } catch (error) {
      console.log(error);
    }
  }

  adminLogout() {}

  async getAllCandidates() {
    try {
      const candidateList = await this.iAdminRepository.findAllCandidates();
      return candidateList;
    } catch (error) {
      throw new Error("Failed to fetch candidates");
    }
  }

  async getAllInterviewers() {
    try {
      const interviewersList = await this.iAdminRepository.findAllInterviewers();
      return interviewersList
    } catch (error) {
      throw new Error("Failed to fetch interviewers")
    }
  }

  async interviewerDetails(id: string) {
    try {
      const interviewerDetails = await this.iAdminRepository.getInterviewerDetails(id)
      return interviewerDetails
    } catch (error) {
      throw new Error("Failed to fetch interviewer")
    }
  }

  async blockCandidate(candidateId: string) {
    try {
      const candidateBlocked = await this.iAdminRepository.blockCandidate(
        candidateId
      );
      return candidateBlocked;
    } catch (error) {
      throw new Error("Failed to block candidate");
    }
  }

  async approveInterviewer(interviewerId: string) {
    try {
      const interviewerApproved = await this.iAdminRepository.approveInterviewer(interviewerId)
      return interviewerApproved
    } catch (error) {
      throw new Error("Failed to approve interviewer")
    }
  }

  async addStack(stackName: string, technologies: string[]) {
    try {
      const stackAdded = await this.iAdminRepository.addStack(
        stackName,
        technologies
      );
      if (stackAdded) {
        return { success: true, message: "Stack added successfully" };
      }
      return { success: false, message: "Failed to add stack" };
    } catch (error) {
      console.error(error); 
      throw new Error("Failed to add stack");
    }
  }

  async getAllStacks() {
    try {
        const stacksList = this.iAdminRepository.findAllStacks()
        return stacksList
    } catch (error) {
        throw new Error("Failed to fetch stacks")
    }
  }
}

export default AdminUseCase;
