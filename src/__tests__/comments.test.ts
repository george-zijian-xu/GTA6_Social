import { describe, test, expect, afterAll, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const cleanup = {
  userIds: [] as string[],
  postIds: [] as string[],
  commentIds: [] as string[],
};

async function createTestUser(email: string, username: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPassword123!",
    email_confirm: true,
    user_metadata: { username },
  });
  if (error) throw error;
  cleanup.userIds.push(data.user.id);
  return data.user;
}

describe("Comments", () => {
  const ts = Date.now();
  let postAuthor: { id: string };
  let commenter: { id: string };
  let postId: string;

  beforeAll(async () => {
    postAuthor = await createTestUser(`cmt-author-${ts}@test.com`, `cmtauthor${ts}`);
    commenter = await createTestUser(`cmt-user-${ts}@test.com`, `cmtuser${ts}`);

    const { data: post } = await admin
      .from("posts")
      .insert({
        author_id: postAuthor.id,
        slug: `comment-test-${ts}`,
        caption: "Comment test post",
        comment_count: 0,
      })
      .select("id")
      .single();
    postId = post!.id;
    cleanup.postIds.push(postId);
  });

  afterAll(async () => {
    await admin.from("notifications").delete().eq("post_id", postId);
    for (const cid of cleanup.commentIds) {
      await admin.from("comments").delete().eq("id", cid);
    }
    for (const pid of cleanup.postIds) {
      await admin.from("posts").delete().eq("id", pid);
    }
    for (const uid of [...cleanup.userIds].reverse()) {
      await admin.from("profiles").delete().eq("id", uid);
      await admin.auth.admin.deleteUser(uid);
    }
  });

  test("comment insert increments comment_count, delete decrements", async () => {
    const { addComment, deleteComment } = await import("@/lib/comments");

    const comment = await addComment({
      postId,
      authorId: commenter.id,
      body: "Test comment",
      client: admin,
    });
    expect(comment).toBeTruthy();
    cleanup.commentIds.push(comment!.id);

    const { data: afterInsert } = await admin
      .from("posts")
      .select("comment_count")
      .eq("id", postId)
      .single();
    expect(afterInsert!.comment_count).toBe(1);

    await deleteComment(comment!.id, admin);
    cleanup.commentIds = cleanup.commentIds.filter((id) => id !== comment!.id);

    const { data: afterDelete } = await admin
      .from("posts")
      .select("comment_count")
      .eq("id", postId)
      .single();
    expect(afterDelete!.comment_count).toBe(0);
  });

  test("profanity filter rejects blocked words", async () => {
    const { addComment } = await import("@/lib/comments");

    const result = await addComment({
      postId,
      authorId: commenter.id,
      body: "You are a damn idiot",
      client: admin,
    });
    expect(result).toBeNull();
  });

  test("notification created on comment, skipped on self-comment", async () => {
    const { addComment, deleteComment } = await import("@/lib/comments");

    // Clean up previous notifications
    await admin.from("notifications").delete().eq("post_id", postId);

    // Comment by someone else → notification
    const comment = await addComment({
      postId,
      authorId: commenter.id,
      body: "Great post!",
      client: admin,
    });
    expect(comment).toBeTruthy();
    cleanup.commentIds.push(comment!.id);

    const { data: notifs } = await admin
      .from("notifications")
      .select("*")
      .eq("post_id", postId)
      .eq("type", "comment")
      .eq("actor_id", commenter.id);
    expect(notifs).toHaveLength(1);
    expect(notifs![0].target_user_id).toBe(postAuthor.id);

    // Cleanup
    await deleteComment(comment!.id, admin);
    cleanup.commentIds = cleanup.commentIds.filter((id) => id !== comment!.id);
    await admin.from("notifications").delete().eq("post_id", postId).eq("actor_id", commenter.id);

    // Self-comment → no notification
    const selfComment = await addComment({
      postId,
      authorId: postAuthor.id,
      body: "My own comment",
      client: admin,
    });
    expect(selfComment).toBeTruthy();
    cleanup.commentIds.push(selfComment!.id);

    const { data: selfNotifs } = await admin
      .from("notifications")
      .select("*")
      .eq("post_id", postId)
      .eq("actor_id", postAuthor.id)
      .eq("type", "comment");
    expect(selfNotifs).toHaveLength(0);

    // Cleanup
    await deleteComment(selfComment!.id, admin);
    cleanup.commentIds = cleanup.commentIds.filter((id) => id !== selfComment!.id);
  });

  test("reply sets parent_comment_id", async () => {
    const { addComment, deleteComment } = await import("@/lib/comments");

    const parent = await addComment({
      postId,
      authorId: commenter.id,
      body: "Parent comment",
      client: admin,
    });
    cleanup.commentIds.push(parent!.id);

    const reply = await addComment({
      postId,
      authorId: postAuthor.id,
      body: `@cmtuser${ts} Great point!`,
      parentCommentId: parent!.id,
      client: admin,
    });
    cleanup.commentIds.push(reply!.id);

    const { data: replyRow } = await admin
      .from("comments")
      .select("parent_comment_id")
      .eq("id", reply!.id)
      .single();
    expect(replyRow!.parent_comment_id).toBe(parent!.id);

    // Cleanup
    await deleteComment(reply!.id, admin);
    await deleteComment(parent!.id, admin);
    cleanup.commentIds = cleanup.commentIds.filter(
      (id) => id !== reply!.id && id !== parent!.id
    );
  });
});
