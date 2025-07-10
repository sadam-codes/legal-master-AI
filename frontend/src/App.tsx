import './App.css'
import AppRouter from './routes'
import { ThemeProvider } from './components/theme/theme-provider'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <>
      <ThemeProvider>
        <AppRouter />
        <Toaster />
      </ThemeProvider>
    </>
  )
}

export default App
