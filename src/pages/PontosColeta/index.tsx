import {
    Button,
    Card,
    Typography,
    Row,
    Col,
    Table,
    Space,
    Popconfirm,
    Spin,
    Flex,
    Form,
    Input, Modal,
    notification
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosService from "../../config/axios";
import endPoints from "../../config/endPoints";
import * as rotas from "../../config/rotas"
import { useSelector } from "react-redux";
import type { RootState } from "../../store/modules/rootReducer";

const { Title } = Typography;

interface PontoColeta {
    id: number;
    nome: string;
    cep: string;
    endereco: string;
    latitude: number;
    longitude: number;
}
type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function PontosColetaPage() {
    const [api, contextHolder] = notification.useNotification();
    const [data, setData] = useState<PontoColeta[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingBtnEdit, setLoadingBtnEdit] = useState(false);
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.authorization);
    const { token } = useSelector((state: RootState) => state.authorization);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PontoColeta | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axiosService.get(endPoints.pontoColeta)
            setData(data || []);
            setLoading(false);
        } catch (e: any) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openNotificationWithIcon = (type: NotificationType, title: String, msg: String,) => {
        api[type]({
            title: title,
            description: msg,
        });
    };

    const handleDelete = async (id: number) => {
        try {
            const { data } = await axiosService.delete(endPoints.deletePontoColeta + `/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
            if (data.success) {
                fetchData();
                openNotificationWithIcon("success", "Ponto de coleta", "Deleteado com sucesso!")
            }
        } catch (e: any) {
            console.log(e.response?.data?.error);
        }
    };

    const handleEdit = (item: PontoColeta) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        setLoadingBtnEdit(true);
        const values = await form.validateFields();
        const pontoColeta = {
            id: editingItem?.id,
            nome: values.nome,
            endereco: values.endereco,
            cep: values.cep,
            latitude: values.latitude,
            longitude: values.longitude,
            id_usuario: user.id,
        }
        try {
            const { data } = await axiosService.put(endPoints.updatePontoColeta, pontoColeta,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });
            if (data.success) {
                setIsModalOpen(false);
                fetchData();
                openNotificationWithIcon("success", "Ponto de coleta", "Edição realizado com sucesso!")
            }
        } catch (e: any) {
            console.log(e.response?.data?.error);
        } finally {
            setLoadingBtnEdit(false)
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id" },
        { title: "Nome", dataIndex: "nome" },
        { title: "CEP", dataIndex: "cep" },
        { title: "Endereço", dataIndex: "endereco" },
        { title: "Lat", dataIndex: "latitude" },
        { title: "Lng", dataIndex: "longitude" },
        {
            title: "Ações",
            render: (_: any, record: PontoColeta) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => handleEdit(record)}>
                        Editar
                    </Button>

                    <Popconfirm
                        title="Tem certeza que deseja deletar?"
                        onConfirm={() => handleDelete(record.id)}>
                        <Button danger type="link">
                            Deletar
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <Flex
                style={{ height: "50vh" }}
                justify="center"
                align="center"
                vertical>
                <Spin size="large" description="Buscando informações..."></Spin>
            </Flex>
        )
    } else {
        return (
            <>
                {contextHolder}
                <div
                    style={{
                        padding: "16px",
                        maxWidth: "1200px",
                        margin: "0 auto",
                        maxHeight: "100%", 
                        overflowY: "auto",
                    }}>

                    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                        <Col>
                            <Title level={3}>Pontos de Coleta</Title>
                        </Col>

                        <Col>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate(rotas.PontoColeta + rotas.CadastroPontosColeta, {
                                    state: { from: location.pathname }
                                })}
                            >
                                Novo ponto
                            </Button>
                        </Col>
                    </Row>
                    <>
                        <div className="mobile-view">
                            <Row gutter={[16, 16]}>
                                {data.map((item) => (
                                    <Col xs={24} key={item.id}>
                                        <Card
                                            style={{
                                                borderRadius: 12,
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            <p><strong>ID:</strong> {item.id}</p>
                                            <p><strong>Nome:</strong> {item.nome}</p>
                                            <p><strong>CEP:</strong> {item.cep}</p>
                                            <p><strong>Endereço:</strong>{item.endereco}</p>
                                            <p><strong>Lat:</strong> {item.latitude}</p>
                                            <p><strong>Lng:</strong> {item.longitude}</p>

                                            <Space style={{ marginTop: 10 }}>
                                                <Button
                                                    onClick={() => handleEdit(item)}>
                                                    Editar
                                                </Button>

                                                <Popconfirm
                                                    title="Tem certeza?"
                                                    onConfirm={() => handleDelete(item.id)}>
                                                    <Button danger>Deletar</Button>
                                                </Popconfirm>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        <div className="desktop-view">
                            <Table
                                columns={columns}
                                dataSource={data}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                            />
                        </div>
                    </>

                    <style>
                        {`
          .desktop-view {
            display: none;
            }
            
            @media (min-width: 768px) {
                .mobile-view {
                    display: none;
                    }
                    
            .desktop-view {
              display: block;
            }
          }
          `}
                    </style>

                    <Modal
                        title="Editar ponto de coleta"
                        open={isModalOpen}
                        confirmLoading={loadingBtnEdit}
                        onCancel={() => setIsModalOpen(false)}
                        onOk={handleUpdate}
                        okText="Salvar"
                        cancelText="Cancelar">
                        <Form form={form} layout="vertical">
                            <Form.Item name="nome" label="Nome">
                                <Input />
                            </Form.Item>

                            <Form.Item name="cep" label="CEP">
                                <Input />
                            </Form.Item>

                            <Form.Item name="endereco" label="Endereço">
                                <Input />
                            </Form.Item>

                            <Form.Item name="latitude" label="Latitude">
                                <Input type="number" />
                            </Form.Item>

                            <Form.Item name="longitude" label="Longitude">
                                <Input type="number" />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </>
        );
    }
}