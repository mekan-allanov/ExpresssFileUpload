import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";
import User from "./User.js";

const File = sequelize.define(
	"File",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		extension: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
		mimeType: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		size: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		uploadDate: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
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
		tableName: "files",
		timestamps: true, // Add timestamps for createdAt and updatedAt
	}
);

export default File;
