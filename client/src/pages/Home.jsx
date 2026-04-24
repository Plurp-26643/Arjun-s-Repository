import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import STLViewer from '../components/STLViewer'

const Home = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      <header className="hero">
        <h1>3D Printed Projects</h1>
        <p>Explore our collection of meticulously crafted 3D printed creations</p>
      </header>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◇</div>
          <h2>No Projects Yet</h2>
          <p>Be the first to share your 3D printed creation!</p>
          <Link to="/add" className="btn-primary">Add Your First Project</Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="card-preview">
                <STLViewer 
                  filename={project.stlFileName} 
                  height="200px"
                />
              </div>
              <div className="card-content">
                <h3>{project.title}</h3>
                <p className="card-description">
                  {project.description.length > 100 
                    ? `${project.description.substring(0, 100)}...` 
                    : project.description}
                </p>
                <div className="card-meta">
                  <span className="date-label">{formatDate(project.dateAdded)}</span>
                </div>
                <Link to={`/project/${project.id}`} className="btn-view">
                  View Project
                  <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home