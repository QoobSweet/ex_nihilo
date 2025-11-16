import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../database/connection'; // Assume this exists

export interface WorkflowAttributes {
  id: number;
  userId: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class Workflow extends Model<WorkflowAttributes> implements WorkflowAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public description!: string;
  public status!: 'pending' | 'in_progress' | 'completed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Workflow.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  sequelize,
  modelName: 'Workflow',
  timestamps: true,
});

export default Workflow;