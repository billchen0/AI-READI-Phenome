import { createRoot } from 'react-dom/client'
import App from './App'
import { ShowcaseData } from './context/ShowcaseData'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element was not found')

createRoot(root).render(
  <ShowcaseData>
    <App />
  </ShowcaseData>,
)
