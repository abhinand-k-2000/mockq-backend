import bcrypt from "bcryptjs";

class HashPassword {

  async hash(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async compare(password: string, hashedPassword: string) {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    return passwordMatch
  }
}

export default HashPassword;
