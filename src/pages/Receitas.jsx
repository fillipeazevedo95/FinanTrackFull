import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react'
import { receitas, auth } from '../supabase/client'

const Receitas = () => {
  const [user, setUser] = useState(null)
  const [receitasData, setReceitasData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear())
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [recurringAction, setRecurringAction] = useState(null) // 'edit' ou 'delete'
  const [selectedRecurringItem, setSelectedRecurringItem] = useState(null)
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurrenceType: '',
    recurrenceCount: ''
  })

  const categorias = [
    'Salário',
    'Freelance',
    'Investimentos',
    'Vendas',
    'Outros'
  ]

  useEffect(() => {
    loadReceitas()
  }, [])

  const loadReceitas = async () => {
    try {
      const { data: userData } = await auth.getCurrentUser()
      setUser(userData.user)

      if (userData.user) {
        const { data, error } = await receitas.getAll(userData.user.id)
        if (error) throw error
        setReceitasData(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    try {
      const receitaData = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        data: formData.data,
        user_id: user.id
      }

      if (editingItem) {
        const { error } = await receitas.update(editingItem.id, receitaData)
        if (error) throw error
      } else {
        // Verificar se é transação recorrente
        if (formData.isRecurring && formData.recurrenceType) {
          const recurrenceCount = formData.recurrenceType === 'custom_repeat'
            ? parseInt(formData.recurrenceCount)
            : null

          const { error } = await receitas.createRecurring(
            receitaData,
            formData.recurrenceType,
            recurrenceCount
          )
          if (error) throw error
        } else {
          const { error } = await receitas.create(receitaData)
          if (error) throw error
        }
      }

      setShowModal(false)
      setEditingItem(null)
      setFormData({
        descricao: '',
        valor: '',
        categoria: '',
        data: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurrenceType: '',
        recurrenceCount: ''
      })
      loadReceitas()
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
    }
  }

  const handleEdit = (item) => {
    if (item.is_recurring) {
      setSelectedRecurringItem(item)
      setRecurringAction('edit')
      setShowRecurringModal(true)
    } else {
      setEditingItem(item)
      setFormData({
        descricao: item.descricao,
        valor: item.valor.toString(),
        categoria: item.categoria,
        data: item.data,
        isRecurring: false,
        recurrenceType: '',
        recurrenceCount: ''
      })
      setShowModal(true)
    }
  }

  const handleDelete = async (item) => {
    if (item.is_recurring) {
      setSelectedRecurringItem(item)
      setRecurringAction('delete')
      setShowRecurringModal(true)
    } else {
      if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
        try {
          const { error } = await receitas.delete(item.id)
          if (error) throw error
          loadReceitas()
        } catch (error) {
          console.error('Erro ao excluir receita:', error)
        }
      }
    }
  }

  const handleRecurringAction = async (actionType, scope) => {
    try {
      if (actionType === 'delete') {
        if (scope === 'single') {
          const { error } = await receitas.delete(selectedRecurringItem.id)
          if (error) throw error
        } else if (scope === 'all') {
          const { error } = await receitas.deleteRecurringSeries(selectedRecurringItem.recurrence_group_id)
          if (error) throw error
        }
        loadReceitas()
      } else if (actionType === 'edit') {
        if (scope === 'single') {
          setEditingItem(selectedRecurringItem)
          setFormData({
            descricao: selectedRecurringItem.descricao,
            valor: selectedRecurringItem.valor.toString(),
            categoria: selectedRecurringItem.categoria,
            data: selectedRecurringItem.data,
            isRecurring: false,
            recurrenceType: '',
            recurrenceCount: ''
          })
          setShowModal(true)
        }
        // Para 'all', seria necessário implementar uma lógica mais complexa
      }
      setShowRecurringModal(false)
      setSelectedRecurringItem(null)
      setRecurringAction(null)
    } catch (error) {
      console.error('Erro ao processar ação recorrente:', error)
    }
  }

  // Filtrar por período e busca
  const filteredReceitas = receitasData.filter(item => {
    const itemDate = new Date(item.data)
    const matchesPeriod = itemDate.getMonth() + 1 === filtroMes && itemDate.getFullYear() === filtroAno
    const matchesSearch = item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPeriod && matchesSearch
  })

  const totalReceitas = filteredReceitas.reduce((sum, item) => sum + parseFloat(item.valor), 0)

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
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">Gerencie suas fontes de renda</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Filtros de Período */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
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
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nova Receita</span>
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Receitas</p>
            <p className="text-3xl font-bold text-success-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{filteredReceitas.length} receitas</p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lista de receitas */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceitas.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">{item.descricao}</div>
                      {item.is_recurring && (
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.recurrence_type === 'fixed_monthly' ? 'Mensal' : 'Recorrente'}
                          </span>
                          {item.recurrence_type === 'custom_repeat' && item.recurrence_count && (
                            <span className="text-xs text-gray-500">
                              ({item.recurrence_count}x)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-success-100 text-success-800">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-success-600">
                      R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-danger-600 hover:text-danger-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReceitas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma receita encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingItem ? 'Editar Receita' : 'Nova Receita'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <input
                        type="text"
                        required
                        value={formData.descricao}
                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        className="input-field mt-1"
                        placeholder="Ex: Salário mensal"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.valor}
                        onChange={(e) => setFormData({...formData, valor: e.target.value})}
                        className="input-field mt-1"
                        placeholder="0,00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Categoria</label>
                      <select
                        required
                        value={formData.categoria}
                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                        className="input-field mt-1"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data</label>
                      <input
                        type="date"
                        required
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        className="input-field mt-1"
                      />
                    </div>

                    {/* Campos de Recorrência */}
                    {!editingItem && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Configurações de Recorrência</h4>

                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isRecurring"
                              checked={formData.isRecurring}
                              onChange={(e) => setFormData({
                                ...formData,
                                isRecurring: e.target.checked,
                                recurrenceType: e.target.checked ? formData.recurrenceType : '',
                                recurrenceCount: e.target.checked ? formData.recurrenceCount : ''
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                              Esta é uma receita recorrente
                            </label>
                          </div>

                          {formData.isRecurring && (
                            <div className="ml-6 space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Tipo de Recorrência
                                </label>
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id="fixed_monthly"
                                      name="recurrenceType"
                                      value="fixed_monthly"
                                      checked={formData.recurrenceType === 'fixed_monthly'}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        recurrenceType: e.target.value,
                                        recurrenceCount: ''
                                      })}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="fixed_monthly" className="ml-2 text-sm text-gray-700">
                                      Fixa Mensal (12 meses)
                                    </label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id="custom_repeat"
                                      name="recurrenceType"
                                      value="custom_repeat"
                                      checked={formData.recurrenceType === 'custom_repeat'}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        recurrenceType: e.target.value
                                      })}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="custom_repeat" className="ml-2 text-sm text-gray-700">
                                      Repetição Personalizada
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {formData.recurrenceType === 'custom_repeat' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Número de Repetições
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    required
                                    value={formData.recurrenceCount}
                                    onChange={(e) => setFormData({...formData, recurrenceCount: e.target.value})}
                                    className="input-field mt-1 w-24"
                                    placeholder="Ex: 6"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Máximo de 60 repetições
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    {editingItem ? 'Atualizar' : 'Salvar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingItem(null)
                      setFormData({
                        descricao: '',
                        valor: '',
                        categoria: '',
                        data: new Date().toISOString().split('T')[0],
                        isRecurring: false,
                        recurrenceType: '',
                        recurrenceCount: ''
                      })
                    }}
                    className="btn-secondary mt-3 sm:mt-0"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Transações Recorrentes */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {recurringAction === 'edit' ? 'Editar Receita Recorrente' : 'Excluir Receita Recorrente'}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Esta receita faz parte de uma série recorrente. O que você gostaria de fazer?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleRecurringAction(recurringAction, 'single')}
                  className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {recurringAction === 'edit' ? 'Editar apenas esta receita' : 'Excluir apenas esta receita'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {recurringAction === 'edit'
                      ? 'Modificar somente esta instância da receita recorrente'
                      : 'Remove apenas esta instância, mantendo as outras'
                    }
                  </div>
                </button>

                <button
                  onClick={() => handleRecurringAction(recurringAction, 'all')}
                  className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {recurringAction === 'edit' ? 'Editar toda a série' : 'Excluir toda a série'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {recurringAction === 'edit'
                      ? 'Modificar todas as receitas desta série recorrente'
                      : 'Remove todas as receitas desta série recorrente'
                    }
                  </div>
                </button>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRecurringModal(false)
                    setSelectedRecurringItem(null)
                    setRecurringAction(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Receitas
