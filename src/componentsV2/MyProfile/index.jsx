import React from "react";
import { observer } from "mobx-react";
import { AUTHENTICATION_TOKEN_LABEL } from "../../constants";
import MyProfile from "./MyProfile";
import ResetMFA from "./ResetMFA";
import ChangePassword from "./ChangePassword";
import RoundTab from "../Common/RoundTab";

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    };
}

const Profile = observer(() => {
    const TAB = [
        {
            label: "My Profile",
            a11yProps: a11yProps(0),
        },
        {
            label: "Change Password",
            a11yProps: a11yProps(1),
        },
        {
            label: `Reset ${AUTHENTICATION_TOKEN_LABEL}`,
            a11yProps: a11yProps(2),
        },
    ];

    const TAB_PANEL = [
        {
            key: "my-profile-tabpanel-0",
            content: <MyProfile />,
        },
        {
            key: "my-profile-tabpanel-1",
            content: <ChangePassword />,
        },
        {
            key: "my-profile-tabpanel-2",
            content: <ResetMFA />,
        },
    ];

    return (
        <>
            <RoundTab ACTIVE_TAB={0} TAB={TAB} TAB_PANEL={TAB_PANEL} aria-label="my profile tab" />
        </>
    );
});

export default Profile;
