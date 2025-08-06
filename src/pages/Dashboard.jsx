import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { receitas, despesas, auth } from '../supabase/client'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [receitasData, setReceitasData] = useState([])
  const [despesasData, setDespesasData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    loadData()
  }, [])

  // Calcular totais (apenas despesas pagas)
  const totalReceitas = receitasData.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0)
  const totalDespesas = despesasData
    .filter(item => item.is_paid === true)
    .reduce((sum, item) => sum + parseFloat(item.valor || 0), 0)
  const totalDespesasPendentes = despesasData
    .filter(item => item.is_paid === false)
    .reduce((sum, item) => sum + parseFloat(item.valor || 0), 0)
  const saldo = totalReceitas - totalDespesas

  // Função para processar dados por mês
  const processMonthlyData = () => {
    const monthlyData = {}
    const currentYear = new Date().getFullYear()

    // Inicializar todos os meses
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleDateString('pt-BR', { month: 'short' })
      monthlyData[monthName] = { receitas: 0, despesas: 0 }
    }

    // Processar receitas
    receitasData.forEach(item => {
      const itemDate = new Date(item.data)
      if (itemDate.getFullYear() === currentYear) {
        const monthName = itemDate.toLocaleDateString('pt-BR', { month: 'short' })
        if (monthlyData[monthName]) {
          monthlyData[monthName].receitas += parseFloat(item.valor)
        }
      }
    })

    // Processar despesas (apenas pagas)
    despesasData
      .filter(item => item.is_paid === true)
      .forEach(item => {
        const itemDate = new Date(item.data)
        if (itemDate.getFullYear() === currentYear) {
          const monthName = itemDate.toLocaleDateString('pt-BR', { month: 'short' })
          if (monthlyData[monthName]) {
            monthlyData[monthName].despesas += parseFloat(item.valor)
          }
        }
      })

    return Object.entries(monthlyData).map(([mes, data]) => ({
      mes,
      receitas: data.receitas,
      despesas: data.despesas
    }))
  }

  // Função para processar dados de categorias de despesas
  const processCategoryData = () => {
    const categoryData = {}
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

    despesasData
      .filter(item => item.is_paid === true)
      .forEach(item => {
        if (categoryData[item.categoria]) {
          categoryData[item.categoria] += parseFloat(item.valor)
        } else {
          categoryData[item.categoria] = parseFloat(item.valor)
        }
      })

    return Object.entries(categoryData).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
  }

  // Dados para os gráficos baseados em dados reais
  const chartData = processMonthlyData()
  const pieData = processCategoryData()

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Receitas</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Despesas Pagas</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Despesas Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalDespesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className={`h-8 w-8 ${saldo >= 0 ? 'text-success-600' : 'text-danger-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Saldo</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de linha */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Receitas vs Despesas - {new Date().getFullYear()}</h3>
          {(receitasData.length > 0 || despesasData.length > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name === 'receitas' ? 'Receitas' : 'Despesas'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="receitas"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p>Nenhuma transação cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Adicione receitas e despesas para ver a evolução mensal</p>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de pizza */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas por Categoria</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>Nenhuma despesa cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Adicione despesas para ver a distribuição por categoria</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transações recentes */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transações Recentes</h3>
        <div className="space-y-3">
          {(() => {
            // Combinar receitas e despesas com tipo identificado
            const allTransactions = [
              ...receitasData.map(item => ({ ...item, tipo: 'receita' })),
              ...despesasData.map(item => ({ ...item, tipo: 'despesa' }))
            ]

            // Ordenar por data (mais recente primeiro) e pegar as 5 primeiras
            return allTransactions
              .sort((a, b) => new Date(b.data) - new Date(a.data))
              .slice(0, 5)
              .map((item, index) => (
                <div key={`${item.tipo}-${item.id}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      item.tipo === 'receita' ? 'bg-success-500' : 'bg-danger-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{item.descricao}</p>
                      <p className="text-sm text-gray-500">{item.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      item.tipo === 'receita' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {item.tipo === 'receita' ? '+' : '-'}R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
          })()}

          {/* Mensagem quando não há transações */}
          {receitasData.length === 0 && despesasData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-400 mt-1">Adicione receitas e despesas para ver o resumo aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
