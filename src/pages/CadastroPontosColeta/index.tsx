import { Form, Input, Button, Typography, Row, Col, Card, notification } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from '../../store/modules/rootReducer';

// import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosService from "../../config/axios";
import endPoints from "../../config/endPoints";
import { useState } from "react";

const { Title } = Typography;
const inputStyle = {
    height: "50px",
    paddingLeft: "20px",
    backgroundColor: "white",
    fontSize: "20px"
};
type NotificationType = 'success' | 'info' | 'warning' | 'error';
type valuesForm = {
    nome: string;
    cep: string;
    rua: string;
    numero: number;
    bairro: string;
    cidade: string;
    uf: string;
    latitude: number;
    longitude: number;
}

function CadastroUsuario() {

    const [api, contextHolder] = notification.useNotification();
    // const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state: RootState) => state.authorization);
    const { token } = useSelector((state: RootState) => state.authorization);

    const openNotificationWithIcon = (type: NotificationType, title: String, msg: String,) => {
        api[type]({
            title: title,
            description: msg,
        });
    };

    const onFinish = async (values: valuesForm) => {
        const endereco = `${values.rua}, ${values.numero || "Sem número"}, ${values.bairro} - ${values.cidade}/${values.uf}`
        const pontoColeta = {
            nome: values.nome,
            endereco: endereco,
            cep: values.cep,
            latitude: values.latitude,
            longitude: values.longitude,
            id_usuario: user.id,
        }
        setLoading(true);
        try {
            const { data } = await axiosService.post(endPoints.cadastroPontoColeta, pontoColeta,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            if (data.success) {
                openNotificationWithIcon("success", "Ponto de coleta", "Cadastro realizado com sucesso!")
                form.setFieldsValue({
                    nome: "",
                    cep: "",
                    rua: "",
                    numero: "",
                    bairro: "",
                    cidade: "",
                    uf: "",
                    latitude: "",
                    longitude: ""
                });
            }
        } catch (e: any) {
            openNotificationWithIcon("error", "Ponto de coleta", e.response?.data?.error)
            console.log(e.response?.data?.error)
        } finally {
            setLoading(false);
        }
    };

    const handleBuscarEndereco = async (cep: string) => {
        cep = cep.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

            if (data.erro) {
                return;
            }

            form.setFieldsValue({
                rua: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                uf: data.uf
            });
        } catch (e: any) {
            console.log(e);
        }
    }

    return (
        <>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{
                    width: "100%",
                    maxWidth: "900px",
                    margin: "0 auto",
                    maxHeight: "100%",
                    overflowY: "auto",
                    border: "1.5px solid #c4c4c4",
                    borderRadius: "10px",
                    backgroundColor: "#f8f8f8",
                }}>
                <Card
                    style={{
                        borderRadius: "12px",
                        backgroundColor: "#f8f8f8"
                    }}
                >
                    <Title level={3} style={{ textAlign: "center" }}>
                        Novo ponto de coleta
                    </Title>

                    <Form.Item name="nome" label="Descrição">
                        <Input size="large" placeholder="Ex: Igreja, Mercado..." style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="cep"
                        label="CEP"
                        rules={[{ required: true, message: "Informe o CEP" }]}
                    >
                        <Input
                            size="large"
                            placeholder="00000-000"
                            onBlur={(e) => handleBuscarEndereco(e.target.value)}
                            style={inputStyle}
                        />
                    </Form.Item>

                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={18}>
                            <Form.Item name="rua" label="Rua">
                                <Input size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={6}>
                            <Form.Item name="numero" label="Número">
                                <Input type="number" size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={10}>
                            <Form.Item name="bairro" label="Bairro">
                                <Input size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>

                        <Col xs={18} md={10}>
                            <Form.Item name="cidade" label="Cidade">
                                <Input size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>

                        <Col xs={6} md={4}>
                            <Form.Item name="uf" label="UF">
                                <Input size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="latitude"
                                label="Latitude"
                                rules={[{ required: true, message: "Informe a latitude" }]}>
                                <Input type="number" size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="longitude"
                                label="Longitude"
                                rules={[{ required: true, message: "Informe a longitude" }]}>
                                <Input type="number" size="large" style={inputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                marginTop: "10px",
                                height: "50px",
                                fontWeight: "bold"
                            }}
                        >
                            Cadastrar ponto de coleta
                        </Button>
                    </Form.Item>
                </Card>
            </Form>
        </>
    )
}

export default CadastroUsuario;

// <Form
//     name="login"
//     form={form}
//     initialValues={{ remember: true }}
//     style={{
//         width: "90%",
//         maxWidth: "800px",
//         border: "1.5px solid #c4c4c4",
//         borderRadius: "10px",
//         padding: "20px",
//         backgroundColor: "#f8f8f8"
//     }}
//     onFinish={onFinish}>

//     <Form.Item>
//         <Title style={{ textAlign: "center" }}>Cadastra um novo ponto de coleta</Title>
//     </Form.Item>

//     <Form.Item name="nome">
//         <Input type="text" placeholder="Informe a descrição para o ponto de coleta" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item
//         name="cep"
//         rules={[{ required: true, message: 'Informa o CEP desse novo ponto de coleta' }]}
//     >
//         <Input type="text" placeholder="CEP" onBlur={(e) => handleBuscarEndereco(e.target.value)} style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item name="rua">
//         <Input type="text" placeholder="Informe a rua" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item name="numero">
//         <Input type="number" placeholder="Informe o número" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item name="bairro">
//         <Input type="text" placeholder="Informe o bairro" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item name="cidade">
//         <Input type="text" placeholder="Informe a cidade" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item name="uf">
//         <Input type="text" placeholder="Informe o UF" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item
//         name="latitude"
//         rules={[{ required: true, message: 'Informa a latitude desse novo ponto de coleta' }]}
//     >
//         <Input type="number" placeholder="Latitude" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item
//         name="longitude"
//         rules={[{ required: true, message: 'Informa a longitude desse novo ponto de coleta' }]}
//     >
//         <Input type="number" placeholder="Longitude" style={{
//             height: "50px",
//             paddingLeft: "20px",
//             backgroundColor: "white",
//             fontSize: "20px"
//         }} />
//     </Form.Item>

//     <Form.Item style={{
//         textAlign: "center"
//     }}>
//         <Button block type="primary" htmlType="submit" style={{
//             height: "auto",
//             width: "50%",
//             fontSize: "20px",
//             whiteSpace: "normal",
//             textAlign: "center",
//             padding: "10px"
//         }} >
//             Cadastrar ponto de coleta
//         </Button>
//     </Form.Item>
// </Form>