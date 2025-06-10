import React from 'react';
import { Card, Descriptions, List, Button, Divider, Image } from 'antd';

const Step5Resume = ({ eventData, onPublish, onBack }) => {
  const payment = eventData.payment || {};
  const imageFile = eventData.imageFile;

  return (
    <div className="space-y-6">
      {/* 🔹 Détails de l’événement */}
      <Card title="Résumé de l'événement">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Titre">{eventData.title}</Descriptions.Item>
          <Descriptions.Item label="Description">{eventData.description}</Descriptions.Item>
          <Descriptions.Item label="Catégorie">{eventData.category_id}</Descriptions.Item>
          <Descriptions.Item label="Type de lieu">{eventData.location_type}</Descriptions.Item>
          {eventData.location_type === 'offline' && (
            <>
              <Descriptions.Item label="Adresse">{eventData.address}</Descriptions.Item>
              <Descriptions.Item label="Ville">{eventData.city}</Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Téléphone">{eventData.phone}</Descriptions.Item>
          <Descriptions.Item label="Site web">{eventData.website_url}</Descriptions.Item>
          <Descriptions.Item label="Twitter">{eventData.twitter_url}</Descriptions.Item>

          {eventData.is_recurring ? (
            <Descriptions.Item label="Dates">
              <ul className="list-disc pl-4">
                {eventData.dates?.map((d, idx) => (
                  <li key={idx}>
                    {d.date} — {d.start_time} à {d.end_time}
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
          ) : (
            <>
              <Descriptions.Item label="Date de début">{eventData.start_date}</Descriptions.Item>
              <Descriptions.Item label="Date de fin">{eventData.end_date}</Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      {/* 🔹 Billets */}
      <Divider />
      <Card title="Billets">
        <List
          dataSource={eventData.tickets || []}
          renderItem={(ticket, index) => (
            <List.Item key={index}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="Type">{ticket.ticket_type}</Descriptions.Item>
                <Descriptions.Item label="Prix">{ticket.price} FCFA</Descriptions.Item>
                <Descriptions.Item label="Places disponibles">{ticket.available_tickets}</Descriptions.Item>
                {ticket.advantages && (
                  <Descriptions.Item label="Avantages">{ticket.advantages}</Descriptions.Item>
                )}
              </Descriptions>
            </List.Item>
          )}
        />
      </Card>

      {/* 🔹 Paiement */}
      <Divider />
      <Card title="Méthode de paiement">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Type">{payment.payment_type}</Descriptions.Item>
          <Descriptions.Item label="Nom">{payment.first_name} {payment.last_name}</Descriptions.Item>
          {payment.phone_number && (
            <Descriptions.Item label="Téléphone">{payment.phone_number}</Descriptions.Item>
          )}
          {payment.id_card_number && (
            <Descriptions.Item label="Numéro carte">{payment.id_card_number}</Descriptions.Item>
          )}
          {payment.email && (
            <Descriptions.Item label="Email">{payment.email}</Descriptions.Item>
          )}

          {payment.billing_address && (
  <Descriptions.Item label="Adresse">{payment.billing_address}</Descriptions.Item>
)}
{payment.billing_city && (
  <Descriptions.Item label="Ville">{payment.billing_city}</Descriptions.Item>
)}

          {payment.rib && (
            <Descriptions.Item label="RIB">{payment.rib}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 🔹 Image */}
      <Divider />
      <Card title="Image sélectionnée">
        {imageFile ? (
          <div>
            {/*<p>Fichier : {imageFile.name}</p>*/}
            <Image
              src={URL.createObjectURL(imageFile)}
              alt="Aperçu"
              width={200}
            />
          </div>
        ) : (
          <p>Aucune image sélectionnée</p>
        )}
      </Card>

      {/* 🔹 Boutons */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack}>Retour</Button>
        <Button type="primary" onClick={onPublish}>
  Publier l’événement
</Button>

        
      </div>
    </div>
  );
};

export default Step5Resume;
