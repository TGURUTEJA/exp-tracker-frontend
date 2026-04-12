export type StoreState = {
  UserData: UserData | null;
  /** Set by auth/forgot-password flow (merged via `SET_CREDENTIALS`). */
  userName: string;
  email: string;
  id: number | null;
};

export interface UserData {
    id: number | null;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
}

/** App API wrapper for `/api/App/user/Details`. */
export interface UserDetailsResponse {
    data: UserData;
    message: string;
    error: boolean;
}

