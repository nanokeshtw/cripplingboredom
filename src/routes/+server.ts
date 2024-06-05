import type { RequestHandler } from "@sveltejs/kit";

import { ActivityManager } from "$lib/server/ActivityManager";

export const GET: RequestHandler = async () => {
  const activityPicker = await ActivityManager.getInstance();

  return new Response(activityPicker.templateActivities().join("\n"));
};

export const POST: RequestHandler = async () => {
  const activityPicker = await ActivityManager.getInstance();

  const activity = activityPicker.pick();
  if (activity) return new Response(JSON.stringify(activity));
  return new Response("You've gone through all the activities!", {
    status: 404,
  });
};
