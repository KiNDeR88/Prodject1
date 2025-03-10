import React from 'react';
import './Dashboard.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  BarChart, Bar
} from 'recharts';

/* Компонент шапки */
const Header = () => (
  <header className="dashboard-header">
    <h1>Дашборд Аналитики</h1>
  </header>
);

/* Компонент фильтров */
function FilterBar({ initialMonth, initialSegment, onApply }) {
  const [month, setMonth] = React.useState(initialMonth);
  const [segment, setSegment] = React.useState(initialSegment);

  const applyFilters = () => {
    onApply(month, segment);
  };

  const resetFilters = () => {
    setMonth("Все");
    setSegment("Все");
    onApply("Все", "Все");
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Месяц:</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="Все">Все</option>
          <option value="Янв">Янв</option>
          <option value="Фев">Фев</option>
          <option value="Мар">Мар</option>
          <option value="Апр">Апр</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Сегмент клиента:</label>
        <select value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option value="Все">Все</option>
          <option value="Премиум">Премиум</option>
          <option value="Стандарт">Стандарт</option>
          <option value="Бюджет">Бюджет</option>
        </select>
      </div>
      <div className="button-group">
        <button className="dropdown-button" onClick={applyFilters}>Применить фильтры</button>
        <button className="dropdown-button" onClick={resetFilters}>Сбросить фильтры</button>
      </div>
    </div>
  );
}

