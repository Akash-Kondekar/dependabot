import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function ClickableCard({ title, content, onClick, titleVariant = "h4" }) {
    return (
        <Card>
            <CardActionArea onClick={onClick}>
                <CardContent>
                    {title && (
                        <Typography gutterBottom variant={titleVariant} component="div">
                            {title}
                        </Typography>
                    )}
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        {content}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
