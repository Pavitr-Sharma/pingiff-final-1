import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/ping-me-logo.png";

interface PrebookQRCodeProps {
  productSlug?: string;
  size?: number;
}

const PrebookQRCode = ({ productSlug = "standard-car-card", size = 200 }: PrebookQRCodeProps) => {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/prebook?product=${productSlug}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 inline-flex flex-col items-center gap-4">
      <img src={logo} alt="PingME" className="h-8" />
      <QRCodeSVG
        value={url}
        size={size}
        level="H"
        bgColor="transparent"
        fgColor="hsl(40, 76%, 7%)"
        imageSettings={{
          src: logo,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
      <p className="text-sm text-muted-foreground text-center">
        Scan to pre-book <strong>{productSlug.replace(/-/g, " ")}</strong>
      </p>
    </div>
  );
};

export default PrebookQRCode;
