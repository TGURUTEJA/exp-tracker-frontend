export type StoreState = {
  UserData : UserData | null;
};

export interface UserData {
    id: number | null;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
}

