# zen-backend

## Endpoints

- User
  - [Login](#login)
  - [Sign-up](#sign-up)
  - [Get User by ID](#get-user-by-id)
  - [Get User by Username](#get-user-by-username)
  - [Get Posts by User](#get-posts-by-user)
- News
  - [Get Article](#get-article)
  - [Get Feed](#get-feed)
  - [Create News Article](#create-news-article)
  - [Update News Article](#update-news-article)
  - [Delete News Article](#delete-news-article)
- Post
  - [Create Post](#create-post)
  - [Get Follow Posts](#get-follow-posts)
- Relationship
  - [Follow User](#follow-user)
  - [Unfollow User](#unfollow-user)

---

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
  email: string
  username: string
  created_at: timestamp
  role: string
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

### Get Article

```
Request
GET /news/:id
Authorization: Bearer JWT

Response 200
{
  id: number
  created_at: timestamp
  title: string
  journal: string
  location: string | null
  frame_color: string | null
  background_photo: string | null
}

Response 404 {}
```

### Get Feed

```
Request
GET /news
Authorization: Bearer JWT
Query Params
{
  // last date to start looking for articles
  startDate: YYYY-MM-DD (defaults to Today if not provided)
  // number to return (in reverse chronological order)
  count: 5 (default)
}

Response 200
[
  {
    Article (see Get Article)
  }
]
```

### Create News Article

This endpoint will do a check to make sure the sender's JWT token has a `role` of `"admin"`.

```
Request
POST /news
Authorization: Bearer JWT
Body
{
  title: string
  journal: string
  location: string | null
  frame_color: string | null
  background_photo: string | null
}

Response 200
{
  id: number
}

Response 403
{
  error: "Unauthorized posting of news article"
}

Response 406
{
  error: "Missing `title` and `journal` fields in Request"
}

Response 500
{
  error: "News article creation failed"
}
```

### Update News Article

This endpoint will do a check to make sure the sender's JWT token has a `role` of `"admin"`. This endpoint will only update the fields that are present, and any missing fields will remain the same. You cannot set `title` or `journal` to `null` as that'll create a DB conflict.

```
Request
PATCH /news/:id
Authorization: Bearer JWT
Body
{
  title: string
  journal: string
  location: string | null
  frame_color: string | null
  background_photo: string | null
}

Response 200
{
  id: number
}

Response 403
{
  error: "Unauthorized posting of news article"
}

Response 500
{
  error: "News article creation failed"
}
```

### Delete News Article

This endpoint will do a check to make sure the sender's JWT token has a `role` of `"admin"`.

```
Request
DELETE /news/:id
Authorization: Bearer JWT

Response 200
{
  success: true
}

Response 403
{
  error: "Unauthorized posting of news article"
}
```

### Create Post

This endpoint checks whether or not the user has already made a post today. If so, it will update the existing post; otherwise, it'll create a new rows. In the event of an update, only keys in the body will be updated. So if I wanted to update only the `journal` key, then I only need to send the Body with that 1 key. Anything values sent as `null` will cause the corresponding column to be erased.

```
Request
PATCH /post
Authorization: Bearer JWT
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

### Get Follow Posts

```
Request
GET /post/follows
Authorization: Bearer JWT
Query Params
{
  date: YYYY-MM-DD (defaults to Today if not provided)
}

Response 200
[
  {
    Post (see Create Post)
  }
]
```

### Follow User

```
Request
POST /follow
Authorization: Bearer JWT
Body
{
  user_id: number
}

Response 200
{
  success: true
}

Response 400
{
  error: "Cannot (un)follow yourself"
}

Response 500
{
  error: "Follow action failed"
}
```

### Unfollow User

```
Request
POST /unfollow
Authorization: Bearer JWT
Body
{
  user_id: number
}

Response 200
{
  success: true
}

Response 400
{
  error: "Cannot (un)follow yourself"
}

Response 500
{
  error: "Follow action failed"
}
```

## Notes

Dev endpoint: https://zen-backend.onrender.com

Admin user:

- email: wolfram@turntable.fm
- pass: abc123
