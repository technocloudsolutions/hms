# Hotel Management System API Documentation

This document provides information about the REST API endpoints available in the Hotel Management System.

## Base URL

```
/api/v1
```

## Authentication

Authentication is required for all API endpoints. The authentication method is not implemented in this version.

## Endpoints

### Rooms

#### Get all rooms

```
GET /api/v1/rooms
```

Response:
```json
[
  {
    "id": "room1",
    "number": "101",
    "type": "Single",
    "price": 100,
    "status": "Available",
    "amenities": ["TV", "WiFi", "Air Conditioning"]
  },
  ...
]
```

#### Get a specific room

```
GET /api/v1/rooms?id=room1
```

Response:
```json
{
  "id": "room1",
  "number": "101",
  "type": "Single",
  "price": 100,
  "status": "Available",
  "amenities": ["TV", "WiFi", "Air Conditioning"]
}
```

#### Create a new room

```
POST /api/v1/rooms
```

Request body:
```json
{
  "number": "102",
  "type": "Double",
  "price": 150,
  "status": "Available",
  "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar"]
}
```

Response:
```json
{
  "id": "new-room-id",
  "number": "102",
  "type": "Double",
  "price": 150,
  "status": "Available",
  "amenities": ["TV", "WiFi", "Air Conditioning", "Mini Bar"]
}
```

#### Update a room

```
PUT /api/v1/rooms?id=room1
```

Request body:
```json
{
  "status": "Maintenance"
}
```

Response:
```json
{
  "id": "room1",
  "status": "Maintenance"
}
```

#### Delete a room

```
DELETE /api/v1/rooms?id=room1
```

Response:
```json
{
  "success": true
}
```

### Guests

#### Get all guests

```
GET /api/v1/guests
```

Response:
```json
[
  {
    "id": "guest1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "idType": "Passport",
    "idNumber": "AB123456"
  },
  ...
]
```

#### Get a specific guest

```
GET /api/v1/guests?id=guest1
```

Response:
```json
{
  "id": "guest1",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "idType": "Passport",
  "idNumber": "AB123456"
}
```

#### Create a new guest

```
POST /api/v1/guests
```

