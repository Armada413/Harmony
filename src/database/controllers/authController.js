import db from "../db.js";

const template = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await db.query("SELECT * FROM users");

    res.status(200).json({
      success: true,
      users: users.rows,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addOneUser = async (req, res) => {
  try {
    const { discord_id } = req.body;
    await db.query("INSERT INTO users (discord_id) VALUES ($1);", [discord_id]);

    res.status(201).json({
      success: true,
      message: "User Added",
    });
  } catch (error) {
    console.error("Error adding user:", {
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
      status: error.response?.status,
    });
  }
};

const createCase = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getUsers,
  addOneUser,
};
