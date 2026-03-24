export const checkIsAdmin = (userRole) => {
  return userRole === "admin";
};

export const checkIsAdminOrTrainer = (userRole) => {
  return userRole === "admin" || userRole === "trainer";
};
