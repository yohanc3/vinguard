# Palantir API Gateway - Car CRUD Operations

This doc covers how to interact with the Cars ontology object via the Palantir raw API.

**Related docs:** [Palantir LLM](./palantir-llm.md) | [Vehicle Analysis](./vehicle-analysis.md)

## Prerequisites

Add these to your `.env` file:

```env
PALANTIR_FOUNDRY_API_URL=https://yohance.usw-22.palantirfoundry.com
PALANTIR_ONTOLOGY_RID=ri.ontology.main.ontology.3612882a-a808-4173-9e56-c42643a6b726
PALANTIR_AIP_API_KEY=your-access-token
```

## Base URL

```typescript
const baseUrl = `${PALANTIR_FOUNDRY_API_URL}/api/v2/ontologies/${PALANTIR_ONTOLOGY_RID}`
```

## Headers

All requests require:

```typescript
{
  "Content-Type": "application/json",
  "Authorization": `Bearer ${PALANTIR_AIP_API_KEY}`
}
```

## Endpoints

### List All Cars

```typescript
GET ${baseUrl}/objects/cars
```

Response:
```json
{
  "data": [{ ...carObject }],
  "totalCount": "123"
}
```

### Get Car by ID

```typescript
POST ${baseUrl}/objects/cars/search

Body:
{
  "where": { "type": "eq", "field": "id", "value": "car-id-here" }
}
```

Response:
```json
{
  "data": [{ ...carObject }]
}
```

### Create Car

```typescript
POST ${baseUrl}/actions/create-cars/apply

Body:
{
  "parameters": {
    "id": "unique-id",
    "make": "Toyota",
    "model": "Camry",
    ...
  }
}
```

### Update Car

```typescript
POST ${baseUrl}/actions/edit-cars/apply

Body:
{
  "parameters": {
    "cars": "car-id-here",
    "make": "Honda",
    ...
  }
}
```

### Delete Car

```typescript
POST ${baseUrl}/actions/delete-cars/apply

Body:
{
  "parameters": {
    "cars": "car-id-here"
  }
}
```

## Car Object Schema

All fields are optional:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Custom unique identifier |
| userId | string | Owner user ID |
| make | string | Vehicle make |
| model | string | Vehicle model |
| year | number | Model year |
| trim | string | Trim level |
| color | string | General color |
| exteriorColor | string | Exterior color |
| bodyStyle | string | Body style (Sedan, SUV, etc.) |
| engineType | string | Engine type (V6, I4, etc.) |
| cylinders | number | Number of cylinders |
| msrp | string | MSRP value |
| listingPrice | number | Listing price |
| listingMileage | string | Mileage from listing |
| listingDetails | string[] | Array of listing detail phrases |
| listingPictures | string[] | Array of image URLs |
| odometerReadings | string[] | Historical odometer readings |
| numberOfPreviousOwners | number | Number of previous owners |
| stateOfRegistration | string | Current registration state |
| titleStatus | string | Title status (Clean, Salvage, etc.) |
| salvageRecord | string | Salvage record description |
| floodDamageHistory | string | Flood damage history |
| fairMarketValueHigh | number | High FMV estimate |
| fairMarketValueLow | number | Low FMV estimate |
| carReport | string | R2 key for vehicle history PDF |
| vehicleAnalysis | string | JSON analysis report (see [Vehicle Analysis](./vehicle-analysis.md)) |
| chatHistory | array | Chat message history |

### Palantir Internal Fields (read-only)

| Field | Type |
|-------|------|
| __primaryKey | string |
| __rid | string |
| __apiName | string |
| __title | string |

## How It Integrates

The Cars object is the central data store:

```
Report Creation ──▶ cars.create ──▶ Triggers Analysis Job
                                         │
                                         ▼
                                 Vehicle Analysis ──▶ cars.update (vehicleAnalysis)
                                         
Chat ──▶ cars.update (chatHistory)
```

See [Vehicle Analysis](./vehicle-analysis.md) for the analysis pipeline.
