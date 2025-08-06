import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Calendar, Download, Filter } from 'lucide-react'
import { receitas, despesas, auth } from '../supabase/client'

const Relatorios = () => {
  const [user, setUser] = useState(null)
  const [receitasData, setReceitasData] = useState([])
  const [despesasData, setDespesasData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: userData } = await auth.getCurrentUser()
      setUser(userData.user)

      if (userData.user) {
        const [receitasResult, despesasResult] = await Promise.all([
          receitas.getAll(userData.user.id),
          despesas.getAll(userData.user.id)
        ])

        setReceitasData(receitasResult.data || [])
        setDespesasData(despesasResult.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar dados por mês/ano
  const filtrarPorPeriodo = (data) => {
    return data.filter(item => {
      const itemDate = new Date(item.data)
      return itemDate.getMonth() + 1 === filtroMes && itemDate.getFullYear() === filtroAno
    })
  }

  const receitasFiltradas = filtrarPorPeriodo(receitasData)
  const despesasFiltradas = filtrarPorPeriodo(despesasData).filter(item => item.is_paid === true)

  // Dados para gráfico de barras por categoria (apenas despesas pagas)
  const categoriasDespesas = despesasFiltradas.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + parseFloat(item.valor)
    return acc
  }, {})

  const categoriasReceitas = receitasFiltradas.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + parseFloat(item.valor)
    return acc
  }, {})

  const dadosBarras = Object.keys({...categoriasDespesas, ...categoriasReceitas}).map(categoria => ({
    categoria,
    receitas: categoriasReceitas[categoria] || 0,
    despesas: categoriasDespesas[categoria] || 0
  }))

  // Dados para gráfico de pizza
  const dadosPizza = Object.entries(categoriasDespesas).map(([categoria, valor]) => ({
    name: categoria,
    value: valor
  }))

  const cores = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

  // Dados para evolução mensal
  const evolucaoMensal = []
  for (let i = 0; i < 12; i++) {
    const mes = i + 1
    const receitasMes = receitasData
      .filter(item => new Date(item.data).getMonth() + 1 === mes && new Date(item.data).getFullYear() === filtroAno)
      .reduce((sum, item) => sum + parseFloat(item.valor), 0)
    
    const despesasMes = despesasData
      .filter(item => new Date(item.data).getMonth() + 1 === mes && new Date(item.data).getFullYear() === filtroAno)
      .reduce((sum, item) => sum + parseFloat(item.valor), 0)

    evolucaoMensal.push({
      mes: new Date(filtroAno, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
      receitas: receitasMes,
      despesas: despesasMes,
      saldo: receitasMes - despesasMes
    })
  }

  const totalReceitas = receitasFiltradas.reduce((sum, item) => sum + parseFloat(item.valor), 0)
  const totalDespesas = despesasFiltradas.reduce((sum, item) => sum + parseFloat(item.valor), 0)
  const saldo = totalReceitas - totalDespesas

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada das suas finanças</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Mês:</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(parseInt(e.target.value))}
              className="input-field w-auto"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(filtroAno, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Ano:</label>
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(parseInt(e.target.value))}
              className="input-field w-auto"
            >
              {Array.from({length: 6}, (_, i) => {
                const year = new Date().getFullYear() - i
                return (
                  <option key={year} value={year}>{year}</option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Resumo do período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Receitas do Período</p>
            <p className="text-2xl font-bold text-success-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Despesas do Período</p>
            <p className="text-2xl font-bold text-danger-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Saldo do Período</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por categoria */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Receitas vs Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Bar dataKey="receitas" fill="#22c55e" />
              <Bar dataKey="despesas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pizza das despesas */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição de Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolução mensal */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução Mensal - {filtroAno}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={evolucaoMensal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Line type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="saldo" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de resumo */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo por Categoria</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Despesas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosBarras.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success-600">
                    R$ {item.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-600">
                    R$ {item.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    (item.receitas - item.despesas) >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    R$ {(item.receitas - item.despesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Relatorios