/* Боковая панель с фильтрами и переключателями отчетов в раскрывающемся списке */
const Sidebar = ({ 
  selectedMonth, setSelectedMonth, 
  selectedSegment, setSelectedSegment, 
  visibleReports, setVisibleReports 
}) => {
  const reportLabels = {
    clientSegmentation: "Сегментация клиентов",
    productLifeCycle: "Жизненный цикл продукта",
    salesForecast: "Прогнозирование продаж",
    costsProfitability: "Затраты и рентабельность",
    salesChannels: "Каналы продаж",
    customerRetention: "Удержание клиентов",
    serviceQuality: "Качество обслуживания",
    supplyEfficiency: "Эффективность поставок",
    inventoryAge: "Возраст запасов",
    seasonalityTrends: "Сезонность и тренды",
    topProducts: "Топ товаров по продажам",
    salesByCategories: "Продажи по категориям",
    marginAnalysis: "Маржинальный анализ",
    discountsPromotions: "Скидки и акции",
    salesByRegions: "Продажи по регионам",
    returnsAnalysis: "Возвраты и отмены",
    conversionRate: "Конверсия по продуктам",
    crossSelling: "Кросс‑продажи",
    promoCampaign: "Промо‑кампания",
    customerSegmentationByProducts: "Сегментация клиентов по продуктам",
  };

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <aside className="dashboard-sidebar">
      {/* Фильтры вынесены в отдельный компонент */}
      <FilterBar 
        initialMonth={selectedMonth} 
        initialSegment={selectedSegment} 
        onApply={(month, segment) => {
          setSelectedMonth(month);
          setSelectedSegment(segment);
        }}
      />
      <div className="sidebar-section">
        <h3>Отчеты</h3>
        <button
          className="dropdown-button"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          {isDropdownOpen ? "Скрыть настройки" : "Показать настройки"}
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            {Object.entries(visibleReports).map(([key, value]) => (
              <div key={key} className="toggle-item">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setVisibleReports((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                />
                <span className="toggle-label">{reportLabels[key]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

/* --------------------- */
/* Компоненты отчетов   */
/* --------------------- */

// 1. Сегментация клиентов (PieChart)
function ClientSegmentation({ selectedSegment }) {
  const fullData = [
    { name: 'Премиум', value: 30 },
    { name: 'Стандарт', value: 50 },
    { name: 'Бюджет', value: 20 },
  ];
  const data =
    selectedSegment !== 'Все'
      ? fullData.filter((item) => item.name === selectedSegment)
      : fullData;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Сегментация клиентов</h3>
      </div>
      <div className="chart-wrapper">
        <PieChart width={300} height={300}>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} label dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <div className="report-description">
        <p>Распределение клиентов по сегментам.</p>
      </div>
    </div>
  );
}

// 2. Жизненный цикл продукта (LineChart)
function ProductLifeCycle() {
  const data = [
    { stage: 'Запуск', value: 100 },
    { stage: 'Рост', value: 300 },
    { stage: 'Зрелость', value: 200 },
    { stage: 'Спад', value: 50 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Жизненный цикл продукта</h3>
      </div>
      <div className="chart-wrapper">
        <LineChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>
      <div className="report-description">
        <p>Этапы жизненного цикла: запуск, рост, зрелость и спад.</p>
      </div>
    </div>
  );
}

// 3. Прогнозирование продаж (LineChart)
function SalesForecast({ selectedMonth }) {
  const fullData = [
    { month: 'Янв', actual: 400, forecast: 420 },
    { month: 'Фев', actual: 300, forecast: 350 },
    { month: 'Мар', actual: 500, forecast: 480 },
    { month: 'Апр', actual: 700, forecast: 710 },
  ];
  const data =
    selectedMonth !== 'Все'
      ? fullData.filter((item) => item.month === selectedMonth)
      : fullData;
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Прогнозирование продаж</h3>
      </div>
      <div className="chart-wrapper">
        <LineChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Фактические" />
          <Line type="monotone" dataKey="forecast" stroke="#8884d8" name="Прогнозируемые" />
        </LineChart>
      </div>
      <div className="report-description">
        <p>Сравнение фактических и прогнозируемых продаж по месяцам.</p>
      </div>
    </div>
  );
}

// 4. Затраты и рентабельность (BarChart)
function CostsProfitability() {
  const data = [
    { product: 'Продукт A', cost: 200, profit: 80 },
    { product: 'Продукт B', cost: 150, profit: 100 },
    { product: 'Продукт C', cost: 300, profit: 120 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Затраты и рентабельность</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cost" fill="#8884d8" name="Затраты" />
          <Bar dataKey="profit" fill="#82ca9d" name="Прибыль" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Анализ затрат и прибыли по продуктам.</p>
      </div>
    </div>
  );
}

// 5. Каналы продаж (BarChart)
function SalesChannels() {
  const data = [
    { channel: 'Интернет', sales: 400 },
    { channel: 'Офлайн', sales: 300 },
    { channel: 'Партнеры', sales: 200 },
    { channel: 'Прямые продажи', sales: 100 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Каналы продаж</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="channel" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8884d8" name="Объем продаж" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Объем продаж по каналам сбыта.</p>
      </div>
    </div>
  );
}

// 6. Удержание клиентов (LineChart)
function CustomerRetention({ selectedMonth }) {
  const fullData = [
    { month: 'Янв', retention: 90 },
    { month: 'Фев', retention: 85 },
    { month: 'Мар', retention: 88 },
    { month: 'Апр', retention: 92 },
  ];
  const data =
    selectedMonth !== 'Все'
      ? fullData.filter((item) => item.month === selectedMonth)
      : fullData;
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Удержание клиентов</h3>
      </div>
      <div className="chart-wrapper">
        <LineChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="retention" stroke="#8884d8" name="Уровень удержания" />
        </LineChart>
      </div>
      <div className="report-description">
        <p>Динамика удержания клиентов по месяцам.</p>
      </div>
    </div>
  );
}

// 7. Качество обслуживания (PieChart)
function ServiceQuality() {
  const data = [
    { rating: 'Отлично', value: 40 },
    { rating: 'Хорошо', value: 35 },
    { rating: 'Удовлетворительно', value: 20 },
    { rating: 'Плохо', value: 5 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Качество обслуживания</h3>
      </div>
      <div className="chart-wrapper">
        <PieChart width={300} height={300}>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <div className="report-description">
        <p>Распределение оценок качества обслуживания.</p>
      </div>
    </div>
  );
}

// 8. Эффективность поставок (BarChart)
function SupplyEfficiency() {
  const data = [
    { supplier: 'Поставщик A', onTime: 95 },
    { supplier: 'Поставщик B', onTime: 80 },
    { supplier: 'Поставщик C', onTime: 85 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Эффективность поставок</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="supplier" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="onTime" fill="#8884d8" name="Доставки вовремя" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Процент доставок, выполненных вовремя, по поставщикам.</p>
      </div>
    </div>
  );
}

// 9. Возраст запасов (BarChart)
function InventoryAge() {
  const data = [
    { age: '<30 дней', count: 120 },
    { age: '30-60 дней', count: 80 },
    { age: '60-90 дней', count: 40 },
    { age: '>90 дней', count: 10 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Возраст запасов</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" name="Количество запасов" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Распределение запасов по возрастным категориям.</p>
      </div>
    </div>
  );
}

// 10. Сезонность и тренды (LineChart)
function SeasonalityTrends() {
  const data = [
    { season: 'Весна', sales2024: 400, sales2025: 450 },
    { season: 'Лето', sales2024: 500, sales2025: 550 },
    { season: 'Осень', sales2024: 300, sales2025: 350 },
    { season: 'Зима', sales2024: 200, sales2025: 250 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Сезонность и тренды</h3>
      </div>
      <div className="chart-wrapper">
        <LineChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="season" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales2024" stroke="#8884d8" name="2024" />
          <Line type="monotone" dataKey="sales2025" stroke="#82ca9d" name="2025" />
        </LineChart>
      </div>
      <div className="report-description">
        <p>Сравнение продаж по сезонам за два периода.</p>
      </div>
    </div>
  );
}

// 11. Топ товаров по продажам (BarChart)
function TopProducts() {
  const data = [
    { product: 'Продукт A', sales: 800 },
    { product: 'Продукт B', sales: 600 },
    { product: 'Продукт C', sales: 400 },
    { product: 'Продукт D', sales: 200 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Топ товаров по продажам</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8884d8" name="Продажи" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Товары с наивысшими продажами.</p>
      </div>
    </div>
  );
}

// 12. Продажи по категориям (BarChart)
function SalesByCategories() {
  const data = [
    { category: 'Электроника', actual: 500, forecast: 520 },
    { category: 'Одежда', actual: 400, forecast: 430 },
    { category: 'Продукты', actual: 600, forecast: 580 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Продажи по категориям</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actual" fill="#8884d8" name="Фактические" />
          <Bar dataKey="forecast" fill="#82ca9d" name="Прогнозируемые" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Сравнение фактических и прогнозируемых продаж по категориям.</p>
      </div>
    </div>
  );
}

// 13. Маржинальный анализ (BarChart)
function MarginAnalysis() {
  const data = [
    { product: 'Продукт A', cost: 200, price: 300 },
    { product: 'Продукт B', cost: 150, price: 250 },
    { product: 'Продукт C', cost: 300, price: 400 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Маржинальный анализ</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cost" fill="#8884d8" name="Себестоимость" />
          <Bar dataKey="price" fill="#82ca9d" name="Цена" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Сравнение себестоимости и цены для оценки прибыльности.</p>
      </div>
    </div>
  );
}

// 14. Скидки и акции (BarChart)
function DiscountsPromotions() {
  const data = [
    { period: 'До', sales: 300 },
    { period: 'Во время', sales: 500 },
    { period: 'После', sales: 400 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Скидки и акции</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8884d8" name="Продажи" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Динамика продаж до, во время и после акций.</p>
      </div>
    </div>
  );
}

// 15. Продажи по регионам (BarChart)
function SalesByRegions() {
  const data = [
    { region: 'Москва', sales: 800 },
    { region: 'Санкт-Петербург', sales: 600 },
    { region: 'Новосибирск', sales: 400 },
    { region: 'Екатеринбург', sales: 200 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Продажи по регионам</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="region" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8884d8" name="Продажи" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Объем продаж в различных регионах.</p>
      </div>
    </div>
  );
}

// 16. Возвраты и отмены (BarChart)
function ReturnsAnalysis() {
  const data = [
    { product: 'Продукт A', returns: 20 },
    { product: 'Продукт B', returns: 15 },
    { product: 'Продукт C', returns: 5 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Возвраты и отмены</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="returns" fill="#8884d8" name="Возвраты" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Анализ количества возвратов по продуктам.</p>
      </div>
    </div>
  );
}

// 17. Конверсия по продуктам (BarChart)
function ConversionRate() {
  const data = [
    { product: 'Продукт A', conversion: 5 },
    { product: 'Продукт B', conversion: 7 },
    { product: 'Продукт C', conversion: 3 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Конверсия по продуктам</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="conversion" fill="#8884d8" name="Конверсия (%)" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Показатель конверсии для каждого продукта.</p>
      </div>
    </div>
  );
}

// 18. Кросс‑продажи (BarChart)
function CrossSelling() {
  const data = [
    { product: 'Продукт A+B', crossSales: 120 },
    { product: 'Продукт A+C', crossSales: 80 },
    { product: 'Продукт B+C', crossSales: 60 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Кросс‑продажи</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="crossSales" fill="#8884d8" name="Кросс‑продажи" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Анализ товаров, которые часто продаются вместе.</p>
      </div>
    </div>
  );
}

// 19. Промо‑кампания (BarChart)
function PromoCampaign() {
  const data = [
    { period: 'До', sales: 300 },
    { period: 'Во время', sales: 500 },
    { period: 'После', sales: 400 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Промо‑кампания</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#8884d8" name="Продажи" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Динамика продаж до, во время и после кампании.</p>
      </div>
    </div>
  );
}

// 20. Сегментация клиентов по продуктам (Stacked BarChart)
function CustomerSegmentationByProducts() {
  const data = [
    { product: 'Продукт A', Премиум: 30, Стандарт: 40, Бюджет: 30 },
    { product: 'Продукт B', Премиум: 20, Стандарт: 50, Бюджет: 30 },
    { product: 'Продукт C', Премиум: 10, Стандарт: 60, Бюджет: 30 },
  ];
  return (
    <div className="report-card">
      <div className="report-header">
        <h3>Сегментация клиентов по продуктам</h3>
      </div>
      <div className="chart-wrapper">
        <BarChart width={300} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Премиум" stackId="a" fill="#8884d8" />
          <Bar dataKey="Стандарт" stackId="a" fill="#82ca9d" />
          <Bar dataKey="Бюджет" stackId="a" fill="#ffc658" />
        </BarChart>
      </div>
      <div className="report-description">
        <p>Распределение клиентов по сегментам в разрезе продуктов.</p>
      </div>
    </div>
  );
}

/* --------------------- */
/* Основной компонент    */
/* --------------------- */
function Dashboard() {
  // Фильтры реализованы как одиночное значение
  const [selectedMonth, setSelectedMonth] = React.useState("Все");
  const [selectedSegment, setSelectedSegment] = React.useState("Все");
  const [visibleReports, setVisibleReports] = React.useState({
    clientSegmentation: true,
    productLifeCycle: true,
    salesForecast: true,
    costsProfitability: true,
    salesChannels: true,
    customerRetention: true,
    serviceQuality: true,
    supplyEfficiency: true,
    inventoryAge: true,
    seasonalityTrends: true,
    topProducts: true,
    salesByCategories: true,
    marginAnalysis: true,
    discountsPromotions: true,
    salesByRegions: true,
    returnsAnalysis: true,
    conversionRate: true,
    crossSelling: true,
    promoCampaign: true,
    customerSegmentationByProducts: true,
  });

  return (
    <div className="dashboard-container">
      <Sidebar
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedSegment={selectedSegment}
        setSelectedSegment={setSelectedSegment}
        visibleReports={visibleReports}
        setVisibleReports={setVisibleReports}
      />
      <div className="dashboard-main">
        <Header />
        <div className="report-grid">
          {visibleReports.clientSegmentation && <ClientSegmentation selectedSegment={selectedSegment} />}
          {visibleReports.productLifeCycle && <ProductLifeCycle />}
          {visibleReports.salesForecast && <SalesForecast selectedMonth={selectedMonth} />}
          {visibleReports.costsProfitability && <CostsProfitability />}
          {visibleReports.salesChannels && <SalesChannels />}
          {visibleReports.customerRetention && <CustomerRetention selectedMonth={selectedMonth} />}
          {visibleReports.serviceQuality && <ServiceQuality />}
          {visibleReports.supplyEfficiency && <SupplyEfficiency />}
          {visibleReports.inventoryAge && <InventoryAge />}
          {visibleReports.seasonalityTrends && <SeasonalityTrends />}
          {visibleReports.topProducts && <TopProducts />}
          {visibleReports.salesByCategories && <SalesByCategories />}
          {visibleReports.marginAnalysis && <MarginAnalysis />}
          {visibleReports.discountsPromotions && <DiscountsPromotions />}
          {visibleReports.salesByRegions && <SalesByRegions />}
          {visibleReports.returnsAnalysis && <ReturnsAnalysis />}
          {visibleReports.conversionRate && <ConversionRate />}
          {visibleReports.crossSelling && <CrossSelling />}
          {visibleReports.promoCampaign && <PromoCampaign />}
          {visibleReports.customerSegmentationByProducts && <CustomerSegmentationByProducts />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;