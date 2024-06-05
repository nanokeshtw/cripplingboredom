import type { RequestHandler } from "@sveltejs/kit";

import { ActivityManager } from "$lib/server/ActivityManager";

export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.activityId!);
  if (isNaN(id)) return new Response("Invalid Activity Id!", { status: 400 });

  const activityManager = await ActivityManager.getInstance();
  const activity = activityManager.get(id);

  if (!activity)
    return new Response("Activity Not Found!", {
      status: 404,
    });

  return new Response(JSON.stringify(activity.resources), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
