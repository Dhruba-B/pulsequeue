import {
    Box
} from "@mui/material";

import Sidebar from "./SideBar";
import Topbar from "./TopBar";

export default function MainLayout({
    children
}) {

    return (

        <Box
            sx={{
                minHeight: "100vh",

                background:
                    "#080B10"
            }}
        >

            <Sidebar />

            <Topbar />

            <Box
                sx={{

                    ml: {
                        xs: 0,
                        md: "280px"
                    },
                    pt: "100px",
                    px: {
                        xs: 2,
                        md: 4
                    },
                    pb: 5
                }}
            >

                {children}

            </Box>

        </Box>
    );
}
