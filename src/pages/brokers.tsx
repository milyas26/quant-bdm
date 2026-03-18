import { useQuery } from '@tanstack/react-query'
import { getBrokers } from '@/lib/apis/broker/broker-api'

const Brokers = () => {
  const { data: brokerGroup, isLoading, isError, error } = useQuery({
    queryKey: ['brokers'],
    queryFn: getBrokers,
  })

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Daftar Broker</h1>

      {isLoading && (
        <div className="flex justify-center items-center py-6">
          <span className="text-sm text-gray-400">Memuat data...</span>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-3">{error?.message}</div>
      )}

      {!isLoading && !isError && Object.keys(brokerGroup ?? {}).length === 0 && (
        <div className="text-sm text-gray-400 text-center py-6">Tidak ada data broker.</div>
      )}

      {!isLoading && !isError && Object.entries(brokerGroup ?? {}).sort(([a], [b]) => {
        const order = ['SMART_MONEY', 'RITEL', 'PEMERINTAH', 'ASING', 'LOKAL']
        return order.indexOf(a) - order.indexOf(b)
      }).map(([groupKey, brokers]) => (
        <div key={groupKey} className="mb-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{groupKey}</h2>
          <div className="grid grid-cols-4 gap-2">
            {brokers.map((broker) => (
              <div key={broker.code} className="border border-gray-200 rounded bg-white px-3 py-2 hover:bg-gray-50">
                <div className="font-semibold text-xs text-gray-800">{broker.code}</div>
                <div className="text-xs text-gray-500 truncate">{broker.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{broker.type}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Brokers