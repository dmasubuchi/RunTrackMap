declare module 'playfab-sdk' {
  export namespace PlayFab {
    export let settings: {
      titleId: string;
      developerSecretKey?: string;
    };
  }

  export namespace PlayFabClient {
    export function LoginWithCustomID(
      request: {
        CustomId: string;
        CreateAccount?: boolean;
      },
      callback: (error: any, result: any) => void
    ): void;

    export function GetUserData(
      request: {
        Keys?: string[];
      },
      callback: (error: any, result: any) => void
    ): void;

    export function UpdateUserData(
      request: {
        Data: Record<string, string>;
        Permission?: string;
      },
      callback: (error: any, result: any) => void
    ): void;
  }
}
