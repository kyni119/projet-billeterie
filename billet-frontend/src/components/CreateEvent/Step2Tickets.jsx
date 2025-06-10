import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, Card, message } from 'antd';

const ticketTypes = ['VVIP', 'VIP', 'Grand Public'];

function Step2Tickets({ onNext, onBack, initialTickets = [] }) {
  const [tickets, setTickets] = useState(initialTickets.length ? initialTickets : [{
    ticket_type: null,
    price: 0,
    available_tickets: 1,
    advantages: ''
  }]);

  const updateTicket = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  };

  const addTicket = () => {
    setTickets([...tickets, {
      ticket_type: null,
      price: 0,
      available_tickets: 1,
      advantages: ''
    }]);
  };

  const removeTicket = (index) => {
    if (tickets.length === 1) return;
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const validateAndNext = () => {
    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      if (!ticketTypes.includes(t.ticket_type)) {
        message.error(`Ticket #${i + 1} : type invalide`);
        return;
      }
      if (typeof t.price !== 'number' || t.price <= 0) {
        message.error(`Ticket #${i + 1} : prix invalide`);
        return;
      }
      if (!Number.isInteger(t.available_tickets) || t.available_tickets < 1) {
        message.error(`Ticket #${i + 1} : quantité invalide`);
        return;
      }
    }
    onNext(tickets);
  };

  return (
    <Card title="Billets">
      {tickets.map((ticket, idx) => (
        <Space
  key={idx}
  direction="vertical"
  style={{
    display: 'flex',
    marginBottom: 16,
    border: '1px solid #d9d9d9',
    padding: 12,
    borderRadius: 4,
    background: '#fafafa',
  }}
>
  <Space wrap style={{ width: '100%' }}>
    <Select
      placeholder="Type de billet"
      value={ticket.ticket_type}
      onChange={val => updateTicket(idx, 'ticket_type', val)}
      style={{ minWidth: 180 }}
    >
      {ticketTypes.map(tt => (
        <Select.Option key={tt} value={tt}>{tt}</Select.Option>
      ))}
    </Select>

    <InputNumber
      min={0}
      step={0.01}
      placeholder="Prix"
      value={ticket.price}
      onChange={val => updateTicket(idx, 'price', val)}
      style={{ minWidth: 140 }}
      formatter={val => `${val} FCFA`}
      parser={val => val.replace(' FCFA', '')}
    />

    <InputNumber
      min={1}
      placeholder="Quantité"
      value={ticket.available_tickets}
      onChange={val => updateTicket(idx, 'available_tickets', val)}
      style={{ minWidth: 120 }}
    />

    {tickets.length > 1 && (
      <Button danger onClick={() => removeTicket(idx)}>Supprimer</Button>
    )}
  </Space>

  <Input.TextArea
    placeholder="Avantages (optionnel)"
    value={ticket.advantages}
    onChange={e => updateTicket(idx, 'advantages', e.target.value)}
    rows={2}
    style={{ width: '100%' }}
  />
</Space>

        
      ))}

      <Button type="dashed" onClick={addTicket} style={{ marginTop: 8 }}>
        + Ajouter un billet
      </Button>

      <div style={{ marginTop: 20 }}>
        <Button onClick={onBack} style={{ marginRight: 8 }}>Précédent</Button>
        <Button type="primary" onClick={validateAndNext}>Suivant</Button>
      </div>
    </Card>
  );
}

export default Step2Tickets;


     {/*
        <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="start">
          <Select
            placeholder="Type de billet"
            value={ticket.ticket_type}
            onChange={val => updateTicket(idx, 'ticket_type', val)}
            style={{ width: 130 }}
          >
            {ticketTypes.map(tt => (
              <Select.Option key={tt} value={tt}>{tt}</Select.Option>
            ))}
          </Select>

          <InputNumber
            min={0}
            step={0.01}
            placeholder="Prix"
            value={ticket.price}
            onChange={val => updateTicket(idx, 'price', val)}
            style={{ width: 100 }}
            formatter={val => `${val} FCFA`}
            parser={val => val.replace(' FCFA', '')}
          />

          <InputNumber
            min={1}
            placeholder="Quantité"
            value={ticket.available_tickets}
            onChange={val => updateTicket(idx, 'available_tickets', val)}
            style={{ width: 100 }}
          />

          <Input
            placeholder="Avantages (optionnel)"
            value={ticket.advantages}
            onChange={e => updateTicket(idx, 'advantages', e.target.value)}
            style={{ width: 200 }}
          />

          {tickets.length > 1 && (
            <Button danger onClick={() => removeTicket(idx)}>Supprimer</Button>
          )}
        </Space>*/}