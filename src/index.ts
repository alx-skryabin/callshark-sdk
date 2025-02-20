import axios, { AxiosInstance } from 'axios'

// todo Не релизная версия
/*
* Проверить, доработать
* Более детальная концеция SDK API + socket
* */

interface SDKConfig {
  apiUrl: string
  wsUrl: string
  initialToken: string
}

class CallSharkSDK {
  private api: AxiosInstance
  private socket: WebSocket | null = null
  private wsUrl: string
  private apiUrl: string
  private token: string

  constructor({ apiUrl, wsUrl, initialToken }: SDKConfig) {
    if (!initialToken) {
      throw new Error('Ошибка: initialToken обязателен при инициализации SDK')
    }

    this.apiUrl = apiUrl
    this.wsUrl = wsUrl
    this.token = initialToken

    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: { Authorization: `Bearer ${this.token}` }
    })
  }

  /** Авторизация и получение нового токена */
  async authenticate() {
    try {
      const response = await this.api.post('/auth/verify', { token: this.token })
      if (response.data?.accessToken) {
        this.token = response.data.accessToken
        this.updateApiClient()
        console.log('Токен обновлён:', this.token)
      } else {
        throw new Error('Ошибка: сервер не вернул новый accessToken')
      }
    } catch (error) {
      console.error('Ошибка аутентификации:', error)
      throw error
    }
  }

  /** Обновляет API-клиент с новым токеном */
  private updateApiClient() {
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: { Authorization: `Bearer ${this.token}` }
    })
  }

  /** Подключение к WebSocket */
  connectSocket() {
    if (!this.token) {
      console.error('Ошибка: отсутствует accessToken, сначала вызови authenticate()')
      return
    }

    if (this.socket) {
      console.warn('WebSocket уже подключён')
      return
    }

    this.socket = new WebSocket(`${this.wsUrl}?token=${this.token}`)

    this.socket.onopen = () => {
      console.log('WebSocket подключён')
    }

    this.socket.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      if (data.event === 'isCall') {
        console.log('Получено событие звонка:', data)
        await this.getCallInfo(data.callId)
      }
    }

    this.socket.onclose = () => {
      console.warn('WebSocket отключён, пытаемся переподключиться...')
      setTimeout(() => this.connectSocket(), 3000) // Автопереподключение
    }

    this.socket.onerror = (error) => {
      console.error('Ошибка WebSocket', error)
    }
  }

  /** Получение информации о звонке */
  async getCallInfo(callId: string) {
    try {
      const response = await this.api.get(`/calls/${callId}`)
      console.log('Информация о звонке:', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка получения информации о звонке', error)
    }
  }

  /** Принять звонок */
  async acceptCall(callId: string) {
    try {
      const response = await this.api.post(`/calls/${callId}/accept`)
      console.log('Звонок принят:', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка принятия звонка', error)
    }
  }

  /** Завершить звонок */
  async endCall(callId: string) {
    try {
      const response = await this.api.post(`/calls/${callId}/end`)
      console.log('Звонок завершён:', response.data)
      return response.data
    } catch (error) {
      console.error('Ошибка завершения звонка', error)
    }
  }

  /** Отключение WebSocket */
  disconnectSocket() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      console.log('WebSocket отключён')
    }
  }
}

export default CallSharkSDK
