# zen-backend

## Endpoints

### Login

```
Request
POST /login
Body
{
  email: string
  password: string
}

Response 200
{
  token: JWT (1 hour expiry)
}

Response 406
{
  error: "Login failed"
}
```

### Get User by ID

```
Request
GET /user/:id
Authorization: Bearer JWT

Response 200
{
  id: number
  username: string
  created_at: timestamp
}

Response 404 {}
```

### Get User by Username

```
Request
GET /user/search/:username
Authorization: Bearer JWT

Response 200
{
  id: number
  username: string
  created_at: timestamp
}

Response 404 {}
```
