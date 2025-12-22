"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { Navigation, Circle } from "lucide-react";
import { GlassCardSecondary } from "@/components/common/GlassCard";

export default function GlobeWidget() {
  return (
    <Box sx={{ mt: "auto" }}>
      <GlassCardSecondary sx={{ py: 2, px: 3, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.02)", boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.8)" }}>
            VICENZA STATION
          </Typography>
      </GlassCardSecondary>
    </Box>
  );
}
