import { StoreState } from "@/types/store";

const InitialState: StoreState = {
  UserData: {
    id: null,
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
  },
  userName: "",
  email: "",
  id: null,
};
export default InitialState;