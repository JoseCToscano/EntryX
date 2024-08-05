import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const useQRCode = (id: string) => {
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQrCode = (data: string) => {
    const size = "150x150";
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`;
    setCode(url);
  };

  useEffect(() => {
    const generateQRCOde = () => {
      setIsGenerating(true);
      // Generate QR Code
      axios
        .get<string>(
          `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`,
        )
        .then((response) => {
          console.log(response.data);
          setCode(response.data);
        })
        .catch((error) => {
          console.error(error);
          toast.error("Failed to generate QR Code");
        });
      setIsGenerating(false);
    };
    generateQRCOde();
  }, []);

  return { isGenerating, code };
};
