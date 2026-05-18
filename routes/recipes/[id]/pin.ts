import { define } from "@/utils.ts";
import { connect } from "@/db.ts";
import { invariant } from "@/invariant.ts";

export const handler = define.handlers({
  async POST(ctx) {
    invariant(typeof ctx.params.id === "string");

    const db = await connect();
    await db.execute({
      sql:
        "UPDATE recipes SET pinned_at = CASE WHEN pinned_at IS NULL THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?",
      args: [ctx.params.id],
    });

    return new Response(null, {
      status: 303,
      headers: { Location: ctx.req.headers.get("referer") ?? "/" },
    });
  },
});
