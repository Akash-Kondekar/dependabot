import React from "react";
import { observer } from "mobx-react";
import makeStyles from "@mui/styles/makeStyles";
import publications from "../../state/store/publications";
import { Grid2 as Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { Footer } from "../Footer";
import { DExtERFullLogo } from "../../utils";
import { Link } from "react-router-dom";
import { NoData } from "../Common";

const useLocalStyles = makeStyles(theme => ({
    container: {
        width: "500px",
        maxWidth: "700px",
        padding: "10px",
        margin: "0 auto",
    },
    message: {
        marginTop: "10px",
    },
    subText: {
        marginTop: "10px",
        marginBottom: "10px",
    },
    header: {
        marginTop: "20px",
        margin: "10px",
        padding: "10px",
        fontSize: "2.8rem",
    },
    subHeader: {
        textDecoration: "none",
        textAlign: "left",
    },
    link: {
        textDecoration: "none",
    },
    root: {
        margin: "20px",
        backgroundColor: theme.palette.background.paper,
        overflowY: "scroll",
        height: "80vh",
    },
    messages: {
        overflow: "auto",
        maxHeight: "600px",
        padding: "10px",
        margin: "10px",
        marginBottom: "50px",
    },
    inline: {
        display: "inline",
        marginLeft: "20px",
        marginTop: "5px",
    },
    title: {
        fontSize: "1.2rem",
        color: "#0071bc",
        lineHeight: "1.6rem",
        wordWrap: "break-word",
        textDecoration: "none",
        marginBottom: "10px",
    },
    authors: {
        fontSize: "1.1rem",
        color: "#212121",
        wordWrap: "break-word",
        marginBottom: "5px",
    },
    pmID: {
        display: "inline-block",
        marginRight: "20px",
        color: "#4D8055",
        fontSize: "0.9rem",
        lineHeight: "1rem",
    },
    pmcID: {
        display: "inline-block",
        color: "#4D8055",
        fontSize: "0.9rem",
        lineHeight: "1rem",
    },
    doi: {
        display: "inline-block",
        color: "#4D8055",
        fontSize: "0.9rem",
        lineHeight: "1rem",
        marginLeft: "20px",
    },
    journal: {
        color: "#4D8055",
        fontSize: "0.9rem",
        lineHeight: "1rem",
    },
    image: {
        display: "block",
        padding: "5px",
        margin: "auto",
        maxWidth: "100%",
        maxHeight: " 120px",
        width: "30%",
    },
}));

export const Publications = observer(() => {
    React.useEffect(() => {
        publications.load();
    }, []);

    return (
        <>
            <Link to="/login">
                <div style={{ textAlign: "center" }}>
                    <DExtERFullLogo />
                </div>
            </Link>
            <ShowPublications />
        </>
    );
});

const ShowPublications = observer(() => {
    const classes = useLocalStyles();

    return publications.list.length === 0 ? (
        <>
            <NoData message="No Publications Found" />
        </>
    ) : (
        <>
            <div>
                <Container>
                    <Grid container>
                        <Grid>
                            <Typography variant="h3" className={classes.header}>
                                Publications
                            </Typography>
                        </Grid>
                        <Grid>
                            {Object.keys(publications.list).map((item, index) => {
                                const publication = publications.list[item];
                                return (
                                    <div className={classes.messages} key={index}>
                                        {publication.pmID ? (
                                            <a
                                                href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmID}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={classes.link}
                                            >
                                                <div className={classes.title}>
                                                    {publication.title}
                                                </div>
                                            </a>
                                        ) : (
                                            <div className={classes.title}>{publication.title}</div>
                                        )}
                                        <div className={classes.authors}>{publication.authors}</div>
                                        {publication.pmID && (
                                            <div
                                                className={classes.pmID}
                                            >{`PMID: ${publication.pmID}`}</div>
                                        )}
                                        {publication.pmcID && (
                                            <div
                                                className={classes.pmcID}
                                            >{`PMCID: ${publication.pmcID}`}</div>
                                        )}
                                        {publication.doi && (
                                            <div className={classes.doi}>
                                                DOI:{" "}
                                                <a
                                                    href={`https://doi.org/${publication.doi}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={classes.link}
                                                >
                                                    {publication.doi}
                                                </a>
                                            </div>
                                        )}

                                        <div className={classes.journal}>
                                            {publication.journalName}
                                        </div>
                                        <hr></hr>
                                    </div>
                                );
                            })}
                        </Grid>
                    </Grid>
                </Container>
            </div>

            <Footer />
        </>
    );
});
