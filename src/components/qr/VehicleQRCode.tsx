import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/ping-me-logo.png";

interface VehicleQRCodeProps {
  qrUuid: string;
  plateNumber: string;
  vehicleModel?: string;
}

const VehicleQRCode = ({ qrUuid, plateNumber, vehicleModel }: VehicleQRCodeProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const getQrLink = () => {
    // Link to chat interface instead of scan view
    return `${window.location.origin}/scan/${qrUuid}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getQrLink());
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "QR link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create canvas with styling
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const qrSize = 300;
    const headerHeight = 60;
    const footerHeight = 80;
    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + headerHeight + footerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Yellow header bar
    ctx.fillStyle = "#FFEA00";
    ctx.fillRect(0, 0, totalWidth, headerHeight);

    // Header text
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 24px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PingME", totalWidth / 2, 40);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Draw QR code
      ctx.drawImage(img, padding, headerHeight + padding, qrSize, qrSize);

      // Border around QR
      ctx.strokeStyle = "#FFEA00";
      ctx.lineWidth = 4;
      ctx.strokeRect(padding - 10, headerHeight + padding - 10, qrSize + 20, qrSize + 20);

      // Vehicle info
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 18px 'Space Grotesk', sans-serif";
      ctx.fillText(plateNumber, totalWidth / 2, headerHeight + padding + qrSize + 35);

      if (vehicleModel) {
        ctx.font = "14px 'Poppins', sans-serif";
        ctx.fillStyle = "#666666";
        ctx.fillText(vehicleModel, totalWidth / 2, headerHeight + padding + qrSize + 55);
      }

      // Download
      const link = document.createElement("a");
      link.download = `PingME-${plateNumber.replace(/\s/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "QR Code Downloaded!",
        description: "Your QR code has been saved.",
      });
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Code Display */}
      <div 
        ref={qrRef}
        className="bg-white p-6 rounded-xl border-4 border-ping-yellow mb-4"
      >
        <QRCodeSVG
          value={getQrLink()}
          size={200}
          level="H"
          includeMargin={false}
          fgColor="#1a1a1a"
          bgColor="#FFFFFF"
        />
      </div>

      {/* Vehicle Info */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-ping-ink">{plateNumber}</h3>
        {vehicleModel && (
          <p className="text-sm text-ping-brown">{vehicleModel}</p>
        )}
      </div>

      <p className="text-sm text-ping-brown mb-4 text-center">
        Scan this QR code to contact the owner anonymously
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          className="flex-1 border-2 border-ping-ink/20 hover:border-ping-yellow"
          onClick={copyLink}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button
          className="flex-1 bg-ping-yellow text-ping-ink hover:bg-ping-yellow/90"
          onClick={downloadQR}
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <Button
        variant="ghost"
        className="mt-2 text-ping-brown hover:text-ping-ink"
        onClick={() => window.open(getQrLink(), "_blank")}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Test QR Link
      </Button>
    </div>
  );
};

export default VehicleQRCode;