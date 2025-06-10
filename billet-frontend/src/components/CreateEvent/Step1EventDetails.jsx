import React, { useState, useEffect } from 'react';
import {Form,Input,Switch,DatePicker,TimePicker,Select,Button,Radio,Space,Card,message} from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const categories = [
  { id: 1, name: 'Conférence' },
  { id: 2, name: 'Concert' },
  { id: 3, name: 'Atelier' },

];

function Step1EventDetails({ initialData = {}, onNext }) {
  const [form] = Form.useForm();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDates, setRecurringDates] = useState([
    { date: null, start_time: null, end_time: null }
  ]);

  useEffect(() => {
    if (initialData) {
      const baseValues = {
        ...initialData,
        ...(initialData.is_recurring
          ? {}
          : {
              dates:
                initialData.start_date && initialData.end_date
                  ? [dayjs(initialData.start_date), dayjs(initialData.end_date)]
                  : undefined
            }),
      };

      form.setFieldsValue(baseValues);

      if (initialData.is_recurring) {
        setIsRecurring(true);
        if (Array.isArray(initialData.dates)) {
          const parsed = initialData.dates.map(d => ({
            date: d.date ? dayjs(d.date) : null,
            start_time: d.start_time ? dayjs(d.start_time, 'HH:mm:ss') : null,
            end_time: d.end_time ? dayjs(d.end_time, 'HH:mm:ss') : null,
          }));
          setRecurringDates(parsed);
        }
      } else {
        setIsRecurring(false);
      }
    }
  }, [initialData, form]);


  const addRecurringDate = () => {
    setRecurringDates([...recurringDates, { date: null, start_time: null, end_time: null }]);
  };

  const handleRecurringChange = (index, field, value) => {
    const updated = [...recurringDates];
    updated[index][field] = value;
    setRecurringDates(updated);
  };

  
const handleFinish = (values) => {
  const formatForSQL = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');

  const payload = {
    ...values,
    is_recurring: isRecurring,
    ...(isRecurring
      ? {
          dates: recurringDates
            .filter(d => d.date && d.start_time && d.end_time)
            .map(d => ({
              date: dayjs(d.date).format('YYYY-MM-DD'),
              start_time: dayjs(d.start_time).format('HH:mm:ss'),
              end_time: dayjs(d.end_time).format('HH:mm:ss'),
            }))
        }
      : {
         start_date: formatForSQL(values.dates?.[0]),
        end_date: formatForSQL(values.dates?.[1]),
     /*
          start_date: values.dates?.[0]?.toISOString(),
          end_date: values.dates?.[1]?.toISOString(),*/   
        }),
  };

  if (!isRecurring) {
    delete payload.dates;
  }

  onNext(payload);
};



  return (
    <Card title="Détails de l'événement">
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{ location_type: 'offline' }}
      >
        <Form.Item label="Titre de l'évenement" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Description de l'évenement" name="description">
          <Input.TextArea rows={4} maxLength={65000} />
        </Form.Item>

        <Form.Item label="Catégorie" name="category_id" rules={[{ required: true }]}>
          <Select options={categories.map(c => ({ label: c.name, value: c.id }))} />
        </Form.Item>

        <Form.Item label="Type de lieu" name="location_type">
          <Radio.Group>
            <Radio value="online">En ligne</Radio>
            <Radio value="offline">Présentiel</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.location_type !== cur.location_type}>
          {({ getFieldValue }) =>
            getFieldValue('location_type') === 'offline' && (
              <>
                <Form.Item label="Addresse" name="address" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Ville" name="city" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </>
            )
          }
        </Form.Item>


        <Form.Item
  label="Téléphone"
  name="phone"
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


        <Form.Item label="Site web" name="website_url" rules={[{  required: true , type: 'url', message: 'URL invalide' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Twitter" name="twitter_url" rules={[{ type: 'url', message: 'URL invalide' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Plusieurs Dates ?">
          <Switch checked={isRecurring} onChange={setIsRecurring} />
        </Form.Item>

        {!isRecurring && (
          <Form.Item
            label="Dates"
            name="dates"
            rules={[{ required: true, message: 'Sélectionnez une plage de dates' }]}
          >
            <RangePicker showTime />
          </Form.Item>
        )}

        {isRecurring && (
          <div>
            {recurringDates.map((d, i) => (
              <Space key={i} direction="horizontal" style={{ display: 'flex', marginBottom: 8 }}>
                <DatePicker
                  placeholder="Date"
                  value={d.date}
                  onChange={val => handleRecurringChange(i, 'date', val)}
                />
                <TimePicker
                  placeholder="Heure de début"
                  value={d.start_time}
                  onChange={val => handleRecurringChange(i, 'start_time', val)}
                />
                <TimePicker
                  placeholder="Heure de fin"
                  value={d.end_time}
                  onChange={val => handleRecurringChange(i, 'end_time', val)}
                />
              </Space>
            ))}
            <Button onClick={addRecurringDate} style={{ marginTop: 8 }}>+ Ajouter une date</Button>
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">Suivant</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Step1EventDetails;
