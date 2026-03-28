import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestPosts() {
  // Get test user
  const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
  if (!profiles || profiles.length === 0) {
    console.error("No user found. Create a user first.");
    return;
  }
  const userId = profiles[0].id;

  // Get locations with both game and real coords
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, slug")
    .not("ig_x", "is", null)
    .not("rl_lat", "is", null)
    .limit(10);

  if (!locations || locations.length === 0) {
    console.error("No locations found.");
    return;
  }

  const testPosts = [
    { caption: "Sunset vibes at the beach 🌅", count: 120, slug: "sunset-vibes-beach" },
    { caption: "Best coffee spot in town ☕", count: 85, slug: "best-coffee-spot" },
    { caption: "Hidden gem found! 💎", count: 200, slug: "hidden-gem-found" },
    { caption: "Street art is amazing here 🎨", count: 45, slug: "street-art-amazing" },
    { caption: "Perfect spot for photos 📸", count: 150, slug: "perfect-photo-spot" },
    { caption: "Local market finds 🛍️", count: 30, slug: "local-market-finds" },
    { caption: "Rooftop views are unreal 🏙️", count: 95, slug: "rooftop-views-unreal" },
    { caption: "Late night adventures 🌙", count: 60, slug: "late-night-adventures" },
    { caption: "Food paradise discovered 🍕", count: 175, slug: "food-paradise-discovered" },
    { caption: "Architecture goals 🏛️", count: 40, slug: "architecture-goals" },
  ];

  for (let i = 0; i < Math.min(testPosts.length, locations.length); i++) {
    const post = testPosts[i];
    const location = locations[i];

    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: userId,
        caption: post.caption,
        slug: post.slug,
        location_id: location.id,
        post_type: "RR",
      })
      .select()
      .single();

    if (postError) {
      console.error(`Error creating post: ${postError.message}`);
      continue;
    }

    // Add fake likes
    const { error: updateError } = await supabase
      .from("posts")
      .update({ like_count: post.count })
      .eq("id", newPost.id);

    if (updateError) {
      console.error(`Error updating likes: ${updateError.message}`);
    }

    // Update location post_count
    const { data: locData } = await supabase
      .from("locations")
      .select("post_count")
      .eq("id", location.id)
      .single();

    await supabase
      .from("locations")
      .update({ post_count: (locData?.post_count || 0) + 1 })
      .eq("id", location.id);

    console.log(`✓ Created post at ${location.name} (${post.count} likes)`);
  }

  console.log("\n✅ Test posts created successfully!");
}

seedTestPosts();
