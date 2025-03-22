declare module 'playfab-sdk' {
  export namespace PlayFab {
    export let settings: {
      titleId: string;
      developerSecretKey?: string;
    };
  }

  // Define common types
  export interface PlayFabError {
    code: number;
    status: string;
    error: string;
    errorCode: number;
    errorMessage: string;
    retryAfterSeconds?: number;
  }

  export interface PlayFabResult<T> {
    data: T;
    status: number;
    errorCode?: number;
    errorMessage?: string;
  }

  export interface GetPlayerCombinedInfoRequestParams {
    GetPlayerProfile?: boolean;
    GetPlayerStatistics?: boolean;
    GetTitleData?: boolean;
    GetUserData?: boolean;
    GetUserInventory?: boolean;
    GetUserReadOnlyData?: boolean;
    GetUserVirtualCurrency?: boolean;
    GetCharacterInventories?: boolean;
    GetCharacterList?: boolean;
    GetTitleData?: boolean;
    ProfileConstraints?: any;
    UserDataKeys?: string[];
    UserReadOnlyDataKeys?: string[];
  }

  export interface LoginResult {
    SessionTicket: string;
    PlayFabId: string;
    NewlyCreated?: boolean;
    SettingsForUser?: any;
    LastLoginTime?: string;
    InfoResultPayload?: {
      PlayerProfile?: {
        PlayerId: string;
        DisplayName?: string;
        Avatars?: any;
      }
    };
  }

  export interface RegisterPlayFabUserResult {
    PlayFabId: string;
    SessionTicket: string;
    Username?: string;
    SettingsForUser?: any;
  }

  export namespace PlayFabClient {
    export function LoginWithEmailAddress(
      request: {
        Email: string;
        Password: string;
        InfoRequestParameters?: GetPlayerCombinedInfoRequestParams;
      },
      callback: (error: PlayFabError | null, result: PlayFabResult<LoginResult> | null) => void
    ): void;

    export function RegisterPlayFabUser(
      request: {
        Email: string;
        Password: string;
        DisplayName?: string;
        RequireBothUsernameAndEmail: boolean;
      },
      callback: (error: PlayFabError | null, result: PlayFabResult<RegisterPlayFabUserResult> | null) => void
    ): void;

    export function GetUserData(
      request: {
        Keys?: string[];
        PlayFabId?: string;
      },
      callback: (error: PlayFabError | null, result: PlayFabResult<any> | null) => void
    ): void;

    export function UpdateUserData(
      request: {
        Data: Record<string, string>;
        KeysToRemove?: string[];
        Permission?: string;
      },
      callback: (error: PlayFabError | null, result: PlayFabResult<any> | null) => void
    ): void;

    export function UpdatePlayerStatistics(
      request: {
        Statistics: Array<{
          StatisticName: string;
          Value: number;
        }>;
      },
      callback: (error: PlayFabError | null, result: PlayFabResult<any> | null) => void
    ): void;
  }
}
