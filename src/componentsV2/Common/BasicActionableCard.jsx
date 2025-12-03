import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
export const BasicActionableCard = ({
    handleOnClick,
    cardContent,
    style,
    actions,
    imageSrc = "",
    imageText = "",
    cardMedia = false,
    cardActions = false,
    ...props
}) => {
    return (
        <Card
            sx={{
                minWidth: "350px",
                maxWidth: "350px",
                borderRadius: "10px",
                ...style,
            }}
            {...props}
        >
            <CardActionArea onClick={handleOnClick} sx={{ height: "100%" }} component="div">
                {cardMedia && (
                    <CardMedia component="img" height="140" image={imageSrc} alt={imageText} />
                )}
                <CardContent>{cardContent}</CardContent>
            </CardActionArea>
            {cardActions && (
                <>
                    <Divider />
                    <CardActions>{actions}</CardActions>
                </>
            )}
        </Card>
    );
};
