import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const UPLOADS_DIR = join(__dirname, 'uploads');
const PROJECTS_FILE = join(__dirname, 'projects.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/sla' || 
        file.originalname.endsWith('.stl') ||
        file.mimetype === 'model/sla') {
      cb(null, true);
    } else {
      cb(new Error('Only STL files are allowed'), false);
    }
  }
});

const readProjects = () => {
  try {
    const data = readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeProjects = (projects) => {
  writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
};

app.get('/api/projects', (req, res) => {
  const projects = readProjects();
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readProjects();
  const project = projects.find(p => p.id === req.params.id);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

app.post('/api/projects', upload.single('stlFile'), (req, res) => {
  try {
    const { title, description, useCases } = req.body;
    const parsedUseCases = typeof useCases === 'string' ? JSON.parse(useCases) : useCases || [];
    
    const projects = readProjects();
    const newProject = {
      id: uuidv4(),
      title,
      description,
      useCases: parsedUseCases,
      stlFileName: req.file ? req.file.filename : null,
      dateAdded: new Date().toISOString()
    };
    
    projects.unshift(newProject);
    writeProjects(projects);
    
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  const projects = readProjects();
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const deletedProject = projects.splice(index, 1)[0];
  writeProjects(projects);
  
  res.json({ message: 'Project deleted', project: deletedProject });
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = join(UPLOADS_DIR, filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});