import { Button, Form, Input, Spin, notification, Typography, Flex, Avatar, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as actions from "../../store/modules/authorization/actions";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/modules/rootReducer";
import { isEmail } from "validator";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabase";

const { Title, Text } = Typography;
type NotificationType = "success" | "info" | "warning" | "error";

function CadastroUsuario() {
    const [api, contextHolder] = notification.useNotification();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoggedIn, update } = useSelector(
        (state: RootState) => state.authorization
    );

    const [loading, setLoading] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [foto, setFoto] = useState<string | null>(user?.foto || null);
    const [mostrarCamera, setMostrarCamera] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", {
                state: {
                    trocouEmail: true,
                    from: location.pathname,
                },
                replace: true,
            });
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        setFoto(user?.foto || null);
    }, [user]);

    useEffect(() => {
        if (update) {
            setLoading(false);
            openNotificationWithIcon(
                "success",
                "Edição de usuário",
                "Seus dados foram alterados!"
            );
            dispatch(actions.resetUpdate());
        }
    }, [update, dispatch]);

    const openNotificationWithIcon = (
        type: NotificationType,
        title: String,
        msg: String,
    ) => {
        api[type]({
            message: title,
            description: msg,
        });
    };

    const base64ToFile = (base64: string, filename: string) => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    };

    const ativarCamera = async () => {
        try {
            setMostrarCamera(true);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch {
            openNotificationWithIcon("error", "Erro", "Não foi possível acessar a câmera");
        }
    };

    const pararCamera = () => {
        const video = videoRef.current;

        if (video && video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    };

    const tirarFoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0);

        const imagem = canvas.toDataURL("image/jpeg", 0.7);
        setFoto(imagem);

        pararCamera();
        setMostrarCamera(false);
    };

    const removerFoto = () => {
        setFoto(null);
    };

    const onFinish = async (values: any) => {
        if (!values.nomeUsuario?.trim()) {
            openNotificationWithIcon(
                "error",
                "Nome inválido",
                "Informe um nome de usuário válido."
            );
            return;
        }

        if (!isEmail(values.email)) {
            openNotificationWithIcon(
                "error",
                "Email inválido!",
                "Informe um email válido para confirmar a alteração."
            );
            return;
        }

        if (values.email !== user.email) {
            openNotificationWithIcon(
                "error",
                "Email incorreto",
                "Digite o seu email atual para confirmar a alteração."
            );
            return;
        }

        if (!values.senha || !values.senha.trim()) {
            openNotificationWithIcon(
                "error",
                "Senha obrigatória",
                "Digite sua senha para confirmar a alteração."
            );
            return;
        }

        Modal.confirm({
            title: "Confirmar alterações",
            content: "Deseja realmente salvar as mudanças?",
            okText: "Sim",
            cancelText: "Não",
            onOk: async () => {
                setLoading(true);

                try {
                    let fotoUrl = user?.foto || null;

                    if (foto && foto.startsWith("data:image")) {
                        const file = base64ToFile(foto, `user_${Date.now()}.jpg`);

                        const { data, error } = await supabase.storage
                            .from("usuarios")
                            .upload(`perfil/${file.name}`, file);

                        if (error) {
                            openNotificationWithIcon("error", "Erro", error.message);
                            setLoading(false);
                            return;
                        }

                        const { data: publicUrl } = supabase.storage
                            .from("usuarios")
                            .getPublicUrl(data.path);

                        fotoUrl = publicUrl.publicUrl;
                    }

                    if (!foto) {
                        fotoUrl = null;
                    }

                    dispatch(actions.updateRequest({
                        id: user.id,
                        nome: values.nomeUsuario,
                        email: user.email,
                        senha: values.senha,
                        foto: fotoUrl,
                        trocouEmail: false,
                    }));
                } catch {
                    openNotificationWithIcon(
                        "error",
                        "Erro",
                        "Não foi possível salvar as alterações"
                    );
                    setLoading(false);
                }
            },
        });
    };

    return (
        <>
            {contextHolder}

            {loading && (
                <Flex
                    vertical
                    justify="center"
                    align="center"
                    style={{ marginBottom: "30px" }}
                >
                    <Spin size="large" description="Salvando os seus dados..." />
                </Flex>
            )}

            <Form
                name="editar-usuario"
                initialValues={{
                    nomeUsuario: user.nome,
                    email: user.email,
                }}
                style={{
                    width: "90%",
                    maxWidth: "800px",
                    maxHeight: "70vh",
                    overflowY: "auto",
                    border: "1.5px solid #c4c4c4",
                    borderRadius: "10px",
                    padding: "20px",
                    backgroundColor: "#f8f8f8",
                }}
                onFinish={onFinish}
            >
                <Form.Item>
                    <Title style={{ textAlign: "center" }}>Edite os seus dados</Title>
                </Form.Item>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <Avatar
                            size={120}
                            src={foto || undefined}
                            icon={!foto ? <UserOutlined /> : undefined}
                        />

                        <Button
                            shape="circle"
                            icon={<PlusOutlined />}
                            onClick={ativarCamera}
                            style={{ position: "absolute", bottom: 0, right: 0 }}
                        />

                        {foto && (
                            <Button
                                danger
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={removerFoto}
                                style={{ position: "absolute", top: 0, right: 0 }}
                            />
                        )}
                    </div>
                </div>

                {mostrarCamera && (
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: "100%",
                                maxWidth: "300px",
                                borderRadius: "10px",
                            }}
                        />

                        <div style={{ marginTop: "10px" }}>
                            <Button onClick={tirarFoto}>Tirar Foto</Button>
                            <Button
                                danger
                                onClick={() => {
                                    pararCamera();
                                    setMostrarCamera(false);
                                }}
                                style={{ marginLeft: 10 }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                <canvas ref={canvasRef} style={{ display: "none" }} />

                <Form.Item
                    name="nomeUsuario"
                    rules={[{ required: true, message: "Informe seu nome de usuário" }]}
                >
                    <Input
                        placeholder="Informe seu nome"
                        style={{
                            height: "50px",
                            paddingLeft: "20px",
                            backgroundColor: "white",
                            fontSize: "20px",
                        }}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }}>
                    <Text strong>Digite seu email atual para confirmar a alteração</Text>
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[{ required: true, message: "Informe seu email atual" }]}
                >
                    <Input
                        type="email"
                        placeholder="Digite seu email atual"
                        style={{
                            height: "50px",
                            paddingLeft: "20px",
                            backgroundColor: "white",
                            fontSize: "20px",
                        }}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }}>
                    <Text strong>Digite sua senha atual para confirmar a alteração</Text>
                </Form.Item>

                <Form.Item
                    name="senha"
                    rules={[{ required: true, message: "Informe sua senha atual" }]}
                >
                    <Input.Password
                        placeholder="Digite sua senha atual"
                        style={{
                            height: "50px",
                            paddingLeft: "20px",
                            backgroundColor: "white",
                            fontSize: "20px",
                        }}
                    />
                </Form.Item>

                <Form.Item style={{ textAlign: "center" }}>
                    <Button
                        block
                        type="primary"
                        htmlType="submit"
                        style={{
                            height: "auto",
                            width: "50%",
                            fontSize: "20px",
                            whiteSpace: "normal",
                            textAlign: "center",
                            padding: "10px",
                            margin: "0 auto",
                        }}
                    >
                        Salvar alterações
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default CadastroUsuario;