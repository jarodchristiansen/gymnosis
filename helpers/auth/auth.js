export const checkIsAdmin = (userRole) => {
  return userRole === "admin";
};

// Roles that work with clients' plans; mirrors STAFF in db/auth.js.
export const checkIsStaff = (userRole) => {
  return ["admin", "owner", "trainer"].includes(userRole);
};
