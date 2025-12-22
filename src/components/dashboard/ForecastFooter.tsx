"use client";

import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useState, useEffect } from "react";

interface ForecastFooterProps {
  data: number[];
}

export default function ForecastFooter({ data }: ForecastFooterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the last 6 data points if available, otherwise pad with a placeholder value (e.g., 20 or null)
  // To keep the chart visible even with 0s, we pad it.
  const chartData = data.length >= 6 ? data.slice(-6) : [...new Array(6 - data.length).fill(0), ...data];
  
  const labels = ["-5m", "-4m", "-3m", "-2m", "-1m", "Now"];

  return (
    <Box sx={{ mt: "auto", position: "relative", width: "100%", pt: 1.5, pb: 1.5 }}>
      {/* Labels row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8, px: 2 }}>
        {labels.map((label, i) => (
          <Typography 
            key={i} 
            variant="caption" 
            sx={{ 
                color: i === 5 ? "#fff" : "rgba(255,255,255,0.4)", 
                fontWeight: i === 5 ? 700 : 500,
                fontSize: '0.65rem',
                letterSpacing: 0.5
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>

      {/* Glowing Chart Area */}
      <Box sx={{ height: 70, position: "relative", mx: -2 }}>
        {mounted && (
          <LineChart
            {...({
              series: [
                {
                  data: chartData,
                  color: "#fff",
                  area: false,
                  showMark: false,
                  curve: "catmullRom",
                },
              ],
              slotProps: {
                legend: { hidden: true },
              },
              margin: { top: 12, right: 20, left: 20, bottom: 12 },
              height: 70,
              sx: {
                ".MuiLineElement-root": {
                  strokeWidth: 2,
                  filter: "drop-shadow(0 0 10px rgba(255,255,255,0.8))",
                },
              },
            } as any)}
          />
        )}
        
        {/* Glow point highlight on current value */}
        <Box sx={{ 
            position: "absolute", 
            right: "18px", 
            bottom: "25px", 
            width: 8, 
            height: 8, 
            bgcolor: "#fff", 
            borderRadius: "50%", 
            boxShadow: "0 0 15px 4px rgba(255,255,255,0.8)",
            zIndex: 10
        }} />
      </Box>

      {/* Temps row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, px: 2 }}>
        {chartData.map((temp, i) => (
          <Typography 
            key={i} 
            variant="body2" 
            sx={{ 
                color: i === 5 ? "#fff" : "rgba(255,255,255,0.3)", 
                fontWeight: i === 5 ? 600 : 400,
                fontSize: i === 5 ? '1.1rem' : '0.9rem',
                textAlign: "center",
                width: "40px"
            }}
          >
            {temp === 0 && data.length < 6 - i ? "--" : `${Math.round(temp)}°`}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
