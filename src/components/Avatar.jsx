import { useState } from 'react'
import { User, Upload, X } from 'lucide-react'

const Avatar = ({ 
  src, 
  alt = "Avatar do usuário", 
  size = "md", 
  editable = false, 
  onUpload = null,
  onRemove = null 
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Tamanhos do avatar
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-20 w-20",
    xl: "h-32 w-32"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10", 
    xl: "h-16 w-16"
  }

  const handleFileSelect = async (file) => {
    if (!file || !onUpload) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione uma imagem válida (JPG, PNG ou GIF)')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    setIsUploading(true)
    try {
      await onUpload(file)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="relative">
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          overflow-hidden 
          bg-gray-200 
          flex 
          items-center 
          justify-center
          ${editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          ${dragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
        onDrop={editable ? handleDrop : undefined}
        onDragOver={editable ? handleDragOver : undefined}
        onDragLeave={editable ? handleDragLeave : undefined}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-gray-400`} />
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {editable && (
        <div className="absolute -bottom-1 -right-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
            <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-colors">
              <Upload className="h-3 w-3" />
            </div>
          </label>
        </div>
      )}

      {editable && src && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors"
          disabled={isUploading}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export default Avatar
