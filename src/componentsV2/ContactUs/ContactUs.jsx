import React from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { Copy } from "../Common/Clipboard.jsx";
import { EmailOutlined } from "@mui/icons-material";
import { DialogBox } from "../Common/DialogBox";
import "../Styles/styles.css";

const ContactUs = () => {
    const [open, setOpen] = React.useState(false);
    const emailID = import.meta.env.VITE_APP_CONTACT_US;

    const DialogBoxContent = (
        <Typography
            id="Contact-Us-Info-Section"
            component="div"
            sx={{ padding: "30px 20px 30px 25px" }}
        >
            <div>
                <Typography
                    id="Contact-Us-Detailed-Info-Card"
                    variant="h5"
                    textAlign="center"
                    sx={{ fontWeight: 600 }}
                >
                    Need Support?
                </Typography>
            </div>
            <br />
            <div>
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                    Feel free to contact us any time. We will get back to you as soon as we can
                </Typography>
            </div>
            <br />
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Paper
                    sx={{
                        borderColor: theme => theme.palette.grey[200],
                    }}
                    className="contactUsEmail"
                >
                    <EmailOutlined />
                    <Typography
                        variant="body1"
                        component="span"
                        sx={{ marginLeft: "10px", marginRight: "10px", fontSize: "17px" }}
                    >
                        {emailID}
                    </Typography>
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <Copy text={emailID} icon={true} fontSize="medium" color="primary.light" />
                </Paper>
            </div>
        </Typography>
    );

    return (
        <>
            <Typography
                variant="subtitle1"
                onClick={() => setOpen(true)}
                className="contactUs"
                sx={{ color: theme => theme.palette.grey[200].contrastText }}
                component="div"
            >
                <span>Contact Us</span>
            </Typography>

            <DialogBox
                open={open}
                handleClose={() => setOpen(false)}
                title="Contact Us"
                Content={DialogBoxContent}
            />
        </>
    );
};

export default ContactUs;
