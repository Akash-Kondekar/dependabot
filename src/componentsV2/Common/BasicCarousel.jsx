import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { useTheme } from "@mui/material/styles";

import { IconButton } from "@mui/material";

import Box from "@mui/material/Box";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const BasicCarousel = ({ title, content, data, ref }) => {
    // State for navigation button management
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);
    const [cardWidth, setCardWidth] = React.useState(0);

    const theme = useTheme();

    // Calculate card width and check scroll position on mount and resize
    React.useEffect(() => {
        const calculateCardProperties = () => {
            if (ref.current) {
                const container = ref.current;
                const firstCard = container.querySelector("[aria-label]");

                if (firstCard) {
                    // Get the actual card width including margin
                    const cardStyle = window.getComputedStyle(firstCard);
                    const marginRight = parseFloat(cardStyle.marginRight) || 0;
                    const width = firstCard.offsetWidth + marginRight;
                    setCardWidth(width);
                }

                checkScrollPosition();
            }
        };

        // Initial calculation
        calculateCardProperties();

        // Recalculate on window resize
        window.addEventListener("resize", calculateCardProperties);

        return () => {
            window.removeEventListener("resize", calculateCardProperties);
        };
    }, [data]);

    // Check scroll position to enable/disable navigation buttons
    const checkScrollPosition = React.useCallback(() => {
        if (ref.current) {
            const container = ref.current;
            const { scrollLeft, scrollWidth, clientWidth } = container;

            // Check if can scroll left (not at the beginning)
            setCanScrollLeft(scrollLeft > 0);

            // Check if can scroll right (not at the end)
            // Adding a small buffer (1) for rounding errors
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    }, []);

    // Add scroll event listener to update button states
    React.useEffect(() => {
        const container = ref.current;
        if (container) {
            container.addEventListener("scroll", checkScrollPosition);
            // Initial check
            checkScrollPosition();

            return () => {
                container.removeEventListener("scroll", checkScrollPosition);
            };
        }
    }, [checkScrollPosition, data]);

    const scrollLeft = () => {
        if (ref.current && cardWidth > 0) {
            const container = ref.current;
            const currentScroll = container.scrollLeft;
            const targetScroll = Math.max(0, currentScroll - cardWidth);

            container.scrollTo({
                left: targetScroll,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (ref.current && cardWidth > 0) {
            const container = ref.current;
            const currentScroll = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;
            const targetScroll = Math.min(maxScroll, currentScroll + cardWidth);

            container.scrollTo({
                left: targetScroll,
                behavior: "smooth",
            });
        }
    };

    if (!data || data.length === 0) {
        return;
    }

    return (
        <Box
            sx={{
                bgcolor: "grey.background",
                p: 2,
                borderRadius: "16px",
                mb: 2,
                mt: 2,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                <div>
                    <IconButton
                        onClick={() => scrollLeft()}
                        aria-label="Scroll Left"
                        disabled={!canScrollLeft}
                        sx={{
                            transition: "opacity 0.3s ease",
                            opacity: canScrollLeft ? 1 : 0.3,
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => scrollRight()}
                        aria-label="Scroll Right"
                        disabled={!canScrollRight}
                        sx={{
                            transition: "opacity 0.3s ease",
                            opacity: canScrollRight ? 1 : 0.3,
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </div>
            </div>

            {/* Wrapper container for fade effects */}
            <Box
                sx={{
                    position: "relative",
                    mt: 1,
                    mb: 1,
                    // Fade gradient overlays - fixed at edges
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: "30px",
                        background: canScrollLeft
                            ? `linear-gradient(to right, ${theme.palette.grey.background || theme.palette.background.default}, transparent)`
                            : "transparent",
                        zIndex: 2,
                        pointerEvents: "none",
                        transition: "opacity 0.3s ease",
                        opacity: canScrollLeft ? 1 : 0,
                    },
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: "30px",
                        background: canScrollRight
                            ? `linear-gradient(to left, ${theme.palette.grey.background || theme.palette.background.default}, transparent)`
                            : "transparent",
                        zIndex: 2,
                        pointerEvents: "none",
                        transition: "opacity 0.3s ease",
                        opacity: canScrollRight ? 1 : 0,
                    },
                }}
            >
                {/* Scrollable container */}
                <Box
                    sx={{
                        overflowX: "hidden",
                        mt: 1,
                        mb: 1,
                        scrollBehavior: "smooth",
                    }}
                    ref={ref}
                >
                    <Stack direction="row" spacing={4} sx={{ mb: 1 }} alignItems="stretch">
                        {content}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default BasicCarousel;
