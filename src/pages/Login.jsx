import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { DollarSign, Eye, EyeOff, Check, X } from 'lucide-react'
import { auth } from '../supabase/client'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  // Validações de senha
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  const isPasswordValid = Object.values(passwordValidations).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword !== ''

  // Verificar se já está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await auth.getCurrentUser()
      if (data.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações para cadastro
    if (!isLogin) {
      if (!isPasswordValid) {
        setError('A senha não atende aos requisitos mínimos de segurança.')
        setLoading(false)
        return
      }

      if (!passwordsMatch) {
        setError('As senhas não coincidem.')
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        const { data, error } = await auth.signIn(email, password)
        if (error) {
          console.error('Erro de login:', error)
          throw error
        }
        if (data.user) {
          setUser(data.user)
        }
      } else {
        const { data, error } = await auth.signUp(email, password)
        if (error) {
          console.error('Erro de cadastro:', error)
          throw error
        }
        setError('✅ Conta criada com sucesso! Verifique seu email para confirmar a conta.')
      }
    } catch (error) {
      console.error('Erro completo:', error)

      // Mensagens de erro mais amigáveis
      let errorMessage = error.message

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.'
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (error.message?.includes('Unable to validate email address')) {
        errorMessage = 'Email inválido. Verifique o formato do email.'
      } else if (error.message?.includes('signup is disabled')) {
        errorMessage = 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Acesse seu controle financeiro' : 'Comece a controlar suas finanças'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-field pr-10 ${
                    !isLogin && password && !isPasswordValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : !isLogin && password && isPasswordValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Campo de confirmação de senha (apenas no cadastro) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`input-field pr-10 ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : confirmPassword && passwordsMatch
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                          : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600">As senhas não coincidem</p>
                )}
              </div>
            )}

            {/* Indicadores de requisitos de senha (apenas no cadastro) */}
            {!isLogin && password && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Requisitos da senha:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {passwordValidations.minLength ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${passwordValidations.minLength ? 'text-green-700' : 'text-red-600'}`}>
                      Pelo menos 8 caracteres
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {passwordValidations.hasUppercase ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${passwordValidations.hasUppercase ? 'text-green-700' : 'text-red-600'}`}>
                      Uma letra maiúscula (A-Z)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {passwordValidations.hasLowercase ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${passwordValidations.hasLowercase ? 'text-green-700' : 'text-red-600'}`}>
                      Uma letra minúscula (a-z)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {passwordValidations.hasNumber ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${passwordValidations.hasNumber ? 'text-green-700' : 'text-red-600'}`}>
                      Um número (0-9)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {passwordValidations.hasSpecial ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${passwordValidations.hasSpecial ? 'text-green-700' : 'text-red-600'}`}>
                      Um caractere especial (!@#$%^&*)
                    </span>
                  </div>
                </div>

                {/* Indicador de força da senha */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Força da senha:</span>
                    <span className={`text-xs font-medium ${
                      Object.values(passwordValidations).filter(Boolean).length >= 4
                        ? 'text-green-600'
                        : Object.values(passwordValidations).filter(Boolean).length >= 2
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {Object.values(passwordValidations).filter(Boolean).length >= 4
                        ? 'Forte'
                        : Object.values(passwordValidations).filter(Boolean).length >= 2
                          ? 'Média'
                          : 'Fraca'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Object.values(passwordValidations).filter(Boolean).length >= 4
                          ? 'bg-green-500 w-full'
                          : Object.values(passwordValidations).filter(Boolean).length >= 2
                            ? 'bg-yellow-500 w-2/3'
                            : 'bg-red-500 w-1/3'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className={`rounded-md p-4 ${
              error.includes('✅')
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-sm ${
                error.includes('✅') ? 'text-green-700' : 'text-red-700'
              }`}>
                {error}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (!isLogin && (!isPasswordValid || !passwordsMatch))}
              className="btn-primary w-full flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </button>

            {/* Texto explicativo para o botão desabilitado */}
            {!isLogin && (!isPasswordValid || !passwordsMatch) && (
              <p className="mt-2 text-xs text-gray-500 text-center">
                Complete todos os requisitos de senha para continuar
              </p>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
