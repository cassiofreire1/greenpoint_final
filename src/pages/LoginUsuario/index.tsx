import { Button, Flex, Form, Input, Spin, Typography, notification } from "antd";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from "react-router-dom";
import { isEmail } from "validator";

import * as rotas from "../../config/rotas";
import { useDispatch, useSelector } from "react-redux";

import * as actions from "../../store/modules/authorization/actions"
import type { RootState } from "../../store/modules/rootReducer";
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;
type NotificationType = 'success' | 'error';

function LoginUsuario() {

    const [api, contextHolder] = notification.useNotification();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const path = location.state?.from;
    const { isLoggedIn } = useSelector((state: RootState) => state.authorization)
    const { error } = useSelector((state: RootState) => state.authorization);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (location.state?.trocouEmail && (path === rotas.EditarUsario)) {
            openNotificationWithIcon('success', "Edição de usuario", "Você alterou o seu email. Faça login novamente.")
            navigate(location.pathname, { replace: true });
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            setLoading(false);
            navigate("/", {
                state: {
                    showSuccess: true,
                    from: location.pathname
                },
                replace: true
            });
        }
    }, [isLoggedIn])

    useEffect(() => {
        if (error) {
            openNotificationWithIcon('error', "Error no login", error);
            setLoading(false);
        }
    }, [error])

    const openNotificationWithIcon = (type: NotificationType, title: String, msg: String,) => {
        api[type]({
            title: title,
            description: msg,
        });
    };

    const onFinish = async (values: any) => {
        let formErros = false;

        if (!isEmail(values.usuario)) {
            openNotificationWithIcon('error', "Email invalido!", "Informe outro email que seja valido!")
            formErros = true;
        }

        if (formErros) return;

        dispatch(actions.loginRequest({
            email: values.usuario,
            senha: values.senha
        }))
        setLoading(true);
    };

    const handleClickCadastrarUsuario = (e: any) => {
        e.preventDefault();
        navigate(rotas.CadastrarUsuario, {
            state: {
                from: location.pathname
            }
        })
    }

    return (
        <>
            {contextHolder}
            {loading && <Flex
                vertical
                justify="center"
                align="center"
                style={{
                    marginBottom: "30px"
                }}
            >
                <Spin size="large" description="Fazendo o seu login..."></Spin>
            </Flex>
            }
            <Form
                name="login"
                initialValues={{ remember: true }}
                style={{
                    width: "90%",
                    maxWidth: "800px",
                    border: "1.5px solid #c4c4c4",
                    borderRadius: "10px",
                    padding: "20px",
                    backgroundColor: "#f8f8f8"
                }}
                onFinish={onFinish}>
                <Form.Item>
                    <Title style={{ textAlign: "center" }}>
                        Faça o seu Login
                    </Title>
                </Form.Item>

                <Form.Item
                    name="usuario"
                    rules={[{ required: true, message: 'Informe o seu usuário!' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Usuário"
                        style={{
                            height: "50px",
                            paddingLeft: "20px",
                            backgroundColor: "white",
                            fontSize: "20px"
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="senha"
                    rules={[{ required: true, message: 'Informe a sua senha!' }]}
                >
                    <Input
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Senha"
                        style={{
                            height: "50px",
                            paddingLeft: "20px",
                            backgroundColor: "white",
                            fontSize: "20px"
                        }}
                    />
                </Form.Item>

                <Form.Item style={{ textAlign: "center" }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            height: "auto",
                            width: "50%",
                            fontSize: "20px",
                            whiteSpace: "normal",
                            textAlign: "center",
                            padding: "10px"
                        }}
                    >
                        Entrar
                    </Button>
                </Form.Item>

                <hr style={{
                    width: "100%",
                    borderTop: "1px solid #c4c4c4",
                    marginBottom: "10px"
                }} />

                <Form.Item style={{ textAlign: "center" }}>
                    <Paragraph style={{ fontSize: "18px" }}>
                        Não tem login? <br />
                        Faça o seu cadastro agora
                    </Paragraph>

                    <Button
                        type="primary"
                        style={{
                            height: "auto",
                            width: "50%",
                            fontSize: "20px",
                            whiteSpace: "normal",
                            textAlign: "center",
                            padding: "10px"
                        }}
                        onClick={handleClickCadastrarUsuario}
                    >
                        Fazer cadastro
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}

export default LoginUsuario;