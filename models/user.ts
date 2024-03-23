import { DataTypes, Model } from "sequelize";
import sequelize from "../sequelize"; // Adjust the path as necessary

class User extends Model {
  // define fields here
  public id!: number;
  public email: string;
  public username: string;
  // other fields...
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    sequelize, // passing the `sequelize` instance is required
  }
);

export default User;
