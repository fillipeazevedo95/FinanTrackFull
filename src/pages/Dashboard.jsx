import { useState, useEffect, useMemo, useCallback } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { receitas, despesas, auth } from '../supabase/client'
import { useUser } from '../contexts/UserContext'

const Dashboard = () => {
  const { user, formatCurrency } = useUser()
  const [receitasData, setReceitasData] = useState([])
  const [despesasData, setDespesasData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear())

  // Função para carregar dados (memoizada)
  const loadUserData = useCallback(async (userId) => {
    try {
      const [receitasResult, despesasResult] = await Promise.all([
        receitas.getAll(userId),
        despesas.getAll(userId)
      ])

      setReceitasData(receitasResult.data || [])
      setDespesasData(despesasResult.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar dados quando usuário estiver disponível
  useEffect(() => {
    if (user?.id) {
      loadUserData(user.id)
    } else {
      setLoading(false)
    }
  }, [user?.id, loadUserData])



  // Filtrar dados por período selecionado (memoizado)
  const receitasFiltradas = useMemo(() => {
    return receitasData.filter(item => {
      const itemDate = new Date(item.data)
      return itemDate.getMonth() + 1 === filtroMes && itemDate.getFullYear() === filtroAno
    })
  }, [receitasData, filtroMes, filtroAno])

  const despesasFiltradas = useMemo(() => {
    return despesasData.filter(item => {
      const itemDate = new Date(item.data)
      return itemDate.getMonth() + 1 === filtroMes && itemDate.getFullYear() === filtroAno
    })
  }, [despesasData, filtroMes, filtroAno])

  // Calcular totais do período selecionado (memoizado)
  const { totalReceitas, totalDespesas, totalDespesasPendentes, saldo } = useMemo(() => {
    const receitas = receitasFiltradas.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0)
    const despesasPagas = despesasFiltradas
      .filter(item => item.is_paid === true)
      .reduce((sum, item) => sum + parseFloat(item.valor || 0), 0)
    const despesasPendentes = despesasFiltradas
      .filter(item => item.is_paid === false)
      .reduce((sum, item) => sum + parseFloat(item.valor || 0), 0)

    return {
      totalReceitas: receitas,
      totalDespesas: despesasPagas,
      totalDespesasPendentes: despesasPendentes,
      saldo: receitas - despesasPagas
    }
  }, [receitasFiltradas, despesasFiltradas])



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral das suas finanças</p>
        </div>

        {/* Filtros de Período */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(filtroAno, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(parseInt(e.target.value))}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
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



      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receitas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalReceitas)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas Pagas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalDespesas)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalDespesasPendentes)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`rounded-lg p-3 ${saldo >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <DollarSign className={`h-6 w-6 ${saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>
        </div>


      </div>



      {/* Transações recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transações do Mês</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="space-y-3">
          {(() => {
            // Combinar receitas e despesas com tipo identificado
            const allTransactions = [
              ...receitasData.map(item => ({ ...item, tipo: 'receita' })),
              ...despesasData.map(item => ({ ...item, tipo: 'despesa' }))
            ]

            // Filtrar transações do mês atual
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            const currentMonthTransactions = allTransactions.filter(item => {
              const itemDate = new Date(item.data)
              return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
            })

            // Ordenar por data (mais recente primeiro) e pegar as 5 primeiras
            return currentMonthTransactions
              .sort((a, b) => new Date(b.data) - new Date(a.data))
              .slice(0, 5)
              .map((item, index) => (
                <div key={`${item.tipo}-${item.id}-${index}`} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.tipo === 'receita'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {item.tipo === 'receita' ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.descricao}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      item.tipo === 'receita'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {item.tipo === 'receita' ? '+' : '-'}{formatCurrency(parseFloat(item.valor))}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
          })()}

          {/* Mensagem quando não há transações do mês atual */}
          {(() => {
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            const hasCurrentMonthTransactions = [
              ...receitasData.map(item => ({ ...item, tipo: 'receita' })),
              ...despesasData.map(item => ({ ...item, tipo: 'despesa' }))
            ].some(item => {
              const itemDate = new Date(item.data)
              return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
            })

            if (!hasCurrentMonthTransactions) {
              return (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    Nenhuma transação neste mês
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Adicione receitas e despesas para ver suas transações de {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
                  </p>
                </div>
              )
            }
            return null
          })()}
        </div>
      </div>


    </div>
  )
}

export default Dashboard
