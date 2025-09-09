import Main from "./components/Main/Main"
import Sidebar from "./components/Sidebar/Sidebar"
import ContextProvider from "./context/context"
import { ThemeProvider } from "./context/ThemeContext"

const App = () => {
  return (
    <ThemeProvider>
      <ContextProvider>
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <Sidebar />
          <Main />
        </div>
      </ContextProvider>
    </ThemeProvider>
  )
}

export default App
