async function postRoutes(fastify, options) {
  fastify.get(
    "/post/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const database = await fastify.pg.connect();
        const { rows } = await database.query(
          "SELECT * FROM posts WHERE id=$1 LIMIT 1",
          [request.params.id]
        );

        reply.send(rows[0] || {});
      } catch (e) {
        console.log(e);
        reply.code(404).send({});
      }
    }
  );

  fastify.get(
    "/post/follows",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.headers.jwt.uid;
      let date = request.query?.date;

      if (!date) {
        let today = new Date();
        date = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      }

      try {
        const database = await fastify.pg.connect();
        const { rows } = await database.query(
          `SELECT *
          FROM posts
          WHERE date_trunc('day', created_at) = $1
          AND user_id IN (
            SELECT user_id_2
            FROM user_follows
            WHERE user_id_1 = $2
          );`,
          [date, userId]
        );

        reply.send(rows || []);
      } catch (e) {
        console.log(e);
        reply.send([]);
      }
    }
  );

  const createPostSchema = {
    body: {
      type: "object",
      properties: {
        title: { type: "string", nullable: true },
        listening: { type: "string", nullable: true },
        reading: { type: "string", nullable: true },
        journal: { type: "string", nullable: true },
        mood: { type: "number", nullable: true },
        location: { type: "string", nullable: true },
        frame_color: { type: "string", nullable: true },
        background_photo: { type: "string", nullable: true },
      },
    },
  };
  fastify.patch(
    "/post",
    { schema: createPostSchema, onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.headers.jwt.uid;
      const database = await fastify.pg.connect();

      try {
        // check if user has a post for today
        const existingPost = await database.query(
          "SELECT id FROM posts WHERE user_id=$1 AND date_trunc('day', created_at) = CURRENT_DATE LIMIT 1",
          [userId]
        );

        let updatedId;
        let columns = [];
        let values = [];
        if (existingPost.rows?.[0].id) {
          [
            "title",
            "listening",
            "reading",
            "journal",
            "mood",
            "location",
            "frame_color",
            "background_photo",
          ].forEach((key) => {
            if (request.body?.[key]) {
              columns.push(`${key} = $${columns.length + 1}`);
              values.push(request.body[key]);
            }
          });

          values.push(existingPost.rows[0].id);

          let { rows } = await database.query(
            `UPDATE posts SET ${columns.join()} WHERE id = $${
              values.length
            } RETURNING id`,
            values
          );

          updatedId = rows[0].id;
        } else {
          let { rows } = await database.query(
            `INSERT INTO posts(
              user_id,
              title,
              listening,
              reading,
              journal,
              mood,
              location,
              frame_color,
              background_photo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id`,
            [
              userId,
              request.body?.title,
              request.body?.listening,
              request.body?.reading,
              request.body?.journal,
              request.body?.mood,
              request.body?.location,
              request.body?.frame_color,
              request.body?.background_photo,
            ]
          );
          updatedId = rows[0].id;
        }

        reply.send({ id: updatedId });
      } catch (e) {
        console.log(e);
        reply.code(500).send({ error: "Post creation failed" });
      }
    }
  );
}

module.exports = postRoutes;
