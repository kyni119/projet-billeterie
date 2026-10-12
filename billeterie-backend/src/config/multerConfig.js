const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Dossier de destination
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Extension déduite du type MIME validé (jamais du nom fourni par le client)
    cb(null, file.fieldname + '-' + uniqueSuffix + EXTENSIONS[file.mimetype]);
  }
});

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Filtrage des fichiers : formats raster uniquement (pas de SVG, qui peut contenir du script)
const fileFilter = (req, file, cb) => {
  if (Object.hasOwn(EXTENSIONS, file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Seules les images JPEG, PNG, WebP ou GIF sont acceptées');
    err.status = 400;
    cb(err, false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = upload;