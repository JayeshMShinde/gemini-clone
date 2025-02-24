import Main from "./components/Main/Main"
import Sidebar from "./components/Sidebar/Sidebar"
import ContextProvider from "./context/context"
import { ThemeProvider } from "./context/ThemeContext"

const App = () => {
  return (
    <>
    <ThemeProvider>
      <ContextProvider>
        <Sidebar />
        <Main />
      </ContextProvider>
    </ThemeProvider>
    </>
  )
}

export default App
