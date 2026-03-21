export interface AuthBridge {
  getAccessToken(): Promise<string | null>
}