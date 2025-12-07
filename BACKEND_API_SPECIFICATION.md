# Backend API Specification for MindNote Journal

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {accessToken}
```

---

## 1. Create Journal Entry

### Endpoint
```
POST /api/journal/entries
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
accept: application/json
```

### Request Body
```json
{
  "type": "task" | "note" | "event" | "habit",
  "title": "string (required)",
  "notes": "string | null",
  "completed": false,
  "date": "string | null (ISO date format: YYYY-MM-DD)",
  "tags": ["string"]
}
```

### Example Request
```json
{
  "type": "task",
  "title": "Morning run",
  "notes": "3 km around park",
  "completed": false,
  "date": "2025-12-07",
  "tags": ["health", "fitness"]
}
```

### Response (201 Created)
```json
{
  "id": "string",
  "type": "task",
  "title": "Morning run",
  "notes": "3 km around park",
  "completed": false,
  "date": "2025-12-07",
  "createdAt": "2025-12-07T10:30:00.000Z",
  "updatedAt": null,
  "tags": ["health", "fitness"]
}
```

### Alternative Response Formats (Frontend handles all)
```json
// Format 1: Direct object
{
  "id": "123",
  "type": "task",
  ...
}

// Format 2: With entryId
{
  "entryId": "123",
  "type": "task",
  ...
}

// Format 3: Wrapped in data
{
  "data": {
    "id": "123",
    "type": "task",
    ...
  }
}
```

### Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission
- **500 Internal Server Error**: Server error

---

## 2. Get All Journal Entries

### Endpoint
```
GET /api/journal/entries
```

### Headers
```
Authorization: Bearer {token}
accept: application/json
```

### Query Parameters (Optional)
```
?page=1&limit=50&type=task&completed=false
```

### Response (200 OK)
```json
[
  {
    "id": "string",
    "type": "task",
    "title": "Morning run",
    "notes": "3 km around park",
    "completed": false,
    "date": "2025-12-07",
    "createdAt": "2025-12-07T10:30:00.000Z",
    "updatedAt": null,
    "tags": ["health"]
  },
  {
    "id": "string",
    "type": "note",
    "title": "Ideas for app",
    "notes": "Add monthly review view",
    "completed": false,
    "date": null,
    "createdAt": "2025-12-07T09:15:00.000Z",
    "updatedAt": null,
    "tags": ["brainstorm"]
  }
]
```

### Alternative Response Formats (Frontend handles all)
```json
// Format 1: Wrapped in data
{
  "data": [...]
}

