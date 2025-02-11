import File from "./File.js";
import Token from "./Token.js";
import User from "./User.js";

// Define associations
const setupAssociations = () => {
	// User - File associations
	File.belongsTo(User, { foreignKey: "userId" });
	User.hasMany(File, { foreignKey: "userId" });

	// User - Token associations
	Token.belongsTo(User, { foreignKey: "userId" });
	User.hasMany(Token, { foreignKey: "userId" });
};

setupAssociations();

export { File, Token, User };
