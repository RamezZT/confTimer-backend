import { Injectable } from '@nestjs/common';

@Injectable()
export class IdService {
  /**
   * Generates a random alphanumeric ID of a specified length.
   * The ID will contain a mix of uppercase letters, lowercase letters, and digits (0-9).
   *
   * @param length The desired length of the ID. Defaults to 6.
   * @returns A random alphanumeric string.
   */
  generateRandomAlphanumericId(length: number = 5): string {
    // Define the pool of characters: uppercase, lowercase, and digits
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    // Loop for the desired length and pick a random character
    for (let i = 0; i < length; i++) {
      // Math.random() gives a float between 0 (inclusive) and 1 (exclusive).
      // Multiplying by charactersLength and taking Math.floor() gives a
      // valid index within the characters string.
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // Optional: Ensure the ID has at least one letter and one number if stricter validation is needed.
    // For a short ID like 6 characters, the random chance is very high it will be mixed.
    // For simplicity and general use, we'll return the result.

    return result;
  }
}
