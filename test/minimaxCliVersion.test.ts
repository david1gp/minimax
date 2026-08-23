import { expect, test } from "bun:test"
import pkg from "../package.json" with { type: "json" }

const projectRoot = `${import.meta.dir}/..`

const runCli = async (cli: string, flag: "--version" | "-V") => {
  const child = Bun.spawn(["bun", "run", `./src/cli/${cli}.ts`, flag], {
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
  ["minimaxSearch", "--version", "minimaxSearch"],
  ["minimaxSearch", "-V", "minimaxSearch"],
  ["minimaxUnderstandImage", "--version", "minimaxUnderstandImage"],
  ["minimaxUnderstandImage", "-V", "minimaxUnderstandImage"],
] as const)("%s %s reports the package version before credentials", async (cli, flag, command) => {
  const result = await runCli(cli, flag)

  expect(result.exitCode).toBe(0)
  expect(result.stdout).toBe(`${command} ${pkg.version}\n`)
  expect(result.stderr).toBe("")
})
