import { StoreState } from "@/types/store";
import InitialState from "@/store/initState";


const initialState : StoreState = InitialState;


export default function rootReducer(state=initialState, action : { type: string; payload?: any }) {
    console.log("Action dispatched to rootReducer:", action);
    switch (action.type) {
        // Define your action handlers here
        case 'SET_CREDENTIALS':
            console.log("SET_CREDENTIALS action payload:", action.payload);
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}