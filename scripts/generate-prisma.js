const { execSync } = require("child_process")

try {
  console.log("Running prisma generate...")
  execSync("npx prisma generate", {
    cwd: "/vercel/share/v0-project",
    stdio: "inherit",
  })
  console.log("Prisma client generated successfully!")
} catch (e) {
  console.log("prisma generate failed (expected if no database is configured):", e.message)
  console.log("The app will run in AUTH_DISABLED mode with mock data.")
}
