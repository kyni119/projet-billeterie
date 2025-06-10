import React, { useState , useEffect } from 'react';
import { Form, Input, Select, Button, Card, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const paymentOptions = [
  { value: 'moov', label: 'Moov Money' },
  { value: 'orange', label: 'Orange Money' },
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'djamo', label: 'Djamo' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
];

const Step4And5Combined = ({ initialData = {}, onNext, onBack }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(initialData?.imageFile || null);


  useEffect(() => {
  // Réinjecte les valeurs dans le formulaire à chaque fois qu'on revient
  if (initialData?.payment) {
    form.setFieldsValue(initialData.payment);
  }

  // Recharge l’image si on revient
  if (initialData?.imageFile) {
    setFile(initialData.imageFile);
  } else {
    const base64 = localStorage.getItem('eventImage');
    if (base64 && !file) {
      fetch(base64)
        .then(res => res.blob())
        .then(blob => {
          const restoredFile = new File([blob], 'image.jpg', { type: blob.type });
          setFile(restoredFile);
        });
    }
  }
}, [initialData, form]);


useEffect(() => {
  const base64 = localStorage.getItem('eventImage');

  if (base64 && !file) {
    // Crée une "fake" image file à partir du base64 juste pour l'aperçu
    fetch(base64)
      .then(res => res.blob())
      .then(blob => {
        const fakeFile = new File([blob], "image.jpg", { type: blob.type });
        setFile(fakeFile);
      });
  }
}, []);



  const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('Seuls les fichiers images sont autorisés');
    return Upload.LIST_IGNORE;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    localStorage.setItem('eventImage', reader.result); // base64
    setFile(file); // toujours garder le File dans state pour l’upload final
  };
  reader.readAsDataURL(file);
  return false; 
};

  const handleFinish = (values) => {
    if (!file) {
      message.error("Veuillez sélectionner une image pour l'événement");
      return;
    }
    // on envoie tout : données paiement + fichier image
    onNext({ payment: values, imageFile: file });

  };

  return (
    <Card title="Méthode de paiement de vos recettes & Image de l'événement">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialData}
        onFinish={handleFinish}
      >
        {/* Partie méthode de paiement */}
        <Form.Item
          label="Comment voulez vous etes payé ? "
          name="payment_type"
          rules={[{ required: true, message: 'Veuillez sélectionner un moyen de paiement' }]}
        >
          <Select placeholder="Choisissez un type">
            {paymentOptions.map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Prénom" name="first_name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Nom" name="last_name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          shouldUpdate={(prev, cur) => prev.payment_type !== cur.payment_type}
          noStyle
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('payment_type');

            return (
              <>
                {(type === 'moov' || type === 'orange' || type === 'mtn' || type === 'wave' || type === 'djamo') && (
                  <Form.Item
                    label="Numéro de téléphone"
                    name="phone_number"

                    rules={[
                        { required: true, min: 4 , message: 'Le numéro de téléphone est requis' },
                        {
                          pattern: /^[0-9+\s().-]{4,}$/,
                          message: 'Numéro de téléphone invalide',
                        },

                  ]}
                  >
                    <Input />
                  </Form.Item>
                )}

                {(type === 'visa' || type === 'mastercard') && (
                  <Form.Item
                    label="Numéro de carte"
                    name="id_card_number"
                    rules={[{ required: true, message: 'Ce champ est requis pour les cartes bancaires' }]}
                  >
                    <Input />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email invalide' }]}>
          <Input />
        </Form.Item>

         <Form.Item label="Adresse" name="billing_address">
          <Input />
        </Form.Item>

        <Form.Item label="Ville" name="billing_city">
          <Input />
        </Form.Item>

        <Form.Item label="RIB" name="rib">
          <Input />
        </Form.Item>

        {/* Partie Upload Image */}
        <Form.Item label="Image de l'événement">

          <Upload
  beforeUpload={handleBeforeUpload}
  maxCount={1}
  accept="image/*"
  onRemove={() => setFile(null)}
  fileList={file ? [{
    uid: '-1',
    name: file.name,
    status: 'done',
    url: URL.createObjectURL(file)  // Crée une URL temporaire à partir du fichier
  }] : []}
  listType="picture"  // Affiche une vignette
>
  <Button icon={<UploadOutlined />}>Choisir une image</Button>
</Upload>


         {/* <Upload
            beforeUpload={handleBeforeUpload}
            maxCount={1}
            showUploadList={file ? [{ name: file.name }] : false}
            onRemove={() => setFile(null)}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Choisir une image</Button>
          </Upload>
          */}
        </Form.Item>

        {/* Boutons */}
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onBack}>Retour</Button>
            <Button type="primary" htmlType="submit">Suivant</Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Step4And5Combined;
