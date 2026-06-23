import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adminUser = {
  email: "admin@example.com",
  username: "admin",
  password: "Thuychan7733"
};

async function main() {
  const passwordHash = await bcrypt.hash(adminUser.password, 12);

  await prisma.user.upsert({
    where: {
      username: adminUser.username
    },
    create: {
      email: adminUser.email,
      username: adminUser.username,
      passwordHash
    },
    update: {
      email: adminUser.email,
      passwordHash
    }
  });

  console.log("Admin test account is ready:");
  console.log(`username: ${adminUser.username}`);
  console.log(`email: ${adminUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
