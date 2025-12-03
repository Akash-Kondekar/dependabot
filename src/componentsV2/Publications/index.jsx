import React from "react";
import { observer } from "mobx-react";
import publications from "../../state/store/publications";
import { Grid2 as Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { DExtERFullLogo } from "../../utils";
import { Link } from "react-router-dom";
import { NoData } from "../../components/Common";

const localStyles = {
    messages: {
        overflow: "auto",
        maxHeight: "600px",
        padding: "10px",
        margin: "10px",
        marginBottom: "50px",
    },
};

export const Publications = observer(() => {
    React.useEffect(() => {
        publications.load();
    }, []);

    return (
        <>
            <Link to="/login">
                <div style={{ textAlign: "center", cursor: "pointer" }}>
                    <DExtERFullLogo />
                </div>
            </Link>
            <ShowPublications />
        </>
    );
});

const ShowPublications = observer(() => {
    return publications.list.length === 0 ? (
        <>
            <NoData message="No Publications Found" />
        </>
    ) : (
        <>
            <div>
                <Container sx={{ marginBottom: "5%" }}>
                    <Grid container>
                        <Grid>
                            <Typography
                                variant="h3"
                                sx={{
                                    marginTop: "20px",
                                    margin: "10px",
                                    padding: "10px",
                                }}
                            >
                                Publications
                            </Typography>
                        </Grid>
                        <Grid>
                            {Object.keys(publications.list).map((item, index) => {
                                const publication = publications.list[item];
                                return (
                                    <div style={localStyles.messages} key={index}>
                                        {publication.pmID ? (
                                            <a
                                                href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmID}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: "none" }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        wordWrap: "break-word",
                                                        marginBottom: "5px",
                                                        color: theme => theme.palette.primary.main,
                                                    }}
                                                >
                                                    {publication.title}
                                                </Typography>
                                            </a>
                                        ) : (
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    wordWrap: "break-word",
                                                    marginBottom: "5px",
                                                    color: theme => theme.palette.primary.main,
                                                }}
                                            >
                                                {publication.title}
                                            </Typography>
                                        )}
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                wordWrap: "break-word",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            {publication.authors}
                                        </Typography>
                                        {publication.pmID && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    display: "inline-block",
                                                }}
                                                color="success"
                                            >
                                                {`PMID: ${publication.pmID}`}
                                            </Typography>
                                        )}
                                        {publication.pmcID && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    display: "inline-block",
                                                }}
                                                color="success"
                                            >
                                                {`PMCID: ${publication.pmcID}`}
                                            </Typography>
                                        )}
                                        {publication.doi && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    display: "inline-block",
                                                    marginLeft: "20px",
                                                }}
                                                color="success"
                                            >
                                                DOI:{" "}
                                                <a
                                                    href={`https://doi.org/${publication.doi}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    {publication.doi}
                                                </a>
                                            </Typography>
                                        )}

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                display: "inline-block",
                                            }}
                                            color="success"
                                        >
                                            {publication.journalName}
                                        </Typography>
                                        <hr></hr>
                                    </div>
                                );
                            })}
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </>
    );
});
