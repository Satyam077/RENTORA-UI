export class JwtHelper {
  static isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // convert to milliseconds
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }
}
