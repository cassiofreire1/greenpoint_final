import { Button, Card, Form, Select, Typography, notification, Spin } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

type NotificationType = "success" | "info" | "warning" | "error";

const STORAGE_KEYS = {
  cidades: "greenpoint_cidades",
  bairrosPorCidade: "greenpoint_bairros_por_cidade",
  ultimaColeta: "greenpoint_ultima_coleta",
};

function BuscarColeta() {
  const [api, contextHolder] = notification.useNotification();

  const [cidades, setCidades] = useState<string[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");
  const [bairroSelecionado, setBairroSelecionado] = useState<string>("");
  const [diasColeta, setDiasColeta] = useState<string>("");

  const [loadingCidades, setLoadingCidades] = useState(false);
  const [loadingBairros, setLoadingBairros] = useState(false);
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingLocalizacao, setLoadingLocalizacao] = useState(false);

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

  const normalizarTexto = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const salvarUltimaColeta = (cidade: string, bairro: string, dias: string) => {
    localStorage.setItem(
      STORAGE_KEYS.ultimaColeta,
      JSON.stringify({
        cidade,
        bairro,
        diasColeta: dias,
      })
    );
  };

  const carregarUltimaColeta = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.ultimaColeta);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as {
        cidade: string;
        bairro: string;
        diasColeta: string;
      };
    } catch {
      return null;
    }
  };

  const salvarCidades = (lista: string[]) => {
    localStorage.setItem(STORAGE_KEYS.cidades, JSON.stringify(lista));
  };

  const carregarCidadesSalvas = (): string[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.cidades);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const salvarBairrosDaCidade = (cidade: string, lista: string[]) => {
    const raw = localStorage.getItem(STORAGE_KEYS.bairrosPorCidade);
    let mapa: Record<string, string[]> = {};

    if (raw) {
      try {
        mapa = JSON.parse(raw);
      } catch {
        mapa = {};
      }
    }

    mapa[cidade] = lista;
    localStorage.setItem(STORAGE_KEYS.bairrosPorCidade, JSON.stringify(mapa));
  };

  const carregarBairrosSalvos = (cidade: string): string[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.bairrosPorCidade);
    if (!raw) return [];

    try {
      const mapa = JSON.parse(raw) as Record<string, string[]>;
      return mapa[cidade] || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    inicializarPagina();
  }, []);

  const inicializarPagina = async () => {
    const cidadesSalvas = carregarCidadesSalvas();
    if (cidadesSalvas.length > 0) {
      setCidades(cidadesSalvas);
    }

    const ultima = carregarUltimaColeta();
    if (ultima) {
      setCidadeSelecionada(ultima.cidade);
      setBairroSelecionado(ultima.bairro);
      setDiasColeta(ultima.diasColeta);

      const bairrosSalvos = carregarBairrosSalvos(ultima.cidade);
      if (bairrosSalvos.length > 0) {
        setBairros(bairrosSalvos);
      }
    }

    await carregarCidades();
  };

  const carregarCidades = async () => {
    try {
      setLoadingCidades(true);

      const response = await fetch(
        "https://yyrnbsehaftutioojylw.supabase.co/functions/v1/listar-cidades",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const fallback = carregarCidadesSalvas();
        if (fallback.length > 0) {
          setCidades(fallback);
          openNotificationWithIcon(
            "warning",
            "Modo offline",
            "Usando cidades salvas localmente."
          );
          return;
        }

        openNotificationWithIcon("error", "Erro", data.error || "Erro ao carregar cidades");
        return;
      }

      const lista = data.cidades || [];
      setCidades(lista);
      salvarCidades(lista);
    } catch {
      const fallback = carregarCidadesSalvas();

      if (fallback.length > 0) {
        setCidades(fallback);
        openNotificationWithIcon(
          "warning",
          "Modo offline",
          "Usando cidades salvas localmente."
        );
      } else {
        openNotificationWithIcon("error", "Erro", "Não foi possível carregar as cidades");
      }
    } finally {
      setLoadingCidades(false);
    }
  };

  const carregarBairros = async (cidade: string): Promise<string[]> => {
    try {
      setLoadingBairros(true);
      setBairroSelecionado("");
      setDiasColeta("");
      setBairros([]);

      const response = await fetch(
        "https://yyrnbsehaftutioojylw.supabase.co/functions/v1/listar-bairros",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cidade }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const fallback = carregarBairrosSalvos(cidade);
        if (fallback.length > 0) {
          setBairros(fallback);
          openNotificationWithIcon(
            "warning",
            "Modo offline",
            "Usando bairros salvos localmente."
          );
          return fallback;
        }

        openNotificationWithIcon("error", "Erro", data.error || "Erro ao carregar bairros");
        return [];
      }

      const lista: string[] = (data.bairros || []).sort((a: string, b: string) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" })
      );

      setBairros(lista);
      salvarBairrosDaCidade(cidade, lista);
      return lista;
    } catch {
      const fallback = carregarBairrosSalvos(cidade);

      if (fallback.length > 0) {
        setBairros(fallback);
        openNotificationWithIcon(
          "warning",
          "Modo offline",
          "Usando bairros salvos localmente."
        );
        return fallback;
      }

      openNotificationWithIcon("error", "Erro", "Não foi possível carregar os bairros");
      return [];
    } finally {
      setLoadingBairros(false);
    }
  };

  const buscarColeta = async (cidade: string, bairro: string) => {
    try {
      setLoadingBusca(true);
      setDiasColeta("");

      const response = await fetch(
        "https://yyrnbsehaftutioojylw.supabase.co/functions/v1/buscar-coleta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cidade,
            bairro,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const ultima = carregarUltimaColeta();
        if (
          ultima &&
          ultima.cidade === cidade &&
          ultima.bairro === bairro &&
          ultima.diasColeta
        ) {
          setDiasColeta(ultima.diasColeta);
          openNotificationWithIcon(
            "warning",
            "Modo offline",
            "Usando o último resultado salvo localmente."
          );
          return;
        }

        openNotificationWithIcon("error", "Erro", data.error || "Coleta não encontrada");
        return;
      }

      const dias = data.coleta?.dias_coleta || "";
      setDiasColeta(dias);
      salvarUltimaColeta(cidade, bairro, dias);
    } catch {
      const ultima = carregarUltimaColeta();

      if (
        ultima &&
        ultima.cidade === cidade &&
        ultima.bairro === bairro &&
        ultima.diasColeta
      ) {
        setDiasColeta(ultima.diasColeta);
        openNotificationWithIcon(
          "warning",
          "Modo offline",
          "Usando o último resultado salvo localmente."
        );
      } else {
        openNotificationWithIcon("error", "Erro", "Não foi possível buscar a coleta");
      }
    } finally {
      setLoadingBusca(false);
    }
  };

  const handleCidadeChange = async (value: string) => {
    setCidadeSelecionada(value);
    await carregarBairros(value);
  };

  const handleBuscar = async () => {
    if (!cidadeSelecionada || !bairroSelecionado) {
      openNotificationWithIcon(
        "warning",
        "Campos obrigatórios",
        "Selecione a cidade e o bairro antes de buscar"
      );
      return;
    }

    await buscarColeta(cidadeSelecionada, bairroSelecionado);
  };

  const localizar = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const usarMinhaLocalizacao = async () => {
    try {
      setLoadingLocalizacao(true);
      setDiasColeta("");

      const { lat, lng } = await localizar();

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
      );

      const data = await response.json();

      const address = data?.address || {};

      const cidadeEncontrada =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "";

      const bairroEncontrado =
        address.suburb ||
        address.neighbourhood ||
        address.city_district ||
        address.quarter ||
        "";

      if (!cidadeEncontrada) {
        openNotificationWithIcon(
          "warning",
          "Localização encontrada",
          "Não foi possível identificar a cidade automaticamente."
        );
        return;
      }

      const cidadeSistema =
        cidades.find(
          (cidade) =>
            normalizarTexto(cidade) === normalizarTexto(cidadeEncontrada)
        ) || "";

      if (!cidadeSistema) {
        openNotificationWithIcon(
          "warning",
          "Cidade não cadastrada",
          `A cidade "${cidadeEncontrada}" não está cadastrada no sistema.`
        );
        return;
      }

      setCidadeSelecionada(cidadeSistema);

      const bairrosDaCidade = await carregarBairros(cidadeSistema);

      if (!bairroEncontrado) {
        openNotificationWithIcon(
          "warning",
          "Bairro não identificado",
          "Sua cidade foi identificada, mas não foi possível detectar o bairro automaticamente."
        );
        return;
      }

      const bairroSistema =
        bairrosDaCidade.find(
          (bairro: string) =>
            normalizarTexto(bairro) === normalizarTexto(bairroEncontrado)
        ) || "";

      if (!bairroSistema) {
        openNotificationWithIcon(
          "warning",
          "Bairro não cadastrado",
          `O bairro "${bairroEncontrado}" não foi encontrado para a cidade "${cidadeSistema}".`
        );
        return;
      }

      setBairroSelecionado(bairroSistema);
      await buscarColeta(cidadeSistema, bairroSistema);

      openNotificationWithIcon(
        "success",
        "Localização identificada",
        `Busca automática realizada para ${cidadeSistema} - ${bairroSistema}.`
      );
    } catch (error: any) {
      let mensagem = "Não foi possível obter sua localização.";

      if (error?.code === 1) {
        mensagem = "Permissão de localização negada.";
      } else if (error?.code === 2) {
        mensagem = "Sua localização não pôde ser determinada.";
      } else if (error?.code === 3) {
        mensagem = "Tempo esgotado ao tentar obter sua localização.";
      }

      openNotificationWithIcon("error", "Erro", mensagem);
    } finally {
      setLoadingLocalizacao(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        style={{
          width: "90%",
          maxWidth: "800px",
          maxHeight: "70vh",
          overflowY: "auto",
          border: "1.5px solid #c4c4c4",
          borderRadius: "10px",
          padding: "20px",
          backgroundColor: "#f8f8f8",
        }}>
        <Form.Item>
          <Title style={{ textAlign: "center" }}>
            Consulte os dias da coleta
          </Title>
        </Form.Item>

        <Form.Item style={{ textAlign: "center" }}>
          <Button
            icon={<EnvironmentOutlined />}
            onClick={usarMinhaLocalizacao}
            loading={loadingLocalizacao}
            style={{
              height: "auto",
              width: "50%",
              fontSize: "18px",
              whiteSpace: "normal",
              textAlign: "center",
              padding: "10px",
            }}
          >
            Usar minha localização atual
          </Button>
        </Form.Item>

        <Form.Item label="Cidade" required>
          <Select
            showSearch
            placeholder="Selecione a cidade"
            value={cidadeSelecionada || undefined}
            onChange={handleCidadeChange}
            loading={loadingCidades}
            optionFilterProp="label"
            style={{
              height: "50px",
              fontSize: "18px",
            }}
            options={cidades.map((cidade) => ({
              value: cidade,
              label: cidade,
            }))}
          />
        </Form.Item>

        <Form.Item label="Bairro" required>
          <Select
            showSearch
            placeholder="Selecione o bairro"
            value={bairroSelecionado || undefined}
            onChange={(value) => setBairroSelecionado(value)}
            loading={loadingBairros}
            disabled={!cidadeSelecionada}
            optionFilterProp="label"
            style={{
              height: "50px",
              fontSize: "18px",
            }}
            options={bairros.map((bairro) => ({
              value: bairro,
              label: bairro,
            }))}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "center" }}>
          <Button
            type="primary"
            onClick={handleBuscar}
            loading={loadingBusca}
            style={{
              height: "auto",
              width: "50%",
              fontSize: "20px",
              whiteSpace: "normal",
              textAlign: "center",
              padding: "10px",
            }}
          >
            Buscar
          </Button>
        </Form.Item>

        {loadingBusca && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Spin size="large" />
          </div>
        )}

        {diasColeta && !loadingBusca && (
          <Card
            style={{
              marginTop: "20px",
              borderRadius: "10px",
            }}
          >
            <Title level={4}>Dias da coleta</Title>
            <Text>
              <strong>Cidade:</strong> {cidadeSelecionada}
            </Text>
            <br />
            <Text>
              <strong>Bairro:</strong> {bairroSelecionado}
            </Text>
            <br />
            <br />
            <Text>
              <strong>O caminhão passa em:</strong> {diasColeta}
            </Text>
          </Card>
        )}
      </Form>
    </>
  );
}

export default BuscarColeta;