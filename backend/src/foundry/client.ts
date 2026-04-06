import { Client, createClient } from "@osdk/client";
import { createConfidentialOauthClient } from "@osdk/oauth";

// Your OAuth2 client ID from Developer Console.
const clientId = process.env.PALANTIR_SDK_CLIENT_ID!;
const clientSecret = process.env.PALANTIR_SDK_CLIENT_SECRET!;
const url = process.env.PALANTIR_FOUNDRY_API_URL!;
const scopes: string[] = [
  // "api:use-ontologies-read", "api:use-ontologies-write",
  // "api:use-mediasets-read",
  // "api:use-mediasets-write",
];

export const auth = createConfidentialOauthClient(clientId, clientSecret, url, scopes);
export const client: Client = createClient(
  url,
  process.env.PALANTIR_ONTOLOGY_RID!,
  auth,
);
