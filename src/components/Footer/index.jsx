import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Grid2 as Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import ContactUs from "../ContactUs";
import { POLICY } from "../../constants";

const useStyles = makeStyles(theme => ({
    footerBox: {
        padding: "10px",
        paddingRight: "30px",
        paddingLeft: "30px",
        position: "fixed",
        bottom: "0",
        width: "-webkit-fill-available",
        marginTop: "40px",
        backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
    },
    footerItems: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        "& a": {
            fontSize: "16px",
            fontWeight: "200",
            textDecoration: "none",
            marginRight: "25px",
            color: theme.palette.mode === "dark" ? "LightBlue" : "black",
        },
        "& a:hover": {
            textDecoration: "underline",
            textUnderlineOffset: "4px",
        },
    },
    footerCopyright: {
        "& h6": {
            fontSize: "16px",
            fontWeight: "100",
            textAlign: "end",
            color: theme.palette.mode === "dark" ? "LightBlue" : "black",
        },
    },

    MuiTypography: {
        defaultProps: {
            variantMapping: {
                paragraph: "span",
            },
        },
    },
}));

const currentYear = new Date().getFullYear();

export const Footer = () => {
    const classes = useStyles();

    return (
        <>
            <div className={classes.footerBox}>
                <Grid container spacing={4}>
                    <Grid size={8}>
                        <div className={classes.footerItems}>
                            <Typography variant="h6">
                                <Link to={`/policies?res=${POLICY.PRIVACY}`}>Privacy Policy</Link>
                            </Typography>
                            <Typography variant="h6">
                                <Link to={`/policies?res=${POLICY.COOKIE}`}>Cookie Policy</Link>
                            </Typography>
                            <ContactUs />
                        </div>
                    </Grid>
                    <Grid size={4}>
                        <div className={classes.footerCopyright}>
                            <Typography variant="h6">© Dexter {currentYear}</Typography>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};
