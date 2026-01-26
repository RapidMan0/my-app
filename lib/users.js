import { promises as fs } from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((u) => u.email === email);
}

export async function createUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function getUserById(id) {
  const users = await readUsers();
  return users.find((u) => u.id === id);
}
