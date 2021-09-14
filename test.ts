import {
  assert,
  assertEquals,
  assertExists,
  assertThrowsAsync,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";

// Run tests with your SHORTCUT_API_TOKEN env var

import { Shortcut, FetchException, NotFoundException } from "./mod.ts";

Deno.test("Initialize client", () => {
  const client = new Shortcut();
  assertExists(client.getToken());
  assertEquals(client.getBaseUrl(), "https://api.app.shortcut.com/api/v3");
});

Deno.test("Throws error if bad token", async () => {
  const client = new Shortcut({ token: "badToken" });

  await assertThrowsAsync(
    async () => {
      return await client.getIterations();
    },
    FetchException,
    "Unauthorized"
  );
});

Deno.test("Fetch iterations", async () => {
  const client = new Shortcut();

  const iterations = await client.getIterations();
  assert(iterations.length > 0, "Has iterations");
});

Deno.test("Fetch Stories", async () => {
  const client = new Shortcut();

  const results = await client.search("clubhouse");
  assert(results.stories.data.length > 0, "Has stories");
});

Deno.test("Create, update and delete story", async () => {
  const client = new Shortcut();

  const projects = await client.getProjects();

  // Create
  const story = await client.createStory({
    name: "Fake story",
    project_id: projects[0].id,
    description: "Fake description",
  });

  assert(story.name === "Fake story", "Created name");
  assert(story.description === "Fake description", "Created decription");
  assert(story.project_id === projects[0].id, "Assigned project");

  // Update
  const updatedStory = await client.updateStory(story.id, {
    description: "Updated fake description",
  });

  assert(updatedStory.id === story.id, "Same id");
  assert(updatedStory.name === story.name, "Same name");
  assert(
    updatedStory.description === "Updated fake description",
    "Updated description"
  );

  // Get
  const fetchedStory = await client.getStory(story.id);
  assert(fetchedStory.id === story.id, "Same id for fetched story");

  // Delete
  await client.deleteStory(story.id);

  await assertThrowsAsync(
    async () => {
      return await client.getStory(story.id);
    },
    NotFoundException,
    `/stories/${story.id}`
  );
});
