import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import STLViewer from '../components/STLViewer'

const ProjectDetail = () => {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`)
      setProject(response.data)
    } catch (err) {
      setError('Project not found')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (project?.stlFileName) {
      window.location.href = `/download/${project.stlFileName}`
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Project Not Found</h2>
        <p>The project you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to Gallery</Link>
      </div>
    )
  }

  return (
    <div className="project-detail">
      <Link to="/" className="back-link">
        <span>←</span> Back to Gallery
      </Link>

      <div className="detail-container">
        <div className="detail-viewer">
          <STLViewer filename={project.stlFileName} height="450px" />
        </div>

        <div className="detail-info">
          <h1>{project.title}</h1>
          
          <div className="detail-meta">
            <span className="meta-label">Added: </span>
            <span className="meta-value">{formatDate(project.dateAdded)}</span>
          </div>

          <div className="detail-section">
            <h2>Description</h2>
            <p className="description-text">{project.description}</p>
          </div>

          {project.useCases && project.useCases.length > 0 && (
            <div className="detail-section">
              <h2>Use Cases</h2>
              <ul className="use-cases-list">
                {project.useCases.map((useCase, index) => (
                  <li key={index}>{useCase}</li>
                ))}
              </ul>
            </div>
          )}

          {project.stlFileName && (
            <button onClick={handleDownload} className="btn-download">
              <span className="download-icon">↓</span>
              Download STL
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail