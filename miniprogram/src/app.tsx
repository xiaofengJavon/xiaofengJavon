import { Component, PropsWithChildren } from 'react'
import { AppProvider } from './AppProvider'
import './app.css'

class App extends Component<PropsWithChildren> {
  componentDidMount () {}
  componentDidShow () {}
  componentDidHide () {}

  render () {
    // this.props.children 是将要会渲染的页面
    return (
      <AppProvider>
        {this.props.children}
      </AppProvider>
    )
  }
}

export default App
