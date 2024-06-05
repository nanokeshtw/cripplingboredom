export type ActivityResource = string | { url: string };

export class Activity {
  constructor(
    public id: number,
    public name: string,
    public approximateTime: number,
    public resources: ActivityResource[],
    public lastDone?: Date,
  ) {}
}
