import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const STLViewer = ({ filename, height = '400px', showPlaceholder = false }) => {
  const containerRef = useRef(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const h = height || '400px'

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111318)

    const camera = new THREE.PerspectiveCamera(45, width / parseInt(h), 0.1, 1000)
    camera.position.set(5, 5, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, parseInt(h))
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x00aaff, 1)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0x00e5ff, 0.5)
    directionalLight2.position.set(-1, -1, -1)
    scene.add(directionalLight2)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1
    controls.maxDistance = 50

    let model = null
    const material = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      specular: 0x111111,
      shininess: 200
    })

    const loadModel = () => {
      if (!filename && !showPlaceholder) {
        setLoading(false)
        return
      }

      if (!filename || error || showPlaceholder) {
        createPlaceholder()
        setLoading(false)
        return
      }

      const loader = new STLLoader()
      loader.load(
        `/uploads/${filename}`,
        (geometry) => {
          geometry.computeVertexNormals()

          const center = new THREE.Vector3()
          geometry.computeBoundingBox()
          geometry.boundingBox.getCenter(center)
          geometry.translate(-center.x, -center.y, -center.z)

          const maxDim = Math.max(
            geometry.boundingBox.max.x - geometry.boundingBox.min.x,
            geometry.boundingBox.max.y - geometry.boundingBox.min.y,
            geometry.boundingBox.max.z - geometry.boundingBox.min.z
          )
          const scale = 10 / maxDim
          geometry.scale(scale, scale, scale)

          if (model) scene.remove(model)

          model = new THREE.Mesh(geometry, material)
          scene.add(model)

          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3())
          const maxSize = Math.max(size.x, size.y, size.z)
          camera.position.set(maxSize * 2, maxSize * 2, maxSize * 2)
          camera.lookAt(0, 0, 0)
          controls.update()
          setLoading(false)
        },
        undefined,
        (err) => {
          console.error('STL loading error:', err)
          setError(true)
          createPlaceholder()
          setLoading(false)
        }
      )
    }

    const createPlaceholder = () => {
      const geometry = new THREE.BoxGeometry(3, 3, 3)
      const wireframe = new THREE.WireframeGeometry(geometry)
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00e5ff, 
        linewidth: 2 
      })
      const wireframeObj = new THREE.LineSegments(wireframe, lineMaterial)
      wireframeObj.rotation.x = Math.PI / 4
      wireframeObj.rotation.y = Math.PI / 4
      scene.add(wireframeObj)
      model = wireframeObj

      camera.position.set(8, 8, 8)
      camera.lookAt(0, 0, 0)
      controls.update()
    }

    if (filename && !error) {
      loadModel()
    } else {
      createPlaceholder()
      setLoading(false)
    }

    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (model && !filename || error || showPlaceholder) {
        model.rotation.y += 0.005
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const newWidth = container.clientWidth
      renderer.setSize(newWidth, parseInt(h))
      camera.aspect = newWidth / parseInt(h)
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [filename, error, showPlaceholder])

  return (
    <div className="stl-viewer-container">
      {loading && <div className="stl-loading">Loading 3D model...</div>}
      {error && <div className="stl-error-label">Preview Unavailable</div>}
      <div ref={containerRef} style={{ height }} />
    </div>
  )
}

export default STLViewer