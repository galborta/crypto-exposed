# API Data Standard

## Profile Object Structure

```json
{
  "_id": "string",
  "fileNumber": "string",
  "name": "string (required)",
  "photoUrl": "string (optional)",
  "dateOfBirth": "ISO date string (required)",
  "age": "number (required)",
  "height": "string (required)",
  "weight": "string (required)",
  "nationality": "string (required)",
  "placeOfBirth": "string (required)",
  "lastKnownLocation": "string (required)",
  "totalScammedUSD": "number (required)",
  "overview": "string (required)",
  "associatedProjects": "string (optional)",
  "story": "string (optional)",
  "methodology": "[string] (required, set during profile creation)",
  "blockchainAddresses": [
    {
      "address": "string (required)",
      "blockchain": "string (required)",
      "description": "string (required)",
      "source": "string (required)",
      "scannerUrl": "string (optional)"
    }
  ],
  "socialProfiles": [
    {
      "platform": "string (required)",
      "username": "string (required)",
      "profileUrl": "string (required)",
      "source": "string (required)"
    }
  ],
  "chronology": [
    {
      "date": "ISO date string (required)",
      "description": "string (required)",
      "source": "string (required)"
    }
  ],
  "status": "string (enum: Draft, Published)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

## Field Descriptions

- `_id`: Unique identifier for the profile
- `fileNumber`: Auto-generated unique file number
- `name`: Full name of the scammer
- `photoUrl`: URL to the profile photo (optional)
- `dateOfBirth`: Date of birth in ISO format (YYYY-MM-DD)
- `age`: Current age
- `height`: Height (format: "X'XX\"" or "XXX cm")
- `weight`: Weight (format: "XXX lbs" or "XXX kg")
- `nationality`: Country of citizenship
- `placeOfBirth`: City and country of birth
- `lastKnownLocation`: Last known location of the scammer
- `totalScammedUSD`: Total amount scammed in USD
- `overview`: Brief summary of the scammer's activities
- `associatedProjects`: Names of crypto projects involved (optional)
- `story`: Detailed narrative of events (optional)
- `methodology`: Array of scam methods used (set during profile creation)
- `blockchainAddresses`: Array of associated blockchain addresses
- `socialProfiles`: Array of social media profiles
- `chronology`: Array of chronological events
- `status`: Profile status (Draft or Published)
- `createdAt`: Timestamp of profile creation
- `updatedAt`: Timestamp of last profile update

## Example Profile

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fileNumber": "AB-23X-12345",
  "name": "John Doe",
  "photoUrl": "https://example.com/photos/john-doe.jpg",
  "dateOfBirth": "1990-01-01",
  "age": 33,
  "height": "5'11\"",
  "weight": "170 lbs",
  "nationality": "United States",
  "placeOfBirth": "New York, USA",
  "lastKnownLocation": "Dubai, UAE",
  "totalScammedUSD": 1000000,
  "overview": "Operated multiple fraudulent DeFi platforms",
  "associatedProjects": "SafeMoon, BitConnect",
  "story": "Started operations in early 2020...",
  "methodology": [
    "Created fake cryptocurrency projects.",
    "Used social media influencers for promotion.",
    "Conducted fake audits and security certifications."
  ],
  "blockchainAddresses": [
    {
      "address": "0x1234567890abcdef",
      "blockchain": "Ethereum",
      "description": "Main wallet used for collecting funds",
      "source": "Transaction records",
      "scannerUrl": "https://etherscan.io/address/0x1234567890abcdef"
    }
  ],
  "socialProfiles": [
    {
      "platform": "Twitter",
      "username": "cryptoscammer",
      "profileUrl": "https://twitter.com/cryptoscammer",
      "source": "Victim reports"
    }
  ],
  "chronology": [
    {
      "date": "2020-01-01T00:00:00.000Z",
      "description": "Started first fraudulent project",
      "source": "Company registration records"
    }
  ],
  "status": "Published",
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

### PUT /api/profile-extras/agent/:fileNumber/all
Updates additional profile information (blockchainAddresses, socialProfiles, chronology). Note that methodology cannot be updated through this endpoint as it is set during profile creation.

### DELETE /api/profiles/:id
Deletes a profile by ID.

## Profile Extras Update Format

When updating additional profile information, use the following format:

```json
{
  "blockchainAddresses": [
    {
      "address": "string (required)",
      "blockchain": "string (required)",
      "description": "string (required)",
      "source": "string (required)",
      "scannerUrl": "string (optional)"
    }
  ],
  "socialProfiles": [
    {
      "platform": "string (required)",
      "username": "string (required)",
      "profileUrl": "string (required)",
      "source": "string (required)"
    }
  ],
  "chronology": [
    {
      "date": "ISO date string (required)",
      "description": "string (required)",
      "source": "string (required)"
    }
  ]
}
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

For errors:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional array of validation errors
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