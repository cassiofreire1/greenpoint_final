import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from "redux-persist/integration/react"
import { Layout } from 'antd'

import AppRoutes from "./routes/index"
import GlobalStyles from './styles/GlobalStyles'
import store, { persistor } from './store/index'
import NavMenu from "./components/NavMenu/index"
import Footer from "./components/Footer/index"

import OfflineNotice from "./components/OfflineNotice"

const { Header, Content, Footer: AntFooter } = Layout

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <BrowserRouter>
          <OfflineNotice />

          <Layout
            style={{
              height: "100vh",
              display: "flex",
              flexDirection: "column",
            }}>
            <Header style={{ height: "80px", padding: 0 }}>
              <NavMenu />
            </Header>

            <Content
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px",
                backgroundColor: "white",
                overflow: "auto",
              }}
            >
              <AppRoutes />
            </Content>

            <AntFooter style={{ padding: 0 }}>
              <Footer />
            </AntFooter>
          </Layout>

          <GlobalStyles />
        </BrowserRouter>
      </PersistGate>
    </Provider >
  )
}

export default App

//Uso da geolocalização

// const [local, setLocal] = useState<{
//   lat: number;
//   lng: number;
// }>({
//   lat: 0,
//   lng: 0
// });

// const localizar = (e: any) => {
//   e.preventDefault();
//   navigator.geolocation.getCurrentPosition((position) => {
//     setLocal({
//       lat: position.coords.latitude,
//       lng: position.coords.longitude
//     });
//   });
// }

// useEffect(() => {
//   endereco();
// }, [local])

// const endereco = async () => {

//   const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${local.lat}&lon=${local.lng}&format=json`);
//   const data = await response.json();
//   console.log(data)
// }