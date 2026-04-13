import { Flex, Button, Typography, notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../../store/modules/rootReducer";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import * as rotas from "../../config/rotas";
import { PushNotificationManager } from "../../components/PushNotificationManager";
import { InstallPwaManager } from "../../components/InstallPwaManager";

const { Title } = Typography;
type NotificationType = "success" | "info" | "warning" | "error";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.state?.from;

  const [api, contextHolder] = notification.useNotification();

  const { user } = useSelector((state: RootState) => state.authorization);
  const { isLoggedIn } = useSelector((state: RootState) => state.authorization);

  useEffect(() => {
    if (location.state?.showSuccess && path === rotas.CadastrarUsuario) {
      openNotificationWithIcon(
        "success",
        "Cadastro de usuario",
        "Seu usuário foi criado com sucesso"
      );
      navigate(location.pathname, { replace: true });
    } else if (location.state?.showSuccess && path === rotas.Login) {
      openNotificationWithIcon(
        "success",
        "Login de usuario",
        `Bem vindo novamente, ${user.nome}`
      );
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, path, user.nome, navigate, location.pathname]);

  const openNotificationWithIcon = (
    type: NotificationType,
    title: string,
    msg: string
  ) => {
    api[type]({
      message: title,
      description: msg,
    });
  };

  const handleBtnCalendario = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    navigate(rotas.Calendario, {
      state: { from: location.pathname },
    });
  };

  const handleBtnMapa = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    navigate(rotas.Mapa, {
      state: { from: location.pathname },
    });
  };

  return (
    <>
      {contextHolder}

      <Flex
        flex={1}
        vertical
        justify="center"
        align="center"
        style={{
          width: "100%",
        }}
      >
        <Flex align="center">
          {isLoggedIn ? (
            <Title style={{ textAlign: "center" }}>Olá {user.nome}</Title>
          ) : (
            <Title style={{ textAlign: "center" }}>
              Bem-vindo ao GreenPoint
            </Title>
          )}
        </Flex>

        <Flex
          vertical
          justify="center"
          align="center"
          gap="20px"
          style={{
            width: "100%",
          }}
        >
          <Button
            type="primary"
            block
            style={{
              height: "auto",
              width: "50%",
              fontSize: "20px",
              whiteSpace: "normal",
              textAlign: "center",
              padding: "10px",
            }}
            onClick={handleBtnCalendario}
          >
            Calendario de coletas
          </Button>

          <Button
            type="primary"
            block
            style={{
              height: "auto",
              width: "50%",
              fontSize: "20px",
              whiteSpace: "normal",
              textAlign: "center",
              padding: "10px",
            }}
            onClick={handleBtnMapa}
          >
            Mapa de pontos de coleta
          </Button>
        </Flex>

        <Flex
          vertical
          justify="center"
          align="center"
          style={{
            width: "100%",
            marginTop: 30,
          }}
        >
          <PushNotificationManager />
          <InstallPwaManager />
        </Flex>
      </Flex>
    </>
  );
}

export default Home;