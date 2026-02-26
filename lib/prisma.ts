/**
 * Lazy-loaded Prisma client.
 *
 * We use `eval("require")` to completely hide the `@prisma/client` dependency
 * from Turbopack's static analysis. Turbopack traces both `import` and
 * `require()` at compile time and crashes when the generated client is missing.
 * `eval("require")` is opaque to the bundler so the module is only resolved
 * at runtime.
 */

const globalForPrisma = globalThis as typeof globalThis & { __prisma?: any }

function loadPrismaClient(): any {
  if (globalForPrisma.__prisma) return globalForPrisma.__prisma

  try {
    // eval("require") is invisible to Turbopack's static analysis
    const dynamicRequire = eval("require") as NodeRequire
    const mod = dynamicRequire("@prisma/client")
    const client = new mod.PrismaClient({ log: ["error", "warn"] })
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.__prisma = client
    }
    return client
  } catch {
    return new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === "then" || prop === Symbol.toPrimitive) return undefined
          throw new Error(
            `Prisma Client is not available. Run "npx prisma generate" or set AUTH_DISABLED=true. (accessed .${String(prop)})`
          )
        },
      }
    )
  }
}

/** Lazy Prisma client – safe to import even without a generated client. */
export const prisma: any = new Proxy(
  {},
  {
    get(_, prop) {
      return Reflect.get(loadPrismaClient(), prop)
    },
  }
)
