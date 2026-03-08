import api from "@/lib/interceptor"

export interface Broker {
  code: string
  name: string
  type: string
}

export type BrokerGroup = Record<string, Broker[]>

export const getBrokers = async () => {
  const { data } = await api.get<{ data: BrokerGroup }>("/brokers")
  return data.data
}
