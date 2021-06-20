# clubhouse_api

A clubhouse.io api wrapper for deno.

## Usage

Import the clubhouse client and initialize it with your token.

```ts
import { Clubhouse } from "https://deno.land/x/clubhouse_api@v1.0.0/mod.ts";

const client = new Clubhouse({ token: "xxx-xxx-xxx" });
```

### Via env

Define env var `CLUBHOUSE_API_TOKEN` with your token.

> :warning: With this method you will have to launch your application with the
> `--allow-env` flag

```ts
const client = new Clubhouse();
```

## Features

From the client all the methods currently accessible (06/20/2021) from the API
v3 are available. https://clubhouse.io/api/rest/v3/

Categories, Entity-Templates, Epic-Workflow, Epics, External-Link, Files,
Groups, Iterations, Labels, Linked-Files, Member, Members, Milestones, Projects,
Repositories, Search, Stories, Story-Links, Workflows

## Examples

```ts
// Get all projects
const projects = await client.getProjects();

// Add a new story for the first project
const story = await client.createStory({
  name: "Fake story",
  project_id: projects[0].id,
  description: "Fake description",
});

const updatedStory = await client.updateStory(story.id, {
  description: "Updated fake description",
});

await client.deleteStory(/* ... */);

// Get iterations
const iterations = await client.getIterations();
```
