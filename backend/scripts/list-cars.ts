import "dotenv/config"
import * as readline from "readline"

const PALANTIR_URL = process.env.PALANTIR_FOUNDRY_API_URL
const ONTOLOGY_RID = process.env.PALANTIR_ONTOLOGY_RID
const API_KEY = process.env.PALANTIR_AIP_API_KEY

function getHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  }
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise(function (resolve) {
    rl.question(question, function (answer) {
      rl.close()
      resolve(answer)
    })
  })
}

async function fetchAllCars(): Promise<{ data: Array<{ __primaryKey: string; id?: string }>; totalCount: string }> {
  if (!PALANTIR_URL || !ONTOLOGY_RID || !API_KEY) {
    console.error("Missing env vars: PALANTIR_FOUNDRY_API_URL, PALANTIR_ONTOLOGY_RID, or PALANTIR_AIP_API_KEY")
    process.exit(1)
  }

  const url = `${PALANTIR_URL}/api/v2/ontologies/${ONTOLOGY_RID}/objects/cars`

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("Failed to fetch cars:", res.status, errorText)
    process.exit(1)
  }

  return res.json()
}

async function deleteCar(carId: string): Promise<boolean> {
  const url = `${PALANTIR_URL}/api/v2/ontologies/${ONTOLOGY_RID}/actions/delete-cars/apply`

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ parameters: { cars: carId } }),
  })

  return res.ok
}

async function listAllCars() {
  console.log("Fetching cars...")
  const json = await fetchAllCars()

  console.log("\n=== All Cars ===\n")
  console.log(JSON.stringify(json, null, 2))
  console.log("\nTotal count:", json.totalCount ?? json.data?.length ?? "unknown")
}

async function deleteAllCars() {
  console.log("Fetching all cars...")
  const json = await fetchAllCars()

  const cars = json.data ?? []
  const carIds = cars.map(function (car) {
    return car.__primaryKey || car.id
  }).filter(Boolean) as string[]

  console.log("\n=== Cars to delete ===\n")
  console.log("Found", carIds.length, "cars:")
  carIds.forEach(function (id, idx) {
    console.log(`  ${idx + 1}. ${id}`)
  })

  if (carIds.length === 0) {
    console.log("\nNo cars to delete.")
    process.exit(0)
  }

  console.log("\n⚠️  WARNING: This will permanently delete ALL", carIds.length, "car objects from Palantir Foundry!\n")

  const confirm1 = await prompt("Are you sure you want to proceed? (y/N): ")
  if (confirm1.toLowerCase() !== "y") {
    console.log("Aborted.")
    process.exit(0)
  }

  const confirm2 = await prompt('Type "delete all car objects from palantir foundry" to confirm: ')
  if (confirm2 !== "delete all car objects from palantir foundry") {
    console.log("Confirmation phrase did not match. Aborted.")
    process.exit(0)
  }

  console.log("\nDeleting cars...")

  let deleted = 0
  let failed = 0

  for (const carId of carIds) {
    process.stdout.write(`  Deleting ${carId}... `)
    const ok = await deleteCar(carId)
    if (ok) {
      console.log("✓")
      deleted++
    } else {
      console.log("✗")
      failed++
    }
  }

  console.log("\n=== Done ===")
  console.log(`Deleted: ${deleted}`)
  console.log(`Failed: ${failed}`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes("-delete_all_cars")) {
    await deleteAllCars()
  } else {
    await listAllCars()
  }
}

main()
