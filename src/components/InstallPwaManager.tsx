import { Button, Typography, message } from "antd";
import { useEffect, useState } from "react";

const { Paragraph } = Typography;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function InstallPwaManager() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      message.success("Aplicativo instalado com sucesso.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      message.warning(
        "A instalação não está disponível no momento. Use um navegador compatível como Edge ou Chrome, com HTTPS."
      );
      return;
    }

    try {
      setIsLoading(true);
      await deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        message.success("Instalação iniciada.");
      } else {
        message.info("Instalação cancelada.");
      }

      setDeferredPrompt(null);
    } catch (error: any) {
      message.error(error?.message || "Erro ao instalar o aplicativo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInstalled) {
    return (
      <div
        style={{
          marginTop: 16,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paragraph style={{ marginBottom: 0, textAlign: "center" }}>
          Aplicativo já instalado neste dispositivo.
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 16,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Paragraph style={{ marginBottom: 12 }}>
          Instale o GreenPoint no seu dispositivo.
        </Paragraph>

        <Button
          type="primary"
          onClick={handleInstall}
          loading={isLoading}
          disabled={!deferredPrompt}
        >
          Instalar aplicativo
        </Button>
      </div>
    </div>
  );
}