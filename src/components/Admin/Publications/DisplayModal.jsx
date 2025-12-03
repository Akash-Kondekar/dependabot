import React from "react";
import { Divider, Grid2 as Grid, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useStyles } from "./../../useStyles";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";

import { BasicButton } from "../../Common";

import { CONFIRM_ADD_PUBLICATION } from "../../../constants/index";

export const DisplayModal = ({ articleData, inputArticleId, open, handleClose, handleSave }) => {
    const handleYes = () => {
        handleClose();
        handleSave();
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="md"
            >
                <DialogTitle id="alert-dialog-title">{CONFIRM_ADD_PUBLICATION}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <DisplayModalConfirmation
                            inputArticleId={inputArticleId}
                            title={articleData.title}
                            authors={articleData.authors}
                            journalName={articleData.journalName}
                            publicationDate={articleData.publicationDate}
                            doi={articleData.doi}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <BasicButton buttonText="Yes" handleClick={handleYes} />
                    <BasicButton buttonText="No" handleClick={handleClose} color="secondary" />
                </DialogActions>
            </Dialog>
        </div>
    );
};
export const DisplayModalConfirmation = ({
    inputArticleId,
    title,
    authors,
    journalName,
    publicationDate,
    doi,
}) => {
    const classes = useStyles();
    return (
        <Container component="main">
            <CssBaseline />
            <div className={classes.paper}>
                <Divider />
                <Grid container>
                    <Grid size="grow">
                        <Typography component="div" variant="h7" style={{ margin: "10px" }}>
                            Article Identifier:<b> {inputArticleId}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container>
                    <Grid size="grow">
                        <Typography component="div" variant="h7" style={{ margin: "10px" }}>
                            Title --<b> {title}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container>
                    <Grid size="grow">
                        <Typography component="div" variant="h7" style={{ margin: "10px" }}>
                            Authors:<b>{authors}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container>
                    <Grid size="grow">
                        <Typography component="div" variant="h7" style={{ margin: "10px" }}>
                            Journal: <b>{journalName}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container>
                    <Grid size="grow">
                        <Typography component="div" variant="h7" style={{ margin: "10px" }}>
                            Publication Date: <b>{publicationDate}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container>
                    <Grid size="grow">
                        <Typography component="div" variant="h7" style={{ margin: "10px" }}>
                            DOI: <b>{doi}</b>
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
            </div>
        </Container>
    );
};
