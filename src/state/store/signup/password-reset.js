import { action, makeObservable } from "mobx";
import BaseStore from "../base";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { ShowError, ShowSuccess } from "../../../components/Common";
import { CONTACT_ADMIN_MESSAGE, FORGOT_PASSWORD_SUCCESS } from "../../../constants";

const STAGGER_ID = uuid();

export class ResetPasswordStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            forgotPassword: action,
            resetPassword: action,
            changePassword: action,
            setLoading: action,
        });
    }

    observable() {
        return {
            loading: false,
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    async forgotPassword(email) {
        this.setLoading(true);
        try {
            let { data } = await http
                .post(`users/forgot-password`, { userID: email })
                .stagger(STAGGER_ID);
            const result = data?.errorDetails;
            if (result?.errorCode === 0) {
                const errorDescToShow = result?.errorDesc || FORGOT_PASSWORD_SUCCESS;
                ShowSuccess(errorDescToShow);
                return { success: true, message: errorDescToShow };
            }
            return { success: false, message: result?.errorDesc || CONTACT_ADMIN_MESSAGE };
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                const errorDescToShow = error?.errorDesc || CONTACT_ADMIN_MESSAGE;
                ShowError(errorDescToShow);
                return {
                    success: false,
                    message: errorDescToShow,
                };
            }
        } finally {
            this.setLoading(false);
        }
        return {
            success: false,
            message: CONTACT_ADMIN_MESSAGE,
        };
    }

    async resetPassword(password, queryString) {
        try {
            this.setLoading(true);

            let { data } = await http
                .put(`users/reset-password${queryString}`, password)
                .stagger(STAGGER_ID);
            const details = data?.errorDetails;
            return details.errorDesc || "Password Reset Successful";
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    async changePassword(payload) {
        this.setLoading(true);

        try {
            let { data } = await http.put(`users/change-password`, payload).stagger(STAGGER_ID);
            return data;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            const message = "Password Updated Failed";

            ShowError(error?.errorDesc ?? message);
            this.loggedIn = false;
        } finally {
            this.setLoading(false);
        }
    }
}

export default new ResetPasswordStore();
