import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DatePicker, Input, Select, Button } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import locale from 'antd/es/date-picker/locale/fr_FR';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventCard from '../../components/EventCard'; 
import { BiCalendar } from 'react-icons/bi';

dayjs.locale('fr');
dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Option } = Select;

const SearchEvents = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    search_query: '',
    category_id: '',
    city: '',
    time_frame: '',
    price_sort: '',
  });
  const [textSearch, setTextSearch] = useState(''); 
  const [dateRange, setDateRange] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
  const queryFilters = {};
  for (const key of ['search_query', 'category_id', 'city', 'time_frame', 'price_sort']) {
    const value = searchParams.get(key);
    if (value) queryFilters[key] = value;
  }

  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  setFilters(queryFilters);
  setTextSearch(queryFilters.search_query || '');
  if (startDate && endDate) {
    setDateRange([dayjs(startDate), dayjs(endDate)]);
  } else {
    setDateRange(null);
  }
}, [searchParams]); 


  useEffect(() => {
    fetchEvents();

  }, [filters, dateRange]);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [searchParams]);



  const fetchEvents = async () => {
    try {
       setIsLoading(true); 
      const params = {
        ...filters,
        ...(dateRange && {
          start_date: dayjs(dateRange[0]).format('YYYY-MM-DD'),
          end_date: dayjs(dateRange[1]).format('YYYY-MM-DD'),
        }),
      };

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/account/events/search`, { params });
      setEvents(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des événements', err);
    }finally {
    setIsLoading(false); 
  }
  };


  const categoryLabels = {
  1: 'Conférences',
  2: 'Concerts',
  3: 'Ateliers',
  4: 'Séminaires',
  5: 'Festivals',
  6: 'Expositions',
  7: 'Webinaires',
  8: 'Salons',
  9: 'Célébrations',
  10: 'Matchs Sportifs',
  19: 'Spectacles',
  '-1': 'Tous les événements'
};

const getBreadcrumb = () => {
  if (filters.search_query) {
    return `Résultats de recherche pour "${filters.search_query}"`;
  }

  if (filters.category_id && categoryLabels[filters.category_id]) {
    return categoryLabels[filters.category_id];
  }

  return 'Tous les événements';
};


  // Mise à jour auto pour certains champs
  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchClick = () => {
    setFilters((prev) => ({
      ...prev,
      search_query: textSearch,
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="p-6  w-full max-w-full   mx-auto flex-grow ">

        <nav aria-label="Fil d’Ariane" className="text-sm text-gray-500 mb-4">
  <ol className="list-reset flex flex-wrap items-center">
    <li>
      <a href="/" className="text-black-600 font-dmsans text-2xl hover:underline">Accueil</a>
    </li>
    <li><span className="mx-2 font-dmsans text-2xl text-gray-400">/</span></li>
    <li>
      <a href="/search" className="text-black-600 font-dmsans text-2xl hover:underline">Événements</a>
    </li>
    <li><span className="mx-2 font-dmsans text-2xl text-gray-400">/</span></li>
    <li className="text-blue-500  font-dmsans text-2xl font-medium">{getBreadcrumb()}</li>
  </ol>
</nav>



<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">


  <div className="flex items-center gap-2 col-span-2">
    <Input
      name="search_query"
      placeholder="🔍 Recherche par mot-clé"
      value={textSearch}
      onChange={(e) => setTextSearch(e.target.value)}
      className="w-full rounded-lg border border-gray-300 px-4 py-2 placeholder:text-black focus:ring-2 focus:ring-[#0D1B2A] shadow-sm"
    />
    <Button type="primary" onClick={handleSearchClick} className="h-full">
      Rechercher
    </Button>
  </div>

  {/* Sélecteur de catégorie */}
  <Select
    placeholder=" Catégorie"
    value={filters.category_id || undefined}
    onChange={(value) => handleSelectChange(value, 'category_id')}
    allowClear
    className="w-full"
  >
    <Option value="-1">Tout</Option>
    <Option value="1">Conférence</Option>
    <Option value="2">Concert</Option>
    <Option value="3">Atelier</Option>
    <Option value="4">Séminaire</Option>
    <Option value="5">Festival</Option>
    <Option value="6">Exposition</Option>
    <Option value="7">Webinaire</Option>
    <Option value="8">Salon</Option>
    <Option value="9">Célébration</Option>
    <Option value="10">Match Sportif</Option>
  </Select>

  {/* Champ de ville */}
  <Input
    name="city"
    placeholder= " Ville"
    value={filters.city}
    onChange={handleChange}
    className="w-full rounded-lg border border-gray-300 px-4 py-2 placeholder:text-gray-400 shadow-sm"
  />

  {/* Période */}
  <Select
    placeholder="🗓️ Période"
    value={filters.time_frame || undefined}
    onChange={(value) => handleSelectChange(value, 'time_frame')}
    allowClear
    className="w-full"
  >
    <Option value="today">Aujourd'hui</Option>
    <Option value="week">Cette semaine</Option>
    <Option value="weekend">Ce week-end</Option>
    <Option value="month">Ce mois-ci</Option>
  </Select>

  {/* Trier par prix */}
  <Select
    placeholder=" Trier par prix"
    value={filters.price_sort || undefined}
    onChange={(value) => handleSelectChange(value, 'price_sort')}
    allowClear
    className="w-full"
  >
    <Option value="asc">Prix croissant</Option>
    <Option value="desc">Prix décroissant</Option>
  </Select>

  {/* Plage de dates */}
  <RangePicker
    locale={locale}
    format="DD/MM/YYYY"
    onChange={(dates) => setDateRange(dates)}
    placeholder={[' Date de début', ' Date de fin']}
    value={dateRange}
    className="w-full placeholder:text-gray-400"
  />
</div>




{isLoading ? (
  <div className="flex justify-center items-center py-12">
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
</div>

) : (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
    {events.length > 0 ? (
      events.map((event) => <EventCard key={event.id} event={event} />)
    ) : (
    <p className="text-center font-gabarito text-2xl text-gray-600">Aucun événement trouvé.</p>
    )}
  </div>
)}

      </div>
      <Footer />
    </div>
  );
};

export default SearchEvents;
