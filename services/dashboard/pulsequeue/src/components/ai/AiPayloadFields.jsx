import { Grid, MenuItem, TextField } from "@mui/material";
import { fieldSx, menuSx } from "./aiFormStyles";

const updatePayload = (payload, patch, onChange) => onChange({ ...payload, ...patch });

export default function AiPayloadFields({
    type,
    payload,
    onChange,
}) {
    if (type === "OCR") {
        return (
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField fullWidth label="IMAGE URL" value={payload.imageUrl || ""} onChange={(event) => updatePayload(payload, { imageUrl: event.target.value }, onChange)} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField select fullWidth label="OCR LANGUAGE" value={payload.language || "eng"} onChange={(event) => updatePayload(payload, { language: event.target.value }, onChange)} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                        {["eng", "ben", "hin", "spa", "fra", "deu"].map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
                    </TextField>
                </Grid>
            </Grid>
        );
    }

    if (type === "TRANSLATE") {
        return (
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth multiline minRows={4} label="SOURCE TEXT" value={payload.text || ""} onChange={(event) => updatePayload(payload, { text: event.target.value }, onChange)} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="SOURCE LANGUAGE" value={payload.sourceLanguage || "auto"} onChange={(event) => updatePayload(payload, { sourceLanguage: event.target.value }, onChange)} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="TARGET LANGUAGE" value={payload.targetLanguage || ""} onChange={(event) => updatePayload(payload, { targetLanguage: event.target.value }, onChange)} sx={fieldSx} />
                </Grid>
            </Grid>
        );
    }

    if (type === "CLASSIFY") {
        return (
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth multiline minRows={4} label="TEXT" value={payload.text || ""} onChange={(event) => updatePayload(payload, { text: event.target.value }, onChange)} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth label="LABELS / COMMA SEPARATED" value={(payload.labels || []).join(", ")} onChange={(event) => updatePayload(payload, { labels: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }, onChange)} sx={fieldSx} />
                </Grid>
            </Grid>
        );
    }

    if (type === "EMBED") {
        return (
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                    <TextField fullWidth multiline minRows={4} label="TEXT" value={payload.text || ""} onChange={(event) => updatePayload(payload, { text: event.target.value }, onChange)} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField select fullWidth label="POOLING" value={payload.pooling || "mean"} onChange={(event) => updatePayload(payload, { pooling: event.target.value }, onChange)} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                        {["mean", "cls"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField select fullWidth label="NORMALIZE" value={String(payload.normalize ?? true)} onChange={(event) => updatePayload(payload, { normalize: event.target.value === "true" }, onChange)} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                        <MenuItem value="true">true</MenuItem>
                        <MenuItem value="false">false</MenuItem>
                    </TextField>
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container spacing={1.5}>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline minRows={4} label="TEXT" value={payload.text || ""} onChange={(event) => updatePayload(payload, { text: event.target.value }, onChange)} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
                <TextField select fullWidth label="SUMMARY LENGTH" value={payload.summaryLength || "medium"} onChange={(event) => updatePayload(payload, { summaryLength: event.target.value }, onChange)} sx={fieldSx} slotProps={{ select: { MenuProps: menuSx } }}>
                    {["short", "medium", "long"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
            </Grid>
        </Grid>
    );
}
