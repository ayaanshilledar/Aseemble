"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/prisma");
const register = async ({ username, email, password }) => {
    const hash = await bcrypt_1.default.hash(password, 10);
    return prisma_1.prisma.user.create({
        data: { username, email, password: hash }
    });
};
exports.register = register;
const login = async ({ email, password }) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("User not found");
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid)
        throw new Error("Invalid password");
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, "secret");
    return { token, userId: user.id };
};
exports.login = login;
