import React, { useState } from 'react';
import { Card, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const Step5ImageUpload = ({ initialData = {}, onBack, onNext }) => {
  const [file, setFile] = useState(initialData?.imageFile || null);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Seuls les fichiers images sont autorisés');
      return Upload.LIST_IGNORE;
    }

    setFile(file);
    return false; // Empêche Antd d’uploader automatiquement
  };

  const handleNext = () => {
    if (!file) {
      return message.error("Veuillez sélectionner une image");
    }
    // On passe le fichier sélectionné à l'étape suivante
    onNext({ imageFile: file });
  };

  return (
    <Card title="Image de l'événement">
      <Upload
        beforeUpload={handleBeforeUpload}
        maxCount={1}
        showUploadList={file ? [{ name: file.name }] : false}
      >
        <Button icon={<UploadOutlined />}>Choisir une image</Button>
      </Upload>

      <div className="flex justify-between pt-6">
        <Button onClick={onBack}>Retour</Button>
        <Button type="primary" onClick={handleNext}>
          Suivant
        </Button>
      </div>
    </Card>
  );
};

export default Step5ImageUpload;
