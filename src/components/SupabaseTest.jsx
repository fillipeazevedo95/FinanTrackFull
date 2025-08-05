import { useState } from 'react'
import { supabase } from '../supabase/client'

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setTestResult('Testando conexão...')
    
    try {
      // Teste básico de conexão
      const { data, error } = await supabase.from('receitas').select('count', { count: 'exact', head: true })
      
      if (error) {
        setTestResult(`❌ Erro na conexão: ${error.message}`)
      } else {
        setTestResult('✅ Conexão com Supabase funcionando!')
      }
    } catch (error) {
      setTestResult(`❌ Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    setTestResult('Testando autenticação...')
    
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`❌ Erro na autenticação: ${error.message}`)
      } else {
        setTestResult('✅ Sistema de autenticação funcionando!')
      }
    } catch (error) {
      setTestResult(`❌ Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-medium text-gray-900 mb-2">Teste Supabase</h3>
      
      <div className="space-y-2 mb-3">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full btn-secondary text-xs py-1"
        >
          Testar Conexão
        </button>
        
        <button
          onClick={testAuth}
          disabled={loading}
          className="w-full btn-secondary text-xs py-1"
        >
          Testar Auth
        </button>
      </div>
      
      {testResult && (
        <div className="text-xs p-2 bg-gray-50 rounded border">
          {testResult}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <div>URL: {import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...</div>
        <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)}...</div>
      </div>
    </div>
  )
}

export default SupabaseTest
