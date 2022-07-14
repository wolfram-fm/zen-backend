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
  id: number (user ID)
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
  token: JWT (1 hour expiry)
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
    frame_color: string | null,
    background_photo: string | null
  },
  {
    ...
  }
]

Response 404 {}
```

### Create Post

This endpoint checks whether or not the user has already made a post today. If so, it will update the existing post; otherwise, it'll create a new rows. In the event of an update, only keys in the body will be updated. So if I wanted to update only the `journal` key, then I only need to send the Body with that 1 key. Anything values sent as `null` will cause the corresponding column to be erased.

```
Request
PATCH /post
Body
{
  title: string | null
  listening: string | null
  reading: string | null
  journal: string | null
  mood: number | null
  location: string | null
  frame_color: string | null
  background_photo: string | null
}

Response 200
{
  id: number
}

Response 500
{
  error: "Post creation failed"
}
```

## URLs

Dev endpoint: https://zen-backend.onrender.com