// Format 2: Wrapped in entries
{
  "entries": [...]
}
```

### Error Responses
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission
- **500 Internal Server Error**: Server error

---

## 3. Get Single Journal Entry

### Endpoint
```
GET /api/journal/entries/{id}
```

### Headers
```
Authorization: Bearer {token}
accept: application/json
```

### Path Parameters
- `id` (string, required): Journal entry ID

### Response (200 OK)
```json
{
  "id": "string",
  "type": "task",
  "title": "Morning run",
  "notes": "3 km around park",
  "completed": false,
  "date": "2025-12-07",
  "createdAt": "2025-12-07T10:30:00.000Z",
  "updatedAt": null,
  "tags": ["health"]
}
```

### Error Responses
- **404 Not Found**: Entry not found
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission
- **500 Internal Server Error**: Server error

---

## 4. Update Journal Entry

### Endpoint
```
PUT /api/journal/entries/{id}
```
or
```
PATCH /api/journal/entries/{id}
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
accept: application/json
```

### Path Parameters
- `id` (string, required): Journal entry ID

### Request Body (Partial - only send fields to update)
```json
{
  "type": "task",
  "title": "Updated title",
  "notes": "Updated notes",
  "completed": true,
  "date": "2025-12-08",
  "tags": ["health", "updated"]
}
```

### Response (200 OK)
```json
{
  "id": "string",
  "type": "task",
  "title": "Updated title",
  "notes": "Updated notes",
  "completed": true,
  "date": "2025-12-08",
  "createdAt": "2025-12-07T10:30:00.000Z",
  "updatedAt": "2025-12-07T15:45:00.000Z",
  "tags": ["health", "updated"]
}
```

### Error Responses
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Entry not found
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission or doesn't own the entry
- **500 Internal Server Error**: Server error

---

## 5. Delete Journal Entry

### Endpoint
```
DELETE /api/journal/entries/{id}
```

### Headers
```
Authorization: Bearer {token}
accept: application/json
```

### Path Parameters
- `id` (string, required): Journal entry ID

### Response (200 OK)
```json
{
  "message": "Journal entry deleted successfully",
  "id": "string"
}
```

### Alternative Response (204 No Content)
No response body, just status code 204.

### Error Responses
- **404 Not Found**: Entry not found
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission or doesn't own the entry
- **500 Internal Server Error**: Server error

---

## 6. Toggle Entry Completion Status

### Endpoint
```
PATCH /api/journal/entries/{id}/toggle
```
or
```
PUT /api/journal/entries/{id}/complete
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
accept: application/json
```

### Path Parameters
- `id` (string, required): Journal entry ID

### Request Body (Optional)
```json
{
  "completed": true
}
```

### Response (200 OK)
```json
{
  "id": "string",
  "type": "task",
  "title": "Morning run",
  "notes": "3 km around park",
  "completed": true,
  "date": "2025-12-07",
  "createdAt": "2025-12-07T10:30:00.000Z",
  "updatedAt": "2025-12-07T16:00:00.000Z",
  "tags": ["health"]
}
```

### Error Responses
- **404 Not Found**: Entry not found
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission
- **500 Internal Server Error**: Server error

---

## Data Models

### JournalEntry
```typescript
{
  id: string;                    // Unique identifier
  type: "task" | "note" | "event" | "habit";
  title: string;                 // Required, min 2 characters
  notes?: string | null;         // Optional
  completed?: boolean;           // Default: false
  date?: string | null;          // ISO date format (YYYY-MM-DD)
  createdAt: string;             // ISO datetime
  updatedAt?: string | null;     // ISO datetime
  tags?: string[];               // Array of tag strings
}
```

### EntryType
```typescript
type EntryType = "task" | "note" | "event" | "habit";
```

---

## Notes for Backend Implementation

1. **User Association**: All journal entries should be associated with the authenticated user (from JWT token)

2. **Authorization**: Users can only:
   - Create their own entries
   - View their own entries
   - Update their own entries
   - Delete their own entries

3. **Validation**:
   - `type` must be one of: "task", "note", "event", "habit"
   - `title` is required and must be at least 2 characters
   - `date` should be in ISO format (YYYY-MM-DD) or null
   - `tags` should be an array of strings

4. **Response Format**: Frontend is flexible and handles multiple response formats:
   - Direct object: `{ id, type, title, ... }`
   - With entryId: `{ entryId, type, title, ... }`
   - Wrapped in data: `{ data: { id, type, title, ... } }`
   - Array or wrapped array: `[...]` or `{ data: [...] }` or `{ entries: [...] }`

5. **Error Handling**: Always return meaningful error messages:
   ```json
   {
     "message": "Error description",
     "error": "Error code",
     "status": 400
   }
   ```

6. **Timestamps**: Use ISO 8601 format for all datetime fields:
   - Example: `"2025-12-07T10:30:00.000Z"`

---

## Example cURL Commands

### Create Entry
```bash
curl -X POST 'http://localhost:8080/api/journal/entries' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'accept: application/json' \
  -d '{
    "type": "task",
    "title": "Morning run",
    "notes": "3 km around park",
    "completed": false,
    "date": "2025-12-07",
    "tags": ["health", "fitness"]
  }'
```

### Get All Entries
```bash
curl -X GET 'http://localhost:8080/api/journal/entries' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'accept: application/json'
```

### Get Single Entry
```bash
curl -X GET 'http://localhost:8080/api/journal/entries/ENTRY_ID' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'accept: application/json'
```

### Update Entry
```bash
curl -X PUT 'http://localhost:8080/api/journal/entries/ENTRY_ID' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'accept: application/json' \
  -d '{
    "title": "Updated title",
    "completed": true
  }'
```

### Delete Entry
```bash
curl -X DELETE 'http://localhost:8080/api/journal/entries/ENTRY_ID' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'accept: application/json'
```

### Toggle Completion
```bash
curl -X PATCH 'http://localhost:8080/api/journal/entries/ENTRY_ID/toggle' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'accept: application/json' \
  -d '{
    "completed": true
  }'
```

---

## Status Codes Summary

- **200 OK**: Successful GET, PUT, PATCH, DELETE
- **201 Created**: Successful POST (create)
- **204 No Content**: Successful DELETE (optional)
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have permission
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Testing Checklist

- [ ] Create entry with all fields
- [ ] Create entry with minimal fields (only type and title)
- [ ] Get all entries (empty list)
- [ ] Get all entries (with data)
- [ ] Get single entry (exists)
- [ ] Get single entry (not found)
- [ ] Update entry (all fields)
- [ ] Update entry (partial fields)
- [ ] Delete entry (exists)
- [ ] Delete entry (not found)
- [ ] Toggle completion status
- [ ] Test with invalid token
- [ ] Test with missing token
- [ ] Test with invalid entry type
- [ ] Test with empty title
- [ ] Test user can only access their own entries

