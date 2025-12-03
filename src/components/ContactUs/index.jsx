import React from "react";
import { Avatar, IconButton, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Copy } from "../Common";
import { Email } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles(theme => ({
    root: {
        color: "white",
        textDecoration: "underline",
        textTransform: "capitalize",
        fontSize: "16px",
        fontWeight: "normal",
        marginTop: "2px",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    image: {
        display: "block",
        padding: "5px",
        margin: "auto",
        maxWidth: "100%",
        maxHeight: "120px",
    },
    contactUsButton: {
        fontSize: "16px",
        fontWeight: "200",
        textDecoration: "none",
        cursor: "pointer",
        color: theme.palette.mode === "dark" ? "LightBlue" : "black",
        paddingTop: "3px",
    },
}));

const ContactUs = () => {
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();
    const emailID = import.meta.env.VITE_APP_CONTACT_US;

    return (
        <div>
            <Typography
                variant="h6"
                className={classes.contactUsButton}
                onClick={() => setOpen(true)}
            >
                Contact Us
            </Typography>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="Contact-Us"
                aria-describedby="Contact-Us"
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        backgroundColor: theme => theme.palette.primary.main,
                        color: theme => theme.palette.primary.contrastText,
                    }}
                >
                    <Typography
                        id="Contact-Us-Header"
                        variant="h5"
                        component="h2"
                        sx={{
                            textAlign: "center",
                            p: 1,
                            paddingLeft: "15px",
                            borderRadius: "10px 10px 0px 0px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span> Contact Us</span>
                            <IconButton
                                aria-label="close"
                                size="small"
                                sx={{ color: theme => theme.palette.primary.contrastText }}
                                onClick={() => setOpen(false)}
                            >
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography
                        id="Contact-Us-Info-Section"
                        component="div"
                        sx={{ padding: "30px 20px 30px 25px" }}
                    >
                        <div>
                            <Typography
                                id="Contact-Us-Detailed-Info-Card"
                                variant="h5"
                                component="h1"
                                sx={{ fontWeight: "500" }}
                            >
                                Need Support?
                            </Typography>
                        </div>
                        <div>
                            <p style={{ color: "#a7a5a5", fontSize: "16px" }}>
                                Feel free to contact us any time. We will get back to you as soon as
                                we can
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar className={classes.avatar}>
                                <Email />
                            </Avatar>
                            <Typography
                                variant="h6"
                                component="h2"
                                sx={{ marginLeft: "10px", marginRight: "10px" }}
                            >
                                {emailID}
                            </Typography>
                            <Copy text={emailID} icon={true} />
                        </div>
                    </Typography>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContactUs;
