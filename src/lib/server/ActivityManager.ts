import { Activity, type ActivityResource } from "$lib";
import { readFile } from "fs/promises";

export class ActivityManager {
  private static _instance: ActivityManager;
  private lastActivities: Activity[] = new Array(5);
  constructor(private activities: Activity[]) {}

  private static async get_resources(): Promise<
    Map<number, ActivityResource[]>
  > {
    const lines = (
      await readFile("src/data/activity_resources.txt", "utf-8")
    ).split("\n");

    return new Map(
      lines.map((line) => {
        const id = Number(line.split(",")[0]);
        const split = line.substring(line.indexOf(",") + 1).split(",");
        return [
          id,
          split.map((resource) => JSON.parse(resource) as ActivityResource),
        ];
      }),
    );
  }

  public static async new(): Promise<ActivityManager> {
    const resources = await ActivityManager.get_resources();

    return new ActivityManager(
      (await readFile("src/data/activities.txt", "utf-8"))
        .split("\n")
        .map((line) => {
          const split = line.split(",");
          return new Activity(
            Number(split[0]),
            split[1],
            Number(split[2]),
            resources.get(Number(split[0])) || [],
            split.at(3) ? new Date(split[3]) : undefined,
          );
        }),
    );
  }

  public static async getInstance() {
    if (!this._instance) this._instance = await ActivityManager.new();
    return this._instance;
  }

  public get(id: number): Activity | undefined {
    return this.activities.find((activity) => activity.id == id);
  }

  public pick(): Activity | undefined {
    const activities = this.activities.filter((activity, index) => {
      if (!activity.lastDone) return true;
      if (this.lastActivities.includes(activity)) return false;

      const now = new Date();
      const timeSinceLastDone = now.getTime() - activity.lastDone.getTime();
      return timeSinceLastDone > activity.approximateTime * 1000 * 60;
    });

    if (activities.length === 0) return undefined;

    const activity = activities[Math.floor(Math.random() * activities.length)];
    activity.lastDone = new Date();
    if (this.lastActivities.length === 5) this.lastActivities.shift();
    this.lastActivities.push(activity);

    return activity;
  }

  public templateActivities(): string[] {
    const max = 15;
    let total = 0;
    return this.activities
      .filter(() => {
        let out =
          total < max &&
          Math.floor(Math.random() * this.activities.length) <= max;
        if (out) total++;
        return out;
      })
      .map((activity) => activity.name);
  }
}
