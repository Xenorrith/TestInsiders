import { Client } from "pg";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

// 👉 Налаштування БД
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "admin",     // зміни якщо інше
  password: "admin", // зміни якщо інше
  database: "mydb", // твоя БД
});

const SALT_ROUNDS = 10;

async function seed() {
  await client.connect();
  console.log("✅ Connected to Postgres");

  // Очистка таблиць
  await client.query(`DELETE FROM "Book"`);
  await client.query(`DELETE FROM "User"`);

  console.log("🧹 Tables cleaned");

  const users: string[] = [];

  // ===== USERS =====
  for (let i = 0; i < 20; i++) {
    const email = faker.internet.email().toLowerCase();
    const username = faker.internet.username().toLowerCase();

    const plainPassword = "12345678";
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const res = await client.query(
      `
      INSERT INTO "User"
      (id, email, username, password, "emailVerified", role)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
      RETURNING id;
      `,
      [
        email,
        username,
        hashedPassword,
        faker.datatype.boolean(),
        i === 0 ? "ADMIN" : "USER"
      ]
    );

    users.push(res.rows[0].id);
  }

  console.log(`✅ Created ${users.length} users (password = "12345678")`);

  // ===== BOOKS =====
  for (let i = 0; i < 50; i++) {
    const authorId = faker.helpers.arrayElement(users);
    const name = faker.book.title();
    const photo = faker.image.urlPicsumPhotos({ width: 300, height: 400 });

    await client.query(
      `
      INSERT INTO "Book"
      (id, name, "authorId", photo)
      VALUES (gen_random_uuid(), $1, $2, $3);
      `,
      [name, authorId, photo]
    );
  }

  console.log("✅ Created 50 books");

  await client.end();
  console.log("🌱 Seeding complete");
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
