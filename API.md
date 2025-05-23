# API Documentation

This document outlines the available API endpoints and their usage in the application.

## Base Configuration

- Base URL: `process.env.NEXT_PUBLIC_API_URL`
- Authentication: Most endpoints require a Bearer token sent in the Authorization header
- Default response format: JSON

## Authentication

Most endpoints require authentication via a Bearer token:

```
Authorization: Bearer <token>
```

## API Endpoints

### Student APIs

#### Get Student Information

- **Endpoint**: `GET /api/student/{studentId}`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": {
    "name": string,
    "email": string,
    "username": string,
    "gender": string,
    "dob": Date,
    "graduation_year": number
  }
}
```

#### Get Student Sessions

- **Endpoint**: `GET /api/student/sessions`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "sessionId": string,
      "mentorId": string,
      "mentorName": string,
      "mentorImageLink": string,
      "type": string,
      "title": string,
      "DurationInMinutes": number,
      "session_medium": string[],
      "Description": string,
      "Price": number
    }
  ]
}
```

#### Get Single Session

- **Endpoint**: `GET /api/student/sessions/{sessionId}`
- **Auth Required**: No
- **Response**:

```json
{
  "success": true,
  "data": {
    "sessionId": string,
    "mentorId": string,
    "mentorName": string,
    "mentorImageLink": string,
    "type": string,
    "title": string,
    "DurationInMinutes": number,
    "session_medium": string[],
    "Description": string,
    "Price": number
  }
}
```

#### Find Mentors by Interest

- **Endpoint**: `GET /api/student/findmentor/interest`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "mentorId": string,
      "name": string,
      "organization": string,
      "profile_pic": string,
      "level": string,
      "bio": string,
      "sessions_taken": number,
      "review_count": number
    }
  ]
}
```

#### Get Mentor Available Slots

- **Endpoint**: `GET /api/student/mavaliableat/{mentorId}`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": string,
      "start": Date,
      "end": Date,
      "booked": boolean
    }
  ]
}
```

#### Send Slot Request

- **Endpoint**: `POST /api/student/mavailableat/request`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "mentorId": string,
  "slots": [
    {
      "id": string,
      "start": Date,
      "end": Date,
      "booked": boolean
    }
  ]
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Slot Requests are sent successfully"
}
```

### Mentor APIs

#### Get Mentor Information

- **Endpoint**: `GET /api/mentor/{mentorId}`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": {
    "name": string,
    "email": string,
    "username": string,
    "gender": string,
    "dob": Date,
    "socials": {
      "github": string | null,
      "facebook": string | null,
      "linkedin": string | null,
      "twitter": string | null
    },
    "organization": string,
    "profile_pic": string,
    "bio": string
  }
}
```

#### Get Mentor Public Profile

- **Endpoint**: `GET /api/mentor/public/{mentorId}`
- **Auth Required**: No
- **Response**:

```json
{
  "success": true,
  "data": {
    "name": string,
    "email": string,
    "username": string,
    "gender": string,
    "dob": Date,
    "socials": object,
    "organization": string,
    "profile_pic": string,
    "bio": string,
    "level": string,
    "interests": Array<{
      "interest_id": string,
      "interest_name": string
    }>
  }
}
```

#### Get Mentor Sessions

- **Endpoint**: `GET /api/mentor/sessions`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "sessionId": string,
      "mentorId": string,
      "title": string,
      "DurationInMinutes": number,
      "session_medium": string[],
      "Description": string,
      "Price": number
    }
  ]
}
```

#### Get Mentor Availability

- **Endpoint**: `GET /api/mentor/availability`
- **Auth Required**: No
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "start": Date,
      "end": Date,
      "booked": boolean
    }
  ]
}
```

#### Add Mentor Availability

- **Endpoint**: `POST /api/mentor/avalability/add`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "startTime": Date,
  "endTime": Date
}
```

- **Response**:

```json
{
  "success": true
}
```

### Interest APIs

#### Get Student/Mentor Interests

- **Endpoint**:
  - `GET /api/student/interests/list`
  - `GET /api/mentor/interests/list`
- **Auth Required**: Yes
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "interest_id": string,
      "interest_name": string
    }
  ]
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": string
}
```

HTTP status codes are used appropriately to indicate the type of error:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Type Definitions

For detailed type definitions, please refer to the application's type files. Key types include:

- `StudentInfoType`
- `MentorInfoType`
- `SessionInfoType`
- `AvalabilityType`
- `InterestType`
- `MentorSuggestionType`
- `MentorPublicProfileType`