Request body:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "987-654-3210",
  "address": "456 Oak St",
  "idType": "Driver's License",
  "idNumber": "DL987654"
}
```

Response:
```json
{
  "id": "new-guest-id",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "987-654-3210",
  "address": "456 Oak St",
  "idType": "Driver's License",
  "idNumber": "DL987654"
}
```

#### Update a guest

```
PUT /api/v1/guests?id=guest1
```

Request body:
```json
{
  "phone": "555-123-4567"
}
```

Response:
```json
{
  "id": "guest1",
  "phone": "555-123-4567"
}
```

#### Delete a guest

```
DELETE /api/v1/guests?id=guest1
```

Response:
```json
{
  "success": true
}
```

### Bookings

#### Get all bookings

```
GET /api/v1/bookings
```

Response:
```json
[
  {
    "id": "booking1",
    "guestId": "guest1",
    "roomId": "room1",
    "checkIn": "2023-01-01T12:00:00Z",
    "checkOut": "2023-01-05T10:00:00Z",
    "status": "Confirmed",
    "totalAmount": 400,
    "paymentStatus": "Paid"
  },
  ...
]
```

#### Get a specific booking

```
GET /api/v1/bookings?id=booking1
```

Response:
```json
{
  "id": "booking1",
  "guestId": "guest1",
  "roomId": "room1",
  "checkIn": "2023-01-01T12:00:00Z",
  "checkOut": "2023-01-05T10:00:00Z",
  "status": "Confirmed",
  "totalAmount": 400,
  "paymentStatus": "Paid"
}
```

#### Create a new booking

```
POST /api/v1/bookings
```

Request body:
```json
{
  "guestId": "guest2",
  "roomId": "room2",
  "checkIn": "2023-02-01T14:00:00Z",
  "checkOut": "2023-02-07T11:00:00Z",
  "status": "Confirmed",
  "totalAmount": 900,
  "paymentStatus": "Pending"
}
```

Response:
```json
{
  "id": "new-booking-id",
  "guestId": "guest2",
  "roomId": "room2",
  "checkIn": "2023-02-01T14:00:00Z",
  "checkOut": "2023-02-07T11:00:00Z",
  "status": "Confirmed",
  "totalAmount": 900,
  "paymentStatus": "Pending"
}
```

#### Update a booking

```
PUT /api/v1/bookings?id=booking1
```

Request body:
```json
{
  "status": "Cancelled",
  "paymentStatus": "Refunded"
}
```

Response:
```json
{
  "id": "booking1",
  "status": "Cancelled",
  "paymentStatus": "Refunded"
}
```

#### Delete a booking

```
DELETE /api/v1/bookings?id=booking1
```

Response:
```json
{
  "success": true
}
```

### Services

#### Get all services

```
GET /api/v1/services
```

Response:
```json
[
  {
    "id": "service1",
    "name": "Room Cleaning",
    "description": "Standard room cleaning service",
    "category": "Housekeeping",
    "price": 20,
    "status": "Available"
  },
  ...
]
```

#### Get a specific service

```
GET /api/v1/services?id=service1
```

Response:
```json
{
  "id": "service1",
  "name": "Room Cleaning",
  "description": "Standard room cleaning service",
  "category": "Housekeeping",
  "price": 20,
  "status": "Available"
}
```

#### Create a new service

```
POST /api/v1/services
```

Request body:
```json
{
  "name": "Laundry",
  "description": "Laundry service for guests",
  "category": "Housekeeping",
  "price": 15,
  "status": "Available"
}
```

Response:
```json
{
  "id": "new-service-id",
  "name": "Laundry",
  "description": "Laundry service for guests",
  "category": "Housekeeping",
  "price": 15,
  "status": "Available"
}
```

#### Update a service

```
PUT /api/v1/services?id=service1
```

Request body:
```json
{
  "price": 25,
  "status": "Unavailable"
}
```

Response:
```json
{
  "id": "service1",
  "price": 25,
  "status": "Unavailable"
}
```

#### Delete a service

```
DELETE /api/v1/services?id=service1
```

Response:
```json
{
  "success": true
}
```

### Users

#### Get all users

```
GET /api/v1/users
```

Response:
```json
[
  {
    "id": "user1",
    "email": "admin@hotel.com",
    "name": "Admin User",
    "role": "admin",
    "isActive": true
  },
  ...
]
```

#### Get a specific user

```
GET /api/v1/users?id=user1
```

Response:
```json
{
  "id": "user1",
  "email": "admin@hotel.com",
  "name": "Admin User",
  "role": "admin",
  "isActive": true
}
```

#### Create a new user

```
POST /api/v1/users
```

Request body:
```json
{
  "email": "staff@hotel.com",
  "name": "Staff User",
  "role": "staff",
  "isActive": true
}
```

Response:
```json
{
  "id": "new-user-id",
  "email": "staff@hotel.com",
  "name": "Staff User",
  "role": "staff",
  "isActive": true
}
```

#### Update a user

```
PUT /api/v1/users?id=user1
```

Request body:
```json
{
  "role": "manager",
  "name": "Manager User"
}
```

Response:
```json
{
  "id": "user1",
  "role": "manager",
  "name": "Manager User"
}
```

#### Delete a user

```
DELETE /api/v1/users?id=user1
```

Response:
```json
{
  "success": true
}
```

### Activities

#### Get all activities

```
GET /api/v1/activities
```

Response:
```json
[
  {
    "id": "activity1",
    "name": "City Tour",
    "description": "Guided tour of the city",
    "type": "Sightseeing",
    "duration": 3,
    "price": 50,
    "location": "City Center"
  },
  ...
]
```

#### Get a specific activity

```
GET /api/v1/activities?id=activity1
```

Response:
```json
{
  "id": "activity1",
  "name": "City Tour",
  "description": "Guided tour of the city",
  "type": "Sightseeing",
  "duration": 3,
  "price": 50,
  "location": "City Center"
}
```

#### Create a new activity

```
POST /api/v1/activities
```

Request body:
```json
{
  "name": "Beach Volleyball",
  "description": "Volleyball game at the beach",
  "type": "Outdoor",
  "duration": 2,
  "price": 0,
  "location": "Hotel Beach"
}
```

Response:
```json
{
  "id": "new-activity-id",
  "name": "Beach Volleyball",
  "description": "Volleyball game at the beach",
  "type": "Outdoor",
  "duration": 2,
  "price": 0,
  "location": "Hotel Beach"
}
```

#### Update an activity

```
PUT /api/v1/activities?id=activity1
```

Request body:
```json
{
  "price": 60,
  "duration": 4
}
```

Response:
```json
{
  "id": "activity1",
  "price": 60,
  "duration": 4
}
```

#### Delete an activity

```
DELETE /api/v1/activities?id=activity1
```

Response:
```json
{
  "success": true
}
```

### Blog Posts

#### Get all blog posts

```
GET /api/v1/blog
```

Response:
```json
[
  {
    "id": "post1",
    "title": "New Spa Opening",
    "slug": "new-spa-opening",
    "content": "We are excited to announce the opening of our new spa...",
    "excerpt": "Exciting news about our new spa facility",
    "author": "Hotel Manager",
    "category": "News",
    "tags": ["spa", "wellness", "new"],
    "status": "Published"
  },
  ...
]
```

#### Get a specific blog post by ID

```
GET /api/v1/blog?id=post1
```

Response:
```json
{
  "id": "post1",
  "title": "New Spa Opening",
  "slug": "new-spa-opening",
  "content": "We are excited to announce the opening of our new spa...",
  "excerpt": "Exciting news about our new spa facility",
  "author": "Hotel Manager",
  "category": "News",
  "tags": ["spa", "wellness", "new"],
  "status": "Published"
}
```

#### Get a specific blog post by slug

```
GET /api/v1/blog?slug=new-spa-opening
```

Response:
```json
{
  "id": "post1",
  "title": "New Spa Opening",
  "slug": "new-spa-opening",
  "content": "We are excited to announce the opening of our new spa...",
  "excerpt": "Exciting news about our new spa facility",
  "author": "Hotel Manager",
  "category": "News",
  "tags": ["spa", "wellness", "new"],
  "status": "Published"
}
```

#### Create a new blog post

```
POST /api/v1/blog
```

Request body:
```json
{
  "title": "Summer Special Offers",
  "slug": "summer-special-offers",
  "content": "Check out our amazing summer deals...",
  "excerpt": "Great summer deals for your vacation",
  "author": "Marketing Team",
  "category": "Offers",
  "tags": ["summer", "deals", "vacation"],
  "status": "Published"
}
```

Response:
```json
{
  "id": "new-post-id",
  "title": "Summer Special Offers",
  "slug": "summer-special-offers",
  "content": "Check out our amazing summer deals...",
  "excerpt": "Great summer deals for your vacation",
  "author": "Marketing Team",
  "category": "Offers",
  "tags": ["summer", "deals", "vacation"],
  "status": "Published"
}
```

#### Update a blog post

```
PUT /api/v1/blog?id=post1
```

Request body:
```json
{
  "status": "Archived"
}
```

Response:
```json
{
  "id": "post1",
  "status": "Archived"
}
```

#### Delete a blog post

```
DELETE /api/v1/blog?id=post1
```

Response:
```json
{
  "success": true
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error response format:

```json
{
  "error": "Error message describing what went wrong"
}
``` 