# Palantir LLM Integration

This doc covers how to call the Palantir AIP ontology function that wraps an LLM (currently Opus 4.6) to handle arbitrary tasks.

## Prerequisites

Add these to your `.env` file:

```env
PALANTIR_AIP_API_KEY=your-access-token
```

- `PALANTIR_AIP_API_KEY` - Bearer token for authentication (generate from page at Account>Settings>Tokens)

## Usage

Make a POST request to the ontology query endpoint:

```typescript
const PALANTIR_FOUNDRY_API_URL = "https://yohance.usw-22.palantirfoundry.com"
const ontologyRid = "ri.ontology.main.ontology.3612882a-a808-4173-9e56-c42643a6b726"
const queryName = "chatCompletion"

const response = await fetch(
  `${PALANTIR_FOUNDRY_API_URL}/api/v2/ontologies/${ontologyRid}/queries/${queryName}/execute`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PALANTIR_AIP_API_KEY}`
    },
    body: JSON.stringify({
      parameters: {
        systemContent: "You are a helpful assistant.",
        userContent: "Your prompt here"
      }
    })
  }
)

const result = await response.json()
```

### Parameters

- `systemContent` (string) - System prompt for the LLM
- `userContent` (string) - The user's message/query
- `jsonResponseFormat` (string or undefined/null) - JSON format for the LLM's response. 
- `jsonResponseFormatInstructions` (string or undefined/null) - JSON format instructions to better guide the LLM in the response format.

### Headers

- `Content-Type`: `application/json`
- `Authorization`: `Bearer {PALANTIR_AIP_API_KEY}`

### Response

```json
{
  "response": "<string>",
  "tokenUsage": {
    "promptTokens": "<number>",
    "completionTokens": "<number>",
    "maxTokens": "<number>"
  }
}
```

## Notes

- The ontology function acts as a wrapper—you send a prompt, it handles the LLM interaction
- Keep your access token secure; never commit it to version control
