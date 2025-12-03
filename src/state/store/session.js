import { action, computed, makeObservable, observable } from "mobx";
import http from "../../lib/http";
import events from "../../lib/events";
import { localStore } from "../../lib/storage";
import { ws } from "../../lib/socket";
import BaseStore from "./base";
import User from "../model/user";
import { ShowError, ShowSuccess } from "../../components/Common";
import {
    CONTACT_ADMIN_MESSAGE,
    MFA_STATE,
    SYSTEM_ROLE,
    QR_RESET_SUCCESS_MSG,
} from "../../constants/index";

const anonymous = new User({
    name: "Anonymous",
    roles: ["anonymous"],
});

export const PENDING_USER_MESSAGE = "Your account is pending approval, Please check back later.";

export class Session extends BaseStore {
    constructor() {
        super();

        this.signOut = false;

        this.redirect = this.redirect ?? null;
        this.loading = this.loading ?? false;

        this.checked = this.checked ?? false;
        this.loggedIn = this.loggedIn ?? false;

        this.user = this.user ?? anonymous;

        this.projectUpdateTopicId = null;

        makeObservable(this, {
            // redirect: observable,
            // loading: observable,

            // checked: observable,
            // loggedIn: observable,
            // user: observable,
            signOut: observable,

            check: action,
            login: action,
            logout: action,
            autoLogin: action,
            loggedInUser: computed,
            loggedInUserSystemRole: computed,
            loggedInUserFullName: computed,
            loggedInUserRole: computed,
            isUser: computed,
            isAdmin: computed,
            setSignOut: action,
            setChecked: action,
            setLoading: action,
            setUser: action,
            setLoggedIn: action,
            setRedirect: action,
            setDrawerStatus: action,
            isTermsAccepted: computed,
            acceptTerms: action,
            hasCodeBuilderAccess: computed,
            hasStudyDownloadAccess: computed,
            token: computed,
        });

        //handle auth events
        events.on("auth.login", this.wsOpen.bind(this));
        events.on("auth.logout", this.wsClose.bind(this));
    }

    setSignOut(value) {
        this.signOut = value;
    }

    setChecked(value) {
        this.checked = value;
    }

    setLoading(value) {
        this.loading = value;
    }

    setLoggedIn(value) {
        this.loggedIn = value;
    }

    setUser(value) {
        this.user = value;
    }
    setRedirect(value) {
        this.redirect = value;
    }

    setDrawerStatus(status) {
        this.open = status;
    }

    observable() {
        return {
            data: [],
            redirect: null,
            loading: false,
            checked: false,
            loggedIn: false,
            user: anonymous,
            open: true,
        };
    }

    // perform session check against the backend and set the checked flag to store.
    async check() {
        this.setLoading(true);

        try {
            let { data } = await http.post("/profile");

            const response = data.data;
            this.setUser(new User(response));
            this.setLoggedIn(true);
            this.setChecked(true);

            events.emit("auth.login", this.user);
        } catch (error) {
            this.setLoggedIn(false);
            this.setChecked(false);

            //TODO: Test this code.
            if (error.status === 401) {
                await this.autoLogin();
            } else {
                this.removeTokenFromStore(); // This will ensure system will log out and show login screen.
            }
        } finally {
            this.setLoading(false);
        }
    }

