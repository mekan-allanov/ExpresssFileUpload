import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Token = sequelize.define(
	"Token",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		refreshToken: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		status: {
			type: DataTypes.ENUM("active", "blocked"),
			defaultValue: "active",
			allowNull: false,
		},
		deviceInfo: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "tokens",
		timestamps: true,
	}
);

Token.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Token, { foreignKey: "userId" });

export default Token;
