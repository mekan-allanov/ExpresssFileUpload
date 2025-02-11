import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
		},
		username: {
			type: DataTypes.STRING,
			unique: true,
		},
	},
	{
		tableName: "users",
		timestamps: false,
	}
);

export default User;
