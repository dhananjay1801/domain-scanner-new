# API Docs: Assessment + Questions

Base URL depends on your deployment (examples use `http://localhost:8000`).

## Authentication

Assessment endpoints require a JWT access token.

- **Header**: `Authorization: Bearer <token>`

Questions endpoint is currently public (no auth dependency in route).

---

## Questions API

### GET `/questions/`

- **Auth**: Not required
- **Purpose**: Returns the full list of assessment questions (ordered by `_id`).

#### Example request

```bash
curl -X GET "http://localhost:8000/questions/"
```

#### Example request (PowerShell)

```powershell
curl.exe -X GET "http://localhost:8000/questions/"
```

#### Example response (200)

```json
[
  {
    "_id": 1,
    "category_id": 1,
    "category_name": "DNS Security",
    "question_text": "Do you enforce DNSSEC on your domain?",
    "options": [
      { "option_key": "A", "option_text": "Yes", "score": 10 },
      { "option_key": "B", "option_text": "Partially", "score": 6 },
      { "option_key": "C", "option_text": "No", "score": 0 },
      { "option_key": "D", "option_text": "Not sure", "score": 2 }
    ]
  }
]
```

#### Error responses

- **500**: `{ "detail": "Failed to fetch questions" }`

---

## Assessment API

All assessment endpoints:

- **Prefix**: `/assess`
- **Auth**: Required (`Authorization: Bearer <token>`)
- **Org requirement**: User must have `org_id` (otherwise `400`)

### POST `/assess/`

- **Purpose**: Submit answers and create an assessment result.
- **Notes**:
  - Requires answering **all questions**.
  - `selectedOption` must be one of `"A" | "B" | "C" | "D"`.
  - Stored against the submitting `user_id`.

#### Example request

```bash
curl -X POST "http://localhost:8000/assess/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"1","selectedOption":"A"},{"questionId":"2","selectedOption":"C"}]}'
```

#### Example request (PowerShell)

```powershell
curl.exe -X POST "http://localhost:8000/assess/" `
  -H "Authorization: Bearer <token>" `
  -H "Content-Type: application/json" `
  -d '{\"answers\":[{\"questionId\":\"1\",\"selectedOption\":\"A\"},{\"questionId\":\"2\",\"selectedOption\":\"C\"}]}'
```

#### Example request body

```json
{
  "answers": [
    { "questionId": "1", "selectedOption": "A" },
    { "questionId": "2", "selectedOption": "C" }
  ]
}
```

#### Example response (200)

```json
{
  "success": true,
  "resultId": "8b5b3a6d-2d74-4f3b-9b0c-2c0a2d7a6c1d",
  "userId": "5c2b2a12-3ed8-4b3e-8b76-4d54a7d3f2b9",
  "data": {
    "_id": "8b5b3a6d-2d74-4f3b-9b0c-2c0a2d7a6c1d",
    "summary": {
      "score": 42,
      "total_questions": 10,
      "max_possible_score": 100,
      "percentage": 42,
      "grade": "F",
      "risk_level": "Critical",
      "risk_color": "red"
    },
    "answers": [
      {
        "questionId": "1",
        "questionText": "Do you enforce DNSSEC on your domain?",
        "selectedOption": { "option_key": "A", "option_text": "Yes", "score": 10 },
        "pointsAwarded": 10
      }
    ],
    "created_at": "2026-04-16T12:34:56.789012"
  }
}
```

#### Error responses

- **400**:
  - `{ "detail": "User not associated with an organization" }`
  - `{ "detail": "Duplicate answer for question <id>" }`
  - `{ "detail": "Invalid option '<key>' for question <id>" }`
  - `{ "detail": "All questions must be answered" }`
- **500**: `{ "detail": "No questions found" }`

---

### GET `/assess/latest`

- **Purpose**: Returns the most recent assessment result **for the organization** (across all users in the same org).

#### Example request

```bash
curl -X GET "http://localhost:8000/assess/latest" \
  -H "Authorization: Bearer <token>"
```

#### Example request (PowerShell)

```powershell
curl.exe -X GET "http://localhost:8000/assess/latest" `
  -H "Authorization: Bearer <token>"
```

#### Example response (200)

```json
{
  "_id": "8b5b3a6d-2d74-4f3b-9b0c-2c0a2d7a6c1d",
  "summary": {
    "score": 42,
    "total_questions": 10,
    "max_possible_score": 100,
    "percentage": 42,
    "grade": "F",
    "risk_level": "Critical",
    "risk_color": "red"
  },
  "answers": [
    {
      "questionId": "1",
      "questionText": "Do you enforce DNSSEC on your domain?",
      "selectedOption": { "option_key": "A", "option_text": "Yes", "score": 10 },
      "pointsAwarded": 10
    }
  ],
  "created_at": "2026-04-16T12:34:56.789012"
}
```

#### Error responses

- **400**: `{ "detail": "User not associated with an organization" }`
- **404**: `{ "detail": "No assessment results found" }`

---

### GET `/assess/history?limit=<n>`

- **Purpose**: Returns up to `limit` most recent assessment results **for the organization**.
- **Query params**:
  - `limit` (int): default `10`, min `1`, max `100`

#### Example request

```bash
curl -X GET "http://localhost:8000/assess/history?limit=10" \
  -H "Authorization: Bearer <token>"
```

#### Example request (PowerShell)

```powershell
curl.exe -X GET "http://localhost:8000/assess/history?limit=10" `
  -H "Authorization: Bearer <token>"
```

#### Example response (200)

```json
[
  {
    "_id": "8b5b3a6d-2d74-4f3b-9b0c-2c0a2d7a6c1d",
    "summary": {
      "score": 42,
      "total_questions": 10,
      "max_possible_score": 100,
      "percentage": 42,
      "grade": "F",
      "risk_level": "Critical",
      "risk_color": "red"
    },
    "created_at": "2026-04-16T12:34:56.789012"
  }
]
```

#### Error responses

- **400**: `{ "detail": "User not associated with an organization" }`
