// import { compare, hash } from "bcryptjs";

// export async function hashPassword(password) {
//   const hashedPassword = await hash(password, 12);
//   return hashedPassword;
// }

// export async function verifyPassword(password, hashedPassword) {
//   const isValid = await compare(password, hashedPassword);
//   return isValid;
// }

export const checkIsAdmin = (userRole) => {
  return userRole === "admin";
};

export const checkIsAdminOrTrainer = (userRole) => {
  return userRole === "admin" || userRole === "trainer";
};
