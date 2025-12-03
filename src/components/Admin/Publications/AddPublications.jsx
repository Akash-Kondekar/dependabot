import React from "react";
import { useStyles } from "../../useStyles";
import Avatar from "@mui/material/Avatar";
import { DisplayModal } from "./DisplayModal";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LaunchIcon from "@mui/icons-material/Launch";

import { CardHeader, Input, Radiogroup } from "../../Common";

import { Button, Container, CssBaseline } from "@mui/material";
import {
    ADD_ARTICLE_HEADING,
    ARTICLE_IDENTIFIER_INPUT_PLACEHOLDER,
    FETCH_ARTICLE_BUTTON,
    PMID,
    PUBMED,
    PUBMED_WEBSITE,
    radioOptionsAdminPublication,
} from "../../../constants/index";
import { PUBMED_URL } from "../../../config/index";
import { formatDate } from "../../../utils";
import { ShowError, ShowWarning } from "../../../componentsV2/Common/Toast";

export const AddPublications = ({ addNewPublications, IsArticleAlreadyPresent }) => {
    const [open, setOpen] = React.useState(false);
    const [articleId, setArticleID] = React.useState(3531190);
    const [articleType, setArticleType] = React.useState(PMID);
    const [articleData, setArticleData] = React.useState([]);
    const [buttonName, setButtonName] = React.useState(FETCH_ARTICLE_BUTTON);

    const handleChange = event => {
        setArticleType(event.target.value);
    };

    const handleClickOpen = e => {
        e.preventDefault();

        const convertedArticleType = articleType === "pubmed" ? "pmID" : "pmcID";

        if (IsArticleAlreadyPresent(articleId, convertedArticleType) === true) {
            ShowWarning("This article is already present");
            return;
        } else {
            setButtonName("Loading");
            fetch(PUBMED_URL + articleId + "&db=" + articleType)
                .then(resp => resp.json())
                .then(data => {
                    if (data && data.result && Object.keys(data.result).length >= 2) {
                        // If result is there, then it will have 2 Keys=["header", "result"]
                        const articleDetails = data.result[articleId];
                        const journalName = data.result[articleId].fulljournalname;

                        const { title, authors, sortpubdate, articleids, elocationid } =
                            articleDetails;

                        let pmID = "",
                            pmcID = "";

                        const authorNames = authors.map(author => author.name).join(",");

                        const doi = elocationid;

                        articleids.forEach(id => {
                            if (id.idtype === "pubmed") pmID = id.value;
                            if (id.idtype === "pmcid") pmcID = id.value;
                        });

                        const payload = {
                            title,
                            authors: authorNames,
                            publicationDate: formatDate(new Date(sortpubdate), "yyyy-MM-dd"), //Date is stored as yyyy-MM-dd format in the publications table and hence formatting it.
                            doi,
                            pmID,
                            pmcID,
                            journalName,
                        };
                        setButtonName(FETCH_ARTICLE_BUTTON);
                        setArticleData(payload);
                        setOpen(true);
                    } else {
                        ShowError(
                            "An error occurred while fetching data from PubMed. Pls contact Admin"
                        );
                    }
                })
                .catch(() => {
                    ShowError(
                        "An error occurred while fetching data from PubMed. Pls contact Admin"
                    );
                });
        }
    };

    const handleClose = () => {
        setArticleData([]);
        setOpen(false);
    };

    const classes = useStyles();
    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                className={classes.button}
                endIcon={<LaunchIcon></LaunchIcon>}
                href={PUBMED_WEBSITE}
                target="_blank"
            >
                {PUBMED}
            </Button>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paperForPublications}>
                    <Avatar className={classes.avatar}>
                        <LocalLibraryIcon />
                    </Avatar>
                    <CardHeader title={ADD_ARTICLE_HEADING} />
                    <form className={classes.form}>
                        <Radiogroup
                            value={articleType}
                            handleChange={handleChange}
                            radioOptions={radioOptionsAdminPublication}
                        />
                        <Input
                            name={ARTICLE_IDENTIFIER_INPUT_PLACEHOLDER}
                            helperText="Enter Only Numbers"
                            type="number"
                            autoFocus
                            value={articleId}
                            onChange={e => setArticleID(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleClickOpen}
                            className={classes.submit}
                        >
                            {buttonName}
                        </Button>
                        {open && (
                            <DisplayModal
                                inputArticleId={articleId}
                                articleData={articleData}
                                open={open}
                                handleClickOpen={handleClickOpen}
                                handleClose={handleClose}
                                handleSave={() => addNewPublications(articleData)}
                            />
                        )}
                    </form>
                </div>
            </Container>
        </div>
    );
};
