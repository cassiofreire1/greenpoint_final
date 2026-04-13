import { Button, Typography, Space, Alert, message } from "antd";
import { usePushNotifications } from "../hooks/usePushNotifications";

const { Paragraph, Text } = Typography;

export function PushNotificationManager() {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Alert
          type="warning"
          message="Push notifications não são suportadas neste navegador."
          showIcon
        />
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Alert
          type="error"
          message="Notificações bloqueadas"
          description="Habilite as notificações nas configurações do navegador e do sistema operacional."
          showIcon
        />
      </div>
    );
  }

  const handleSubscribe = async () => {
    try {
      const sub = await subscribe();

      if (!sub) {
        message.error(
          "Não foi possível ativar as notificações. Verifique as permissões do navegador."
        );
        return;
      }

      message.success("Push notifications ativadas com sucesso.");
    } catch (error: any) {
      message.error(error?.message || "Erro ao ativar notificações.");
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      message.success("Push notifications desativadas.");
    } catch (error: any) {
      message.error(error?.message || "Erro ao desativar notificações.");
    }
  };

  const handleTestPush = async () => {
    try {
      await sendTestNotification();
      message.success("Push de teste enviada.");
    } catch (error: any) {
      message.error(error?.message || "Erro ao enviar push de teste.");
    }
  };

  return (
    <div
      style={{
        marginTop: 20,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Space
        direction="vertical"
        size="middle"
        align="center"
        style={{
          textAlign: "center",
        }}
      >
        {subscription ? (
          <>
            <Text strong>Push notifications ativadas.</Text>

            <Space wrap style={{ justifyContent: "center" }}>
              <Button
                onClick={handleTestPush}
                loading={isLoading}
                type="primary"
              >
                Enviar push de teste
              </Button>

              <Button
                onClick={handleUnsubscribe}
                loading={isLoading}
              >
                Desativar notificações
              </Button>
            </Space>
          </>
        ) : (
          <>
            <Paragraph style={{ marginBottom: 0 }}>
              Receba notificações desta aplicação.
            </Paragraph>

            <Button
              onClick={handleSubscribe}
              loading={isLoading}
              type="primary"
            >
              Ativar notificações push
            </Button>
          </>
        )}
      </Space>
    </div>
  );
}