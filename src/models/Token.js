import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";
import User from "./User.js";

const Token = sequelize.define(
	"Token",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
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
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
		},
	},
	{
		tableName: "tokens",
		timestamps: true,
	}
);

export default Token;
