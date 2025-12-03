export class DelayHelper {
  public static async wait(seconds: number): Promise<void> {
    console.log(`delay for ${seconds} seconds`);
    await new Promise((res) =>
      setTimeout(() => {
        console.log(`delay resolved!`);
        res(1);
      }, seconds * 1000),
    );
  }
}
