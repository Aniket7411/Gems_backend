# Gem E-commerce API Endpoints Documentation

This document outlines all the API endpoints required for the gem e-commerce application.

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. User Registration
- **POST** `/auth/register`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### 2. User Login
- **POST** `/auth/login`
- **Description**: Authenticate user and return JWT token
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Forgot Password
- **POST** `/auth/forgot-password`
- **Description**: Send password reset email
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 4. Reset Password
- **POST** `/auth/reset-password/:token`
- **Description**: Reset password using token
- **Request Body**:
```json
{
  "password": "newpassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 5. Verify Email
- **GET** `/auth/verify-email/:token`
- **Description**: Verify user email
- **Response**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

## Gem Management Endpoints

### 1. Add New Gem
- **POST** `/gems`
- **Description**: Add a new gem to the collection
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "name": "Blue Sapphire",
  "description": "High quality blue sapphire with excellent clarity",
  "category": "Sapphire",
  "whomToUse": ["Aries", "Taurus", "Gemini"],
  "benefits": ["Financial Prosperity", "Health & Healing", "Mental Clarity"],
  "price": 50000,
  "sizeWeight": 5,
  "sizeUnit": "carat",
  "discount": 10,
  "discountType": "percentage",
  "images": ["url1", "url2", "url3"],
  "uploadedImages": ["base64_image1", "base64_image2"],
  "allImages": ["url1", "url2", "base64_image1"],
  "stock": 10,
  "availability": true,
  "certification": "Govt. Lab Certified",
  "origin": "Sri Lanka"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Gem added successfully",
  "data": {
    "id": "gem_id",
    "name": "Blue Sapphire",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Get All Gems
- **GET** `/gems`
- **Description**: Get all gems with optional filtering
- **Query Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `category` (optional): Filter by category
  - `minPrice` (optional): Minimum price filter
  - `maxPrice` (optional): Maximum price filter
  - `zodiac` (optional): Filter by zodiac sign
- **Response**:
```json
{
  "success": true,
  "data": {
    "gems": [
      {
        "id": "gem_id",
        "name": "Blue Sapphire",
        "category": "Sapphire",
        "price": 50000,
        "discount": 10,
        "discountType": "percentage",
        "images": ["url1", "url2"],
        "availability": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Gem by ID
- **GET** `/gems/:id`
- **Description**: Get detailed information about a specific gem
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "gem_id",
    "name": "Blue Sapphire",
    "description": "High quality blue sapphire...",
    "category": "Sapphire",
    "whomToUse": ["Aries", "Taurus"],
    "benefits": ["Financial Prosperity", "Health & Healing"],
    "price": 50000,
    "sizeWeight": 5,
    "sizeUnit": "carat",
    "discount": 10,
    "discountType": "percentage",
    "allImages": ["url1", "url2"],
    "stock": 10,
    "availability": true,
    "certification": "Govt. Lab Certified",
    "origin": "Sri Lanka",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Update Gem
- **PUT** `/gems/:id`
- **Description**: Update gem information
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Same as add gem
- **Response**:
```json
{
  "success": true,
  "message": "Gem updated successfully",
  "data": {
    "id": "gem_id",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Delete Gem
- **DELETE** `/gems/:id`
- **Description**: Delete a gem
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Gem deleted successfully"
}
```

### 6. Search Gems
- **POST** `/gems/search`
- **Description**: Search gems with advanced filters
- **Request Body**:
```json
{
  "query": "blue sapphire",
  "category": "Sapphire",
  "minPrice": 10000,
  "maxPrice": 100000,
  "zodiac": "Aries",
  "benefits": ["Financial Prosperity"],
  "availability": true
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "gems": [...],
    "pagination": {...}
  }
}
```

### 7. Get Gem Categories
- **GET** `/gems/categories`
- **Description**: Get all available gem categories
- **Response**:
```json
{
  "success": true,
  "data": [
    "Sapphire",
    "Ruby",
    "Emerald",
    "Diamond",
    "Pearl",
    "Coral"
  ]
}
```

### 8. Get Gems by Category
- **GET** `/gems/category/:category`
- **Description**: Get gems filtered by category
- **Response**: Same as get all gems

### 9. Get Gems by Zodiac Sign
- **GET** `/gems/zodiac/:zodiacSign`
- **Description**: Get gems suitable for a specific zodiac sign
- **Response**: Same as get all gems

## Cart Endpoints

### 1. Add Item to Cart
- **POST** `/cart/add`
- **Description**: Add gem to user's cart
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "gemId": "gem_id",
  "quantity": 2
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItem": {
      "id": "cart_item_id",
      "gemId": "gem_id",
      "quantity": 2,
      "addedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 2. Get Cart
- **GET** `/cart`
- **Description**: Get user's cart items
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart_item_id",
        "gem": {
          "id": "gem_id",
          "name": "Blue Sapphire",
          "price": 50000,
          "images": ["url1", "url2"]
        },
        "quantity": 2,
        "addedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100000,
    "itemCount": 2
  }
}
```

### 3. Update Cart Item
- **PUT** `/cart/update/:gemId`
- **Description**: Update quantity of cart item
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "quantity": 3
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Cart item updated"
}
```

### 4. Remove from Cart
- **DELETE** `/cart/remove/:gemId`
- **Description**: Remove item from cart
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 5. Clear Cart
- **DELETE** `/cart/clear`
- **Description**: Clear all items from cart
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

## Order Endpoints

### 1. Create Order
- **POST** `/orders`
- **Description**: Create a new order
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "items": [
    {
      "gemId": "gem_id",
      "quantity": 2,
      "price": 50000
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  },
  "paymentMethod": "cod",
  "orderNotes": "Please handle with care"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD123456789",
    "status": "pending",
    "total": 100000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Get User Orders
- **GET** `/orders`
- **Description**: Get user's order history
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by order status
- **Response**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_id",
        "orderId": "ORD123456789",
        "status": "delivered",
        "total": 100000,
        "items": [...],
        "shippingAddress": {...},
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

### 3. Get Order by ID
- **GET** `/orders/:orderId`
- **Description**: Get detailed order information
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "orderId": "ORD123456789",
    "status": "delivered",
    "total": 100000,
    "items": [...],
    "shippingAddress": {...},
    "paymentMethod": "cod",
    "trackingNumber": "TRK123456",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Cancel Order
- **PUT** `/orders/:orderId/cancel`
- **Description**: Cancel an order
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

## OTP Endpoints (for Non-Logged Users)

### 1. Send OTP
- **POST** `/otp/send`
- **Description**: Send OTP to phone number
- **Request Body**:
```json
{
  "phoneNumber": "+1234567890"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "sessionId": "session_id",
    "expiresAt": "2024-01-01T00:05:00Z"
  }
}
```

### 2. Verify OTP
- **POST** `/otp/verify`
- **Description**: Verify OTP and create temporary session
- **Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456",
  "sessionId": "session_id"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "tempToken": "temp_jwt_token",
    "expiresAt": "2024-01-01T00:30:00Z"
  }
}
```

## Health Check

### 1. Health Check
- **GET** `/health`
- **Description**: Check API health status
- **Response**:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute
- OTP endpoints: 3 requests per minute

## File Upload

For gem images, the API should support:
- File upload via multipart/form-data
- Image formats: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB per image
- Maximum images per gem: 10

## Database Schema Suggestions

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Gems Table
```sql
CREATE TABLE gems (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(5,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  size_weight DECIMAL(8,2) NOT NULL,
  size_unit VARCHAR(20) NOT NULL,
  images JSON,
  stock INTEGER DEFAULT 0,
  availability BOOLEAN DEFAULT TRUE,
  certification VARCHAR(255),
  origin VARCHAR(255),
  whom_to_use JSON,
  benefits JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  gem_id UUID REFERENCES gems(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, gem_id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSON NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  order_notes TEXT,
  tracking_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  gem_id UUID REFERENCES gems(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

This API documentation provides a complete reference for implementing the backend for your gem e-commerce application. The backend developer can use this to understand all the required endpoints, data structures, and business logic.
