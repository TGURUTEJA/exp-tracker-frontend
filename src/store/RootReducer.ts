import { StoreState } from "@/types/store";
import InitialState from "@/store/initState";


const initialState : StoreState = InitialState;


export default function rootReducer(state=initialState, action: { type: string; payload?: unknown }) {
    console.log("Action dispatched to rootReducer:", action);
    switch (action.type) {
        // Define your action handlers here
        case 'SET_CREDENTIALS': {
            console.log("SET_CREDENTIALS action payload:", action.payload);
            const patch =
                action.payload && typeof action.payload === "object"
                    ? (action.payload as Record<string, unknown>)
                    : {};
            return {
                ...state,
                ...patch,
            };
        }
        default:
            return state;
    }
}