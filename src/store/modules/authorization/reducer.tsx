import * as types from "../types";
import type { AnyAction } from "redux";

interface User {
    id: number;
    nome: string;
    email: string;
    tipo: string;
    foto?: string | null;
}

interface AuthInitialState {
    isLoggedIn: boolean;
    token: string;
    user: User;
    error: string;
    update: boolean;
}

const initialState: AuthInitialState = {
    isLoggedIn: false,
    token: "",
    user: {
        id: 0,
        nome: "",
        email: "",
        tipo: "",
        foto: null,
    },
    error: "",
    update: false,
};

export const reducerAuthrization = (
    state = initialState,
    action: AnyAction
): AuthInitialState => {
    switch (action.type) {
        case types.LOGIN_SUCCESS: {
            return {
                ...state,
                isLoggedIn: true,
                token: action.payload.token,
                user: action.payload.user,
            };
        }

        case types.LOGIN_REQUEST: {
            return { ...initialState};
        }

        case types.LOGIN_FAILURE: {
            return {
                ...initialState,
                error: action.payload.error,
            };
        }

        case types.REGISTER_SUCCESS: {
            return { ...state };
        }

        case types.REGISTER_REQUEST: {
            return { ...initialState };
        }

        case types.REGISTER_FAILURE: {
            return { ...initialState };
        }

        case types.UPDATE_SUCCESS: {
            return {
                ...state,
                user: {
                    ...state.user,
                    nome: action.payload.user.nome,
                    email: action.payload.user.email,
                    tipo: action.payload.user.tipo ?? state.user.tipo,
                    foto: action.payload.user.foto ?? null,
                },
                update: action.payload.update,
            };
        }

        case types.UPDATE_FAILURE: {
            return { ...initialState };
        }

        case types.RESET_UPDATE: {
            return {
                ...state,
                update: false,
            };
        }

        default: {
            return state;
        }
    }
};