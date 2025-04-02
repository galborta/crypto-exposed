# API Data Standard

## Profile Object Structure

```json
{
  "_id": "string",
  "name": "string (required)",
  "photoUrl": "string (optional)",
  "dateOfBirth": "ISO date string (required)",
  "age": "number (required)",
  "height": "string (required)",
  "weight": "string (required)",
  "nationality": "string (required)",
  "placeOfBirth": "string (required)",
  "totalScammedUSD": "number (required)",
  "overview": "string (required)",
  "associatedProjects": "string (required)",
  "story": "string (optional)",
  "methodology": "string (required)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

## Field Descriptions

- `_id`: Unique identifier for the profile
- `name`: Full name of the scammer
- `photoUrl`: URL to the profile photo (optional)
- `dateOfBirth`: Date of birth in ISO format (YYYY-MM-DD)
- `age`: Current age
- `height`: Height (format: "X'XX\"" or "XXX cm")
- `weight`: Weight (format: "XXX lbs" or "XXX kg")
- `nationality`: Country of citizenship
- `placeOfBirth`: City and country of birth
- `totalScammedUSD`: Total amount scammed in USD
- `overview`: Brief summary of the scammer's activities
- `associatedProjects`: Names of crypto projects involved
- `story`: Detailed narrative of events (optional)
- `methodology`: Detailed explanation of scam methods used
- `createdAt`: Timestamp of profile creation
- `updatedAt`: Timestamp of last profile update

## Example Profile

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "photoUrl": "https://example.com/photos/john-doe.jpg",
  "dateOfBirth": "1990-01-01",
  "age": 33,
  "height": "5'11\"",
  "weight": "170 lbs",
  "nationality": "United States",
  "placeOfBirth": "New York, USA",
  "totalScammedUSD": 1000000,
  "overview": "Operated multiple fraudulent DeFi platforms",
  "associatedProjects": "SafeMoon, BitConnect",
  "story": "Started operations in early 2020...",
  "methodology": "Used social media influencers to promote fake tokens...",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## API Endpoints

### GET /api/profiles
Returns a list of all published profiles.

### GET /api/profiles/:id
Returns a single profile by ID.

### POST /api/profiles
Creates a new profile. Requires all fields marked as required.

### PUT /api/profiles/:id
Updates an existing profile. All fields are optional in updates.

### DELETE /api/profiles/:id
Deletes a profile by ID.

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": object | array | null,
  "message": "string",
  "error": "string" (only if success: false)
}
```

## Error Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 