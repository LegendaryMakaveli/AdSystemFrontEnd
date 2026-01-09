import router from "./router/router"
import {RouterProvider} from "react-router"
import KeepAlive from "./components/keepAlive"
function App() {
  return (
    <>
      <KeepAlive />
      <RouterProvider router={router} />
    </>
  )
}

export default App