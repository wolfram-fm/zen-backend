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

### Sign-up

```
Request
POST /signup
Body
{
  email: string (unique)
  password: string (password is saved as plaintext)
  username: string (unique)
}

Response 200
{
  id: number (ID of new user)
}

Response 406
{
  error: "Sign-up failed"
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

### Get Posts by User

```
Request
GET /user/:id/posts
Authorization: Bearer JWT

Response 200
[
  {
    id: number,
    user_id: number,
    created_at: timestamp,
    title: string,
    listening: string | null,
    reading: string | null,
    journal: string | null,
    mood: number,
    location: string | null,
    frameColor: string | null,
    backgroundPhoto: string | null
  },
  {
    ...
  }
]

Response 404 {}
```

## URLs

Dev endpoint: https://zen-backend.onrender.com
