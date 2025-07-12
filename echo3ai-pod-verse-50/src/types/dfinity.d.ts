declare module '@dfinity/auth-client' {
  export interface AuthClient {
    isAuthenticated(): Promise<boolean>;
    getIdentity(): Identity;
    login(options: LoginOptions): void;
    logout(): Promise<void>;
  }

  export interface Identity {
    getPrincipal(): Principal;
  }

  export interface Principal {
    toText(): string;
  }

  export interface LoginOptions {
    identityProvider?: string;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }

  export function create(): Promise<AuthClient>;
}

declare module '@dfinity/identity' {
  export interface Identity {
    getPrincipal(): Principal;
  }

  export interface Principal {
    toText(): string;
  }
}

declare module '@dfinity/agent' {
  export interface Agent {
    getPrincipal(): Principal;
  }

  export interface Principal {
    toText(): string;
  }
} 