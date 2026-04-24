import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const AddProject = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [useCases, setUseCases] = useState([''])
  const [stlFile, setStlFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addUseCase = () => {
    setUseCases([...useCases, ''])
  }

  const removeUseCase = (index) => {
    if (useCases.length > 1) {
      setUseCases(useCases.filter((_, i) => i !== index))
    }
  }

  const updateUseCase = (index, value) => {
    const newUseCases = [...useCases]
    newUseCases[index] = value
    setUseCases(newUseCases)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && (file.name.endsWith('.stl') || file.type === 'application/sla')) {
      setStlFile(file)
      setError(null)
    } else {
      setError('Please select a valid STL file')
      setStlFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!stlFile) {
      setError('STL file is required')
      return
    }

    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('useCases', JSON.stringify(useCases.filter(uc => uc.trim() !== '')))
    formData.append('stlFile', stlFile)

    try {
      const response = await axios.post('/api/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      showToast('Project added successfully!')
      setTimeout(() => {
        navigate(`/project/${response.data.id}`)
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-project-page">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <Link to="/" className="back-link">
        <span>←</span> Back to Gallery
      </Link>

      <div className="form-container">
        <h1>Add New Project</h1>
        <p className="form-subtitle">Share your 3D printed creation with the world</p>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="title">Project Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your 3D printed project..."
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label>Use Cases</label>
            <div className="use-cases-container">
              {useCases.map((useCase, index) => (
                <div key={index} className="use-case-input">
                  <input
                    type="text"
                    value={useCase}
                    onChange={(e) => updateUseCase(index, e.target.value)}
                    placeholder={`Use case ${index + 1}`}
                  />
                  {useCases.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeUseCase(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-use-case" onClick={addUseCase}>
                + Add Use Case
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="stlFile">STL File</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="stlFile"
                accept=".stl,application/sla"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="stlFile" className="file-upload-label">
                <span className="upload-icon">↑</span>
                {stlFile ? stlFile.name : 'Choose STL file'}
              </label>
              {stlFile && (
                <span className="file-selected">✓ Selected</span>
              )}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <Link to="/" className="btn-cancel">Cancel</Link>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProject