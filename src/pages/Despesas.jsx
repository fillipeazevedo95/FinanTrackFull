import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { despesas, auth } from '../supabase/client'

const Despesas = () => {
  const [user, setUser] = useState(null)
  const [despesasData, setDespesasData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0]
  })

  const categorias = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Outros'
  ]

  useEffect(() => {
    loadDespesas()
  }, [])

  const loadDespesas = async () => {
    try {
      const { data: userData } = await auth.getCurrentUser()
      setUser(userData.user)

      if (userData.user) {
        const { data, error } = await despesas.getAll(userData.user.id)
        if (error) throw error
        setDespesasData(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    try {
      const despesaData = {
        ...formData,
        valor: parseFloat(formData.valor),
        user_id: user.id
      }

      if (editingItem) {
        const { error } = await despesas.update(editingItem.id, despesaData)
        if (error) throw error
      } else {
        const { error } = await despesas.create(despesaData)
        if (error) throw error
      }

      setShowModal(false)
      setEditingItem(null)
      setFormData({
        descricao: '',
        valor: '',
        categoria: '',
        data: new Date().toISOString().split('T')[0]
      })
      loadDespesas()
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      descricao: item.descricao,
      valor: item.valor.toString(),
      categoria: item.categoria,
      data: item.data
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        const { error } = await despesas.delete(id)
        if (error) throw error
        loadDespesas()
      } catch (error) {
        console.error('Erro ao excluir despesa:', error)
      }
    }
  }

  const filteredDespesas = despesasData.filter(item =>
    item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalDespesas = filteredDespesas.reduce((sum, item) => sum + parseFloat(item.valor), 0)

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
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600">Controle seus gastos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Resumo */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Despesas</p>
            <p className="text-3xl font-bold text-danger-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{filteredDespesas.length} despesas</p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lista de despesas */}
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
              {filteredDespesas.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.descricao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-danger-100 text-danger-800">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-danger-600">
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
                      onClick={() => handleDelete(item.id)}
                      className="text-danger-600 hover:text-danger-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDespesas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma despesa encontrada</p>
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
                    {editingItem ? 'Editar Despesa' : 'Nova Despesa'}
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
                        placeholder="Ex: Supermercado"
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
                        data: new Date().toISOString().split('T')[0]
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
    </div>
  )
}

export default Despesas
