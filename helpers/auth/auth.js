export const checkIsAdmin = (userRole) => {
  return userRole === "admin";
};

// Roles that work with clients' plans; mirrors STAFF in db/auth.js.
export const checkIsStaff = (userRole) => {
  return ["admin", "owner", "trainer"].includes(userRole);
};

// Owners and admins see every trainer's clients and plans, so screens name the trainer.
export const checkSeesWholeGym = (userRole) => {
  return ["admin", "owner"].includes(userRole);
};
