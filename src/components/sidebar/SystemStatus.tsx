"use client";

import { Box, Typography } from "@mui/material";
import { ShieldCheck, Activity, Database, Wifi, Cpu } from "lucide-react";
import { GlassCardSecondary } from "@/components/common/GlassCard";

interface SystemStatusProps {
  isConnected: boolean;
  brokerUrl?: string;
}

export default function SystemStatus({ isConnected, brokerUrl = "192.168.221.4" }: SystemStatusProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", mb: 2, fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1.5, display: "block", textAlign: "center" }}>
        DIAGNOSTICS
      </Typography>
      
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
        <StatusItem 
          icon={<Wifi size={14} />} 
          label="Service" 
          value={isConnected ? "Linked" : "Offline"} 
          color={isConnected ? "#4caf50" : "#f44336"} 
        />
        <StatusItem 
          icon={<Database size={14} />} 
          label="Broker IP" 
          value={brokerUrl} 
          color="rgba(255,255,255,0.6)" 
        />
        <StatusItem 
          icon={<Cpu size={14} />} 
          label="Hardware" 
          value="ESP32-S3" 
          color="rgba(255,255,255,0.6)" 
        />
        <StatusItem 
          icon={<Activity size={14} />} 
          label="Uptime" 
          value={isConnected ? "1h 12m" : "---"} 
          color="#4caf50" 
        />
      </Box>
    </Box>
  );
}

function StatusItem({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ color: "rgba(255,255,255,0.2)", display: "flex" }}>{icon}</Box>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: '0.65rem' }}>{label.toUpperCase()}</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color, fontSize: '0.7rem' }}>{value}</Typography>
        </Box>
    )
}
