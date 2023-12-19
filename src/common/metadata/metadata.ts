import "reflect-metadata";

export class Metadata {
  private static instance: Metadata;

  private constructor() {}

  public static Instance(): Metadata {
    if (!Metadata.instance) {
      Metadata.instance = new Metadata();
    }

    return Metadata.instance;
  }

  public get(key: any, target: any) {
    return Reflect.getMetadata(key, target);
  }

  public set(key: any, value: any, target: any) {
    Reflect.defineMetadata(key, value, target);
  }

  public has(key: any, target: any) {
    return Reflect.hasMetadata(key, target);
  }
}