    async login(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post("/signin", args, {
                withCredentials: true,
            });

            const response = data.data;

            const mfaStatus = {
                needMFA: false,
                error: false,
                registerQR: false,
                staleUser: false,
                pendingFirstVerification: false,
                pendingUser: false,
            };

            switch (response.mfaState) {
                case MFA_STATE.FIRST_VALIDATION_PENDING:
                    mfaStatus.needMFA = true;
                    mfaStatus.pendingFirstVerification = true;
                    break;

                case MFA_STATE.VALIDATION_PENDING:
                    mfaStatus.needMFA = true;
                    break;

                case MFA_STATE.STALE_USER:
                    mfaStatus.staleUser = true;
                    break;

                case MFA_STATE.NOT_REGISTERED:
                    mfaStatus.registerQR = true;
                    break;

                default:
                    mfaStatus.error = false;
                    this.loginSuccessful(response, args);
            }
            return mfaStatus;
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;

                if (error?.errorDesc === PENDING_USER_MESSAGE) {
                    return {
                        needMFA: null,
                        error: true,
                        registerQR: null,
                        staleUser: false,
                        pendingFirstVerification: null,
                        pendingUser: true,
                    };
                }

                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
            this.setLoggedIn(false);
            return {
                needMFA: null,
                error: true,
                registerQR: null,
                pendingUser: false,
            };
        } finally {
            this.setLoading(false);
        }
    }

    loginSuccessful(response, args) {
        this.setUser(new User(response));
        this.setLoggedIn(true);
        this.setChecked(true);

        //save the auth token.
        if (args.remember || response.token) {
            localStore.set("auth.token", response.token);
            localStore.set("user", response.userId.toLowerCase());
            localStore.set("type", response.type);
            localStore.set("auth.refreshToken", response.refreshToken);
        }
        events.emit("auth.login", this.user);
    }

    async resendOTP(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post("/auth/mfa/resend-via-email", args, {
                withCredentials: true,
            });

            const response = data.data;

            if (response.mfaState) {
                ShowSuccess("New OTP sent to your email.");
            }
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;
                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
        } finally {
            this.setLoading(false);
        }
    }

    async validateQRCode(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post("/auth/mfa/validate-qr-code", args, {
                withCredentials: true,
            });

            const response = data.data;

            const mfaStatus = {
                MFAFailed: true,
                error: false,
            };

            this.loginSuccessful(response, args);
            mfaStatus.MFAFailed = false;

            return mfaStatus;
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;
                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
            return {
                MFAFailed: true,
                error: true,
            };
        } finally {
            this.setLoading(false);
        }
    }

    async generateQRCode(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post("/auth/mfa/generate-qr-code", args, {
                withCredentials: true,
            });

            const response = data.data;

            if (response) {
                return response;
            } else {
                ShowError(CONTACT_ADMIN_MESSAGE);
            }
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;
                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
        } finally {
            this.setLoading(false);
        }
    }

    async resetQRCode(email) {
        this.setLoading(true);
        try {
            const { data } = await http.post(`/reset-qr-code`, { userID: email });
            const result = data?.errorDetails;
            if (result?.errorCode === 0) {
                const errorDescToShow = result?.errorDesc || QR_RESET_SUCCESS_MSG;
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

    async verifyEmailForChangingQR(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post(
                `/verify-qr-code-change?token=${args.token}`,
                {},
                {
                    withCredentials: true,
                }
            );

            return data.data;
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;
                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
            return null;
        } finally {
            this.setLoading(false);
        }
    }

    async verifyOTP(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post("/auth/mfa/validate", args, {
                withCredentials: true,
            });

            const response = data.data;

            this.setUser(new User(response));
            this.setLoggedIn(true);
            this.setChecked(true);

            //save the auth token.
            if (args.remember || response.token) {
                localStore.set("auth.token", response.token);
                localStore.set("user", response.userId.toLowerCase());
                localStore.set("type", response.type);
                localStore.set("auth.refreshToken", response.refreshToken);
            }
            events.emit("auth.login", this.user);
            return true;
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;
                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
            this.setLoggedIn(false);
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async verifyEmailOfStaleUser(args) {
        try {
            this.setLoading(true);
            const { data = {} } = await http.post(
                `/auth/verify-stale-email?&userId=${args.userId}&token=${args.token}`,
                {},
                {
                    withCredentials: true,
                }
            );

            return data.data;
        } catch (ex) {
            if (ex.response?.data === undefined) {
                ShowError(CONTACT_ADMIN_MESSAGE);
            } else {
                const error = ex.response?.data?.errorDetails;
                if (error?.errorCode !== 0) {
                    ShowError(error?.errorDesc);
                }
            }
            return null;
        } finally {
            this.setLoading(false);
        }
    }

    async autoLogin() {
        let token = localStore.get("auth.token");

        if (token) {
            await this.login({ token: token });
        }
    }

    async removeTokenFromStore() {
        localStore.remove("auth.token");
        localStore.remove("user");
        localStore.remove("type");
        localStore.remove("auth.refreshToken");
        events.emit("clear.drawerStatus"); //Clear drawer status  logout.
    }

    async logout() {
        try {
            this.setLoading(true);
            await http.post("/logout");

            this.removeTokenFromStore();
            events.emit("reset.projects");
            events.emit("reset.all.job.stores");
            events.emit("auth.logout");
            this.setLoggedIn(false);
            this.setChecked(false);
            this.setSignOut(true);
            this.setUser(anonymous);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async acceptTerms() {
        this.setLoading(true);

        try {
            const { data } = await http.put("/user/terms/accept");

            if (data.data) {
                const { termsAccepted } = data.data;
                const response = { ...this.user, termsAccepted };
                this.setUser(new User(response));

                return true;
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    get loggedInUser() {
        return this.user.userId?.toLowerCase();
    }

    get loggedInUserFullName() {
        return this.user.userFullName;
    }

    get loggedInUserRole() {
        if (typeof this.user?.role === "string") {
            return parseInt(this.user?.role);
        }
        return this.user?.role;
    }

    get loggedInUserSystemRole() {
        return this.user.roleDescription;
    }

    get isUser() {
        return this.loggedInUserRole === SYSTEM_ROLE.USER;
    }

    get isModerator() {
        return this.loggedInUserRole === SYSTEM_ROLE.MODERATOR;
    }

    get isAdmin() {
        return this.loggedInUserRole === SYSTEM_ROLE.ADMIN;
    }

    get isTermsAccepted() {
        return this.user?.termsAccepted !== undefined && this.user?.termsAccepted;
    }

    get hasCodeBuilderAccess() {
        return this.user?.codeBuilderAccess ?? false;
    }

    get hasStudyDownloadAccess() {
        return this.user?.studyDownloadAccess ?? false;
    }

    get token() {
        return this.user?.token ?? null; // only the JWT
    }

    get bearerToken() {
        const token = localStore.get("auth.token");
        const type = localStore.get("type");
        return token && type ? `${type} ${token}` : null;
    }

    wsOpen() {
        let url = import.meta.env.VITE_APP_WS_VIP;
        ws.connect(url);
    }

    wsClose() {
        ws.disconnect();
    }

    subscribeToProjectUpdates(projectID) {
        if (!this.projectUpdateTopicId) {
            this.projectUpdateTopicId = projectID;
            if (ws.socket && ws.socket.active && ws.socket.connected) {
                ws.socket.subscribe(
                    "/topic/projectupdate/" + projectID,
                    function (data) {
                        const enabled = data.body === "true";
                        if (enabled) {
                            events.emit("update.project", projectID);
                        }
                    },
                    { id: "/topic/projectupdate/" + projectID }
                );
            }
        }
    }

    unsubscribeFromProjectUpdates(projectID) {
        if (ws.socket && ws.socket.active && ws.socket.connected) {
            ws.socket.unsubscribe("/topic/projectupdate/" + projectID);
        }
        this.projectUpdateTopicId = null;
    }

    async isTokenExpired() {
        try {
            const { data } = await http.get("/auth/verify-token");
            if (data.data) {
                return false;
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error.status === 401) {
                await this.autoLogin();
            } else {
                await this.removeTokenFromStore(); // This will ensure system will log out and show login screen.
            }
            return true;
        }
    }
}

export default new Session();
