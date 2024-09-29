const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/database.sqlite'
  });

const Session = sequelize.define('Sessions', {
  id: {type: DataTypes.STRING, primaryKey: true},
  userName: {type: DataTypes.STRING, allowNull: false},
  userId: {type: DataTypes.STRING, allowNull: false},
  role: {type: DataTypes.STRING, allowNull: false},
  category: {type: DataTypes.STRING, allowNull: false},
  ongoing: {type: DataTypes.BOOLEAN, allowNull: false},
  createdAt: {type: DataTypes.DATE, allowNull: false},
});

(async () => {
    await sequelize.sync({ force: true });
})();

module.exports = { Session };
