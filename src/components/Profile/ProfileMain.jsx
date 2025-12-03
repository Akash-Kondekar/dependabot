// import React from "react";
// export const Profile = () => <div>Hello, From Profile</div>;

import React from "react";
import PropTypes from "prop-types";
import { AppBar, Box, Tab, Tabs } from "@mui/material";
import FaceIcon from "@mui/icons-material/Face";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { MyProfile } from "./MyProfile";
import { ChangePassword } from "./ChangePassword";
import { ResetQRCode } from "./ResetQR";
import { observer } from "mobx-react";
import { AUTHENTICATION_TOKEN_LABEL } from "../../constants";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    };
}

const Profile = observer(() => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <AppBar
                sx={{ backgroundColor: "background.paper" }}
                position="static"
                enableColorOnDark
            >
                <Tabs
                    value={value}
                    centered
                    onChange={handleChange}
                    //   variant="scrollable"
                    aria-label="scrollable force tabs example"
                    allowScrollButtonsMobile
                >
                    <Tab label="My Profile" icon={<FaceIcon />} {...a11yProps(0)} />
                    <Tab label="Change Password" icon={<VpnKeyIcon />} {...a11yProps(1)} />
                    <Tab
                        label={`Reset ${AUTHENTICATION_TOKEN_LABEL}`}
                        icon={<VpnKeyIcon />}
                        {...a11yProps(2)}
                        sx={{ maxWidth: "400px" }}
                    />
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <MyProfile />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ChangePassword />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <ResetQRCode />
            </TabPanel>
        </>
    );
});

export default Profile;
