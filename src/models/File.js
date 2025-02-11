import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
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
			type: DataTypes.STRING,
			references: {
				model: User,
				key: "id",
			},
			allowNull: false,
		},
	},
	{
		tableName: "files",
	}
);

File.belongsTo(User, { foreignKey: "userId" });
User.hasMany(File, { foreignKey: "userId" });

export default File;
