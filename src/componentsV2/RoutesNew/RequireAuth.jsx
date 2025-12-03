import React from "react";
import { Navigate } from "react-router-dom";
import session from "../../state/store/session";
import { observer } from "mobx-react";
import { localStore } from "../../lib/storage";
import CookiePolicy from "../TermsAndConditions/Policy";

export const RequireAuth = observer(({ children }) => {
    const authParams = localStore.get("auth.token") && localStore.get("user");
    const { isTermsAccepted, loggedIn } = session;

    if (!authParams) {
        //Clear project details if user is on projects details page and session is not valid
        return <Navigate to="/login" replace />;
    }

    if (!session.checked) {
        if (!session.loading) {
            session.check();
        }
        return "Loading...";
    }

    if (!loggedIn) {
        session.removeTokenFromStore();
        //Clear project details if user is on projects details page and session is not valid
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isTermsAccepted) {
        return <CookiePolicy />;
    }

    return <>{children}</>;
});
