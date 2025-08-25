import { UsersService } from "./users.service.js";
import { asyncHandler } from "../../common/middlewares/error.js";

const usersService = new UsersService();

export const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const result = await usersService.getAllUsers(search);
  res.status(200).json(result);
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await usersService.getUserById(parseInt(id));
  res.status(200).json(result);
});

export const createUser = asyncHandler(async (req, res) => {
  const result = await usersService.createUser(req.body);
  res.status(201).json(result);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await usersService.updateUser(parseInt(id), req.body);
  res.status(200).json(result);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await usersService.deleteUser(parseInt(id));
  res.status(200).json(result);
});
