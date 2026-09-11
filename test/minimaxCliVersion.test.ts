import { expect, test } from "bun:test"
import pkg from "../package.json" with { type: "json" }

const projectRoot = `${import.meta.dir}/..`

const runCli = async (cli: string, args: readonly string[]) => {
  const child = Bun.spawn(["bun", "run", `./src/cli/${cli}.ts`, ...args], {
    cwd: projectRoot,
    env: {
      HOME: process.env.HOME ?? "/tmp",
      PATH: process.env.PATH ?? "",
      MINIMAX_API_KEY: "",
      MINIMAX_API_TOKEN: "",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text()])
  return { exitCode: await child.exited, stderr, stdout }
}

test.each([
  ["minimaxSearch", ["--version"], "minimaxSearch"],
  ["minimaxSearch", ["-V"], "minimaxSearch"],
  ["minimaxUnderstandImage", ["--version"], "minimaxUnderstandImage"],
  ["minimaxUnderstandImage", ["-V"], "minimaxUnderstandImage"],
] as const)("%s %s reports the package version before credentials", async (cli, flag, command) => {
  const result = await runCli(cli, flag)

  expect(result.exitCode).toBe(0)
  expect(result.stdout).toBe(`${command} ${pkg.version}\n`)
  expect(result.stderr).toBe("")
})

test.each([
  ["minimaxSearch", "minimaxSearch"],
  ["minimaxUnderstandImage", "minimaxUnderstandImage"],
] as const)("%s --version --verbose reports metadata before credentials", async (cli, command) => {
  const result = await runCli(cli, ["--version", "--verbose"])

  expect(result.exitCode).toBe(0)
  expect(result.stderr).toBe("")
  expect(result.stdout).toContain(`${command} ${pkg.version}\n`)
  expect(result.stdout).toContain(`user agent: ${pkg.name}/${pkg.version}`)
  expect(result.stdout).toContain(`description: ${pkg.description}`)
  expect(result.stdout).toContain(`license: ${pkg.license}`)
  expect(result.stdout).toContain("author: unavailable")
  expect(result.stdout).toContain("project: unavailable")
  expect(result.stdout).toContain("installation type: development checkout")
  expect(result.stdout).toContain("runtime: bun ")
  expect(result.stdout).toContain("runtime requirements: unavailable")
  expect(result.stdout).toContain(`platform: ${process.platform} ${process.arch} (OS release `)
  expect(result.stdout).toMatch(/executable: .+\nexecutable target: .+\n/)
  expect(result.stdout).not.toContain("build details:")
})
