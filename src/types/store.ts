export type StoreState = {
  UserData: UserData | null;
  /** Set by auth/forgot-password flow (merged via `SET_CREDENTIALS`). */
  userName: string;
  email: string;
  id: number | null;
};

export interface UserData {
    id: string | number | null;
    firstName: string | null;
    lastName: string | null;
    dob: string | null;
    email?: string | null;
}

/** App API wrapper for `/api/App/user/Details`. */
export interface UserDetailsResponse {
    data: UserData | null;
    message: string | null;
    error: boolean;
}

