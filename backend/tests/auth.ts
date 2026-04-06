/**
 * Authentication tests
 */

import { expect } from "bun:test"
import { testState, TEST_USER } from "./state"

export async function runAuthTests() {

  await testRegister()
  await testLogin()
  await testValidateToken()
}

async function testRegister() {
  const res = await testState.app!.request("/trpc/auth.register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(TEST_USER),
  })

  expect(res.status).toBe(200)

  const json = (await res.json()) as {
    result: { data: { user: { id: number; email: string }; token: string } }
  }

  expect(json.result.data.user.email).toBe(TEST_USER.email)
  expect(json.result.data.token).toBeDefined()

  testState.authToken = json.result.data.token
  testState.userId = json.result.data.user.id

}

async function testLogin() {
  const res = await testState.app!.request("/trpc/auth.login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(TEST_USER),
  })

  expect(res.status).toBe(200)

  const json = (await res.json()) as {
    result: { data: { token: string } }
  }

  testState.authToken = json.result.data.token
  expect(testState.authToken).toBeDefined()

}

async function testValidateToken() {
  const res = await testState.app!.request(
    `/trpc/auth.me?input=${encodeURIComponent(JSON.stringify({ token: testState.authToken }))}`,
    { method: "GET" }
  )

  expect(res.status).toBe(200)

  const json = (await res.json()) as {
    result: { data: { email: string } }
  }

  expect(json.result.data.email).toBe(TEST_USER.email)
}
