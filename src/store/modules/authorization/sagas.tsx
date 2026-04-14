import { call, put, all, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { toast } from "react-toastify"

import * as actions from "./actions";
import * as types from "../types";
import axiosService from "../../../config/axios";
import endPoints from "../../../config/endPoints";

interface RegisterPayload {
    nome: string;
    email: string;
    senha: string;
    tipo: string;
    foto?: string | null;
}

interface UpdatePayload {
    id: number | null;
    nome: string | null;
    email: string | null;
    senha: string | null | undefined;
    trocouEmail: boolean | null;
    foto?: string | null;
}

interface LoginPayload {
    email: string;
    senha: string;
}

function* loginRequest({ payload }: PayloadAction<LoginPayload>): SagaIterator {
    try {
        const { data } = yield call(axiosService.post, endPoints.login, payload);

        yield put(actions.loginSuccess({ ...data }));

        axiosService.defaults.headers.Authorization = `Bearer ${data.token}`;
    } catch (e: any) {
        yield put(actions.loginFailure({
            error: e.response?.data?.message || "Usuário ou senha inválidos"
        }));
    }
}

function* registerRequest({ payload }: PayloadAction<RegisterPayload>): SagaIterator {
    try {
        const responseData = yield call(axiosService.post, endPoints.cadastro, payload);
        yield put(actions.registerSuccess({ ...responseData.data }));

        const { data } = yield call(axiosService.post, endPoints.login, {
            email: payload.email,
            senha: payload.senha
        });

        yield put(actions.loginSuccess({ ...data }));
        axiosService.defaults.headers.Authorization = `Bearer ${data.token}`;
    } catch (e) {
        console.log(e);
        yield put(actions.loginFailure({}));
    }
}

function* updateRequest({ payload }: PayloadAction<UpdatePayload>): SagaIterator {
    let { id, nome, email, senha, trocouEmail, foto } = payload;
    senha = senha || undefined;

    try {
        const responseData = yield call(
            axiosService.put,
            endPoints.editarUsuario,
            { id, nome, email, senha, foto }
        );

        yield put(actions.updateSuccess({
            user: { ...responseData.data.user },
            update: responseData.data.updated
        }));

        if (trocouEmail) {
            yield put(actions.loginFailure({}));
        }
    } catch (e: any) {
        console.log(e);
        console.log(e.response?.data);
        yield put(actions.updateFailure({}));
    }
}

export default all([
    takeLatest(types.LOGIN_REQUEST, loginRequest),
    takeLatest(types.REGISTER_REQUEST, registerRequest),
    takeLatest(types.UPDATE_REQUEST, updateRequest),
]);