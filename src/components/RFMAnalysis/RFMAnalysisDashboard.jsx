import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import './RFMAnalysisDashboard.css';

/* ======================= ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ ======================= */

// Генерация случайных данных для 200 клиентов с полем "период"
const generateSampleData = () => {
  const data = [];
  const periods = ["2022", "2023"];
  for (let i = 0; i < 200; i++) {
    const давность = Math.floor(Math.random() * 100) + 1;
    const частота = Math.floor(Math.random() * 10) + 1;
    const сумма = Math.random() * (1000 - 50) + 50;
    const период = periods[Math.floor(Math.random() * periods.length)];
    data.push({ id: i, давность, частота, сумма, период });
  }
  return data;
};

const computeQuantiles = (data, key) => {
  const sorted = data.map(d => d[key]).sort((a, b) => a - b);
  const Q1 = sorted[Math.floor(0.25 * sorted.length)];
  const Q2 = sorted[Math.floor(0.5 * sorted.length)];
  const Q3 = sorted[Math.floor(0.75 * sorted.length)];
  return { Q1, Q2, Q3 };
};

const assignScore = (value, quantiles, reverse = false) => {
  if (reverse) {
    if (value <= quantiles.Q1) return 4;
    else if (value <= quantiles.Q2) return 3;
    else if (value <= quantiles.Q3) return 2;
    else return 1;
  } else {
    if (value <= quantiles.Q1) return 1;
    else if (value <= quantiles.Q2) return 2;
    else if (value <= quantiles.Q3) return 3;
    else return 4;
  }
};

const getRFMSegmentName = (r, f, m) => {
  if (r === 4 && f === 4 && m === 4) return "Чемпионы";
  if (r >= 3 && f >= 3) return "Лояльные клиенты";
  if (r === 4 && f === 2) return "Потенциальные лоялисты";
  if (r === 4 && f === 1) return "Новые клиенты";
  if (r <= 2 && f <= 2 && m <= 2) return "Спящие";
  if (r <= 2) return "Под угрозой";
  return "Прочие";
};

const binData = (data, key, binSize) => {
  const bins = {};
  data.forEach(item => {
    const bin = Math.floor(item[key] / binSize) * binSize;
    bins[bin] = (bins[bin] || 0) + 1;
  });
  return Object.keys(bins).map(bin => ({
    bin: Number(bin),
    count: bins[bin]
  }));
};

const runKMeans = (data, k) => {
  const давности = data.map(d => d.давность);
  const частоты = data.map(d => d.частота);
  const суммы = data.map(d => d.сумма);
  const minДавность = Math.min(...давности);
  const maxДавность = Math.max(...давности);
  const minЧастота = Math.min(...частоты);
  const maxЧастота = Math.max(...частоты);
  const minСумма = Math.min(...суммы);
  const maxСумма = Math.max(...суммы);

  const normalized = data.map(d => ({
    давность: (d.давность - minДавность) / (maxДавность - minДавность),
    частота: (d.частота - minЧастота) / (maxЧастота - minЧастота),
    сумма: (d.сумма - minСумма) / (maxСумма - minСумма)
  }));

  let centroids = [];
  for (let i = 0; i < k; i++) {
    const randIndex = Math.floor(Math.random() * normalized.length);
    centroids.push({ ...normalized[randIndex] });
  }

  let assignments = new Array(data.length).fill(-1);
  const maxIterations = 10;
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (let i = 0; i < normalized.length; i++) {
      const point = normalized[i];
      let bestIndex = -1;
      let bestDist = Infinity;
      for (let j = 0; j < k; j++) {
        const centroid = centroids[j];
        const dist = Math.sqrt(
          Math.pow(point.давность - centroid.давность, 2) +
          Math.pow(point.частота - centroid.частота, 2) +
          Math.pow(point.сумма - centroid.сумма, 2)
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = j;
        }
      }
      if (assignments[i] !== bestIndex) {
        changed = true;
        assignments[i] = bestIndex;
      }
    }
    const newCentroids = Array(k).fill(null).map(() => ({ давность: 0, частота: 0, сумма: 0, count: 0 }));
    for (let i = 0; i < normalized.length; i++) {
      const cluster = assignments[i];
      newCentroids[cluster].давность += normalized[i].давность;
      newCentroids[cluster].частота += normalized[i].частота;
      newCentroids[cluster].сумма += normalized[i].сумма;
      newCentroids[cluster].count += 1;
    }
    for (let j = 0; j < k; j++) {
      if (newCentroids[j].count > 0) {
        centroids[j] = {
          давность: newCentroids[j].давность / newCentroids[j].count,
          частота: newCentroids[j].частота / newCentroids[j].count,
          сумма: newCentroids[j].сумма / newCentroids[j].count
        };
      }
    }
    if (!changed) break;
  }
  return assignments;
};

const computeHeatmapData = (data) => {
  const heatmap = {};
  for (let r = 1; r <= 4; r++) {
    heatmap[r] = {};
    for (let f = 1; f <= 4; f++) {
      heatmap[r][f] = { totalСумма: 0, count: 0 };
    }
  }
  data.forEach(item => {
    const r = item.rScore;
    const f = item.fScore;
    heatmap[r][f].totalСумма += item.сумма;
    heatmap[r][f].count += 1;
  });
  const heatmapArray = [];
  for (let r = 1; r <= 4; r++) {
    for (let f = 1; f <= 4; f++) {
      const cell = heatmap[r][f];
      heatmapArray.push({
        rScore: r,
        fScore: f,
        avgСумма: cell.count > 0 ? cell.totalСумма / cell.count : 0,
        count: cell.count
      });
    }
  }
  return heatmapArray;
};

/* =================== ДОПОЛНИТЕЛЬНЫЙ АНАЛИЗ =================== */
// Добавляем прогноз CLV и риск оттока
const computeMetrics = (subsetData) => {
  const давностьQuantiles = computeQuantiles(subsetData, 'давность');
  const частотаQuantiles = computeQuantiles(subsetData, 'частота');
  const суммаQuantiles = computeQuantiles(subsetData, 'сумма');

  let computedData = subsetData.map(item => {
    const rScore = assignScore(item.давность, давностьQuantiles, true);
    const fScore = assignScore(item.частота, частотаQuantiles, false);
    const mScore = assignScore(item.сумма, суммаQuantiles, false);
    const weightedScore = +(0.4 * rScore + 0.3 * fScore + 0.3 * mScore).toFixed(2);
    const segmentName = getRFMSegmentName(rScore, fScore, mScore);
    // Прогнозируемый CLV – простая формула для примера
    const predictedCLV = item.частота * item.сумма * (1 + (4 - item.давность / 25));
    const churnRisk = item.давность > частотаQuantiles.Q2 ? "High" : "Low";
    return { 
      ...item, 
      rScore, 
      fScore, 
      mScore, 
      weightedScore, 
      rfmSegment: `${rScore}${fScore}${mScore}`, 
      segmentName, 
      predictedCLV, 
      churnRisk 
    };
  });

  const clusters = runKMeans(computedData, 3);
  computedData = computedData.map((item, index) => ({
    ...item,
    cluster: clusters[index]
  }));

  const segments = {};
  computedData.forEach(item => {
    segments[item.segmentName] = (segments[item.segmentName] || 0) + 1;
  });
  const segmentData = Object.keys(segments).map(seg => ({
    segment: seg,
    count: segments[seg]
  })).sort((a, b) => a.segment.localeCompare(b.segment));

  const weightedBins = binData(computedData, 'weightedScore', 0.5);
  const давностьBins = binData(computedData, 'давность', 10);
  const частотаBins = binData(computedData, 'частота', 1);
  const суммаBins = binData(computedData, 'сумма', 100);
  const heatmapData = computeHeatmapData(computedData);

  return { computedData, segmentData, weightedBins, heatmapData, давностьBins, частотаBins, суммаBins };
};

/* =================== КОМПОНЕНТ ТЕПЛОВОЙ КАРТЫ =================== */
const HeatmapChart = ({ heatmapData, onCellClick }) => {
  const data = heatmapData || [];
  const maxAvg = data.length > 0 ? Math.max(...data.map(cell => cell.avgСумма)) : 1;
  const getColor = (avg) => {
    const intensity = maxAvg > 0 ? avg / maxAvg : 0;
    const value = Math.floor(255 - intensity * 255);
    return `rgb(${value}, ${value}, 255)`;
  };

  const matrix = [];
  for (let r = 1; r <= 4; r++) {
    const row = [];
    for (let f = 1; f <= 4; f++) {
      const cell = data.find(cell => cell.rScore === r && cell.fScore === f) || { avgСумма: 0, count: 0 };
      row.push({ ...cell, rScore: r, fScore: f });
    }
    matrix.push(row);
  }

  return (
    <div>
      <table className="heatmap-table">
        <thead>
          <tr>
            <th>R\F</th>
            {[1, 2, 3, 4].map(f => (
              <th key={f}>F {f}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>R {rowIndex + 1}</td>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    backgroundColor: getColor(cell.avgСумма),
                    cursor: 'pointer'
                  }}
                  onClick={() => onCellClick(cell.rScore, cell.fScore)}
                >
                  {cell.avgСумма.toFixed(2)}<br />({cell.count})
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="heatmap-legend">
        <p>
          Легенда:<br />
          Белый – низкое значение, синий – высокое. Максимальное значение: {maxAvg.toFixed(2)}
        </p>
        <div style={{ height: '20px', width: '100%', background: 'linear-gradient(to right, rgb(255,255,255), rgb(0,0,255))' }}></div>
      </div>
    </div>
  );
};

/* =================== CUSTOM TOOLTIP ДЛЯ SCATTER CHART =================== */
const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const client = payload[0].payload;
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
        <p>ID: {client.id}</p>
        <p>Давность: {client.давность}</p>
        <p>Частота: {client.частота}</p>
        <p>Сумма: {client.сумма.toFixed(2)}</p>
        <p>Прогноз CLV: {client.predictedCLV.toFixed(2)}</p>
        <p>Риск оттока: {client.churnRisk}</p>
        <p>Сегмент: {client.segmentName}</p>
      </div>
    );
  }
  return null;
};

/* =================== ОСНОВНОЙ КОМПОНЕНТ =================== */
const RFMAnalysisDashboard = () => {
  const [rawData, setRawData] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Обработчик загрузки файла
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data.filter(row => row.давность && row.частота && row.сумма && row.период);
        const dataWithId = parsedData.map((item, index) => ({ id: index, ...item }));
        setRawData(dataWithId);
      },
      error: (error) => {
        console.error("Ошибка при загрузке файла:", error);
      }
    });
  };

  useEffect(() => {
    if (rawData.length === 0) {
      const sample = generateSampleData();
      setRawData(sample);
    }
  }, [rawData]);

  useEffect(() => {
    const periods = Array.from(new Set(rawData.map(item => item.период)));
    setAvailablePeriods(periods);
    if (periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0]);
    }
  }, [rawData, selectedPeriod]);

  useEffect(() => {
    if (selectedPeriod) {
      const dataForPeriod = rawData.filter(item => item.период === selectedPeriod);
      setMetrics(computeMetrics(dataForPeriod));
    }
  }, [rawData, selectedPeriod]);

  const handleHistogramClick = (type, value, binSize) => {
    if (type === 'сегмент') {
      setSelectedFilter({ type, segment: value });
    } else {
      setSelectedFilter({ type, min: value, max: value + binSize });
    }
  };

  const handleHeatmapCellClick = (r, f) => {
    setSelectedFilter({ type: 'тепловая', r, f });
  };

  const getFilteredClients = () => {
    if (!selectedFilter || !metrics) return [];
    let filtered = [];
    switch (selectedFilter.type) {
      case 'давность':
        filtered = metrics.computedData.filter(client => client.давность >= selectedFilter.min && client.давность < selectedFilter.max);
        break;
      case 'частота':
        filtered = metrics.computedData.filter(client => client.частота >= selectedFilter.min && client.частота < selectedFilter.max);
        break;
      case 'сумма':
        filtered = metrics.computedData.filter(client => client.сумма >= selectedFilter.min && client.сумма < selectedFilter.max);
        break;
      case 'взвешенный':
        filtered = metrics.computedData.filter(client => client.weightedScore >= selectedFilter.min && client.weightedScore < selectedFilter.max);
        break;
      case 'сегмент':
        filtered = metrics.computedData.filter(client => client.segmentName === selectedFilter.segment);
        break;
      case 'тепловая':
        filtered = metrics.computedData.filter(client => client.rScore === selectedFilter.r && client.fScore === selectedFilter.f);
        break;
      default:
        filtered = [];
    }
    return filtered;
  };

  const filteredClients = getFilteredClients();

  return (
    <div className="dashboard-container">
      <h2>RFM Анализ: Визуальный Отчет</h2>
      <div className="file-upload">
        <label>
          Загрузите CSV‑файл с данными (столбцы: давность, частота, сумма, период):&nbsp;
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </label>
      </div>
      <div className="period-select">
        <label>
          Выберите период:&nbsp;
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            {availablePeriods.map(period => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </label>
      </div>

      {metrics && (
        <div>
          <h3>Период: {selectedPeriod}</h3>

          {/* Гистограмма для давности */}
          <div className="explanation-box">
            <p>
              Этот отчет показывает распределение клиентов по давности (количество дней с последней покупки).
              Чем ниже значение – тем активнее клиент.
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={metrics.давностьBins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" label={{ value: 'Давность', position: 'insideBottomRight' }} />
                <YAxis label={{ value: 'Количество клиентов', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {metrics.давностьBins.map((entry, index) => (
                    <Cell key={`cell-${index}`} onClick={() => handleHistogramClick('давность', entry.bin, 10)} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Гистограмма для частоты */}
          <div className="explanation-box">
            <p>
              Этот отчет отображает распределение клиентов по количеству покупок.
              Более высокая частота указывает на активных клиентов.
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={metrics.частотаBins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" label={{ value: 'Частота', position: 'insideBottomRight' }} />
                <YAxis label={{ value: 'Количество клиентов', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d">
                  {metrics.частотаBins.map((entry, index) => (
                    <Cell key={`cell-${index}`} onClick={() => handleHistogramClick('частота', entry.bin, 1)} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Гистограмма для суммы */}
          <div className="explanation-box">
            <p>
              Этот отчет показывает распределение клиентов по сумме покупок.
              Высокие значения могут указывать на платежеспособных клиентов.
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={metrics.суммаBins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" label={{ value: 'Сумма', position: 'insideBottomRight' }} />
                <YAxis label={{ value: 'Количество клиентов', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658">
                  {metrics.суммаBins.map((entry, index) => (
                    <Cell key={`cell-${index}`} onClick={() => handleHistogramClick('сумма', entry.bin, 100)} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Гистограмма для взвешенного RFM балла */}
          <div className="explanation-box">
            <p>
              Этот отчет отображает распределение взвешенного RFM балла, рассчитанного с учетом значимости давности, частоты и суммы.
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={metrics.weightedBins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" label={{ value: 'Взвешенный балл', position: 'insideBottomRight' }} />
                <YAxis label={{ value: 'Количество клиентов', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {metrics.weightedBins.map((entry, index) => (
                    <Cell key={`cell-${index}`} onClick={() => handleHistogramClick('взвешенный', entry.bin, 0.5)} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Диаграмма разброса: частота vs сумма */}
          <div className="explanation-box">
            <p>
              Этот отчет отображает зависимость между количеством покупок и суммой покупок с выделением кластеров (k‑means).
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="частота"
                  name="Частота"
                  label={{ value: 'Частота', position: 'insideBottomRight' }}
                />
                <YAxis
                  type="number"
                  dataKey="сумма"
                  name="Сумма"
                  label={{ value: 'Сумма', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Клиенты"
                  data={metrics.computedData}
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    let fillColor = "#8884d8";
                    if (payload.cluster === 0) fillColor = "#8884d8";
                    else if (payload.cluster === 1) fillColor = "#82ca9d";
                    else fillColor = "#ffc658";
                    return <circle cx={cx} cy={cy} r={5} fill={fillColor} />;
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Диаграмма распределения по сегментам */}
          <div className="explanation-box">
            <p>
              Этот отчет показывает распределение клиентов по общепринятым сегментам RFM (например, «Чемпионы», «Лояльные клиенты» и т.д.).
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer>
              <BarChart data={metrics.segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" label={{ value: 'Сегменты', position: 'insideBottomRight' }} />
                <YAxis label={{ value: 'Количество клиентов', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d">
                  {metrics.segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} onClick={() => handleHistogramClick('сегмент', entry.segment)} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Тепловая карта */}
          <div className="explanation-box">
            <p>
              Тепловая карта показывает матрицу, где строки – баллы давности (R) от 1 до 4, а столбцы – баллы частоты (F) от 1 до 4.
              В ячейках указан средний показатель суммы покупок и количество клиентов. Цвет ячейки зависит от среднего значения.
              Нажмите на ячейку для просмотра списка клиентов.
            </p>
          </div>
          <div className="chart-container">
            <HeatmapChart heatmapData={metrics.heatmapData} onCellClick={handleHeatmapCellClick} />
          </div>

          {/* Дополнительный отчет: CLV и риск оттока */}
          <div className="explanation-box-alt">
            <p>
              Дополнительный отчет: Прогноз CLV и риск оттока клиентов. Для каждого сегмента рассчитывается средний прогнозируемый CLV,
              а также процент клиентов с высоким риском оттока.
            </p>
          </div>
          <div className="chart-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Сегмент</th>
                  <th>Количество клиентов</th>
                  <th>Средний CLV</th>
                  <th>Риск оттока</th>
                </tr>
              </thead>
              <tbody>
                {metrics.segmentData.map((seg, index) => {
                  const clientsInSegment = metrics.computedData.filter(client => client.segmentName === seg.segment);
                  const avgCLV = clientsInSegment.reduce((sum, client) => sum + client.predictedCLV, 0) / (clientsInSegment.length || 1);
                  const churnCount = clientsInSegment.filter(client => client.churnRisk === "High").length;
                  const churnPercentage = ((churnCount / clientsInSegment.length) * 100).toFixed(2);
                  return (
                    <tr key={index}>
                      <td>{seg.segment}</td>
                      <td>{seg.count}</td>
                      <td>{avgCLV.toFixed(2)}</td>
                      <td>{churnPercentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Модальное окно для списка клиентов */}
          {selectedFilter && (
            <div className="modal-overlay" onClick={() => setSelectedFilter(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>
                  Список клиентов{" "}
                  {selectedFilter.type === 'давность' && `с давностью от ${selectedFilter.min} до ${selectedFilter.max - 1} дней`}
                  {selectedFilter.type === 'частота' && `с частотой от ${selectedFilter.min} до ${selectedFilter.max - 1} покупок`}
                  {selectedFilter.type === 'сумма' && `с суммой от ${selectedFilter.min} до ${selectedFilter.max - 1}`}
                  {selectedFilter.type === 'взвешенный' && `с взвешенным баллом от ${selectedFilter.min} до ${selectedFilter.max - 0.01}`}
                  {selectedFilter.type === 'сегмент' && `для сегмента "${selectedFilter.segment}"`}
                  {selectedFilter.type === 'тепловая' && `для ячейки R ${selectedFilter.r} – F ${selectedFilter.f}`}
                </h3>
                <button onClick={() => setSelectedFilter(null)}>Закрыть</button>
                {getFilteredClients().length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Давность</th>
                        <th>Частота</th>
                        <th>Сумма</th>
                        <th>R</th>
                        <th>F</th>
                        <th>M</th>
                        <th>Сегмент</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredClients().map(client => (
                        <tr key={client.id}>
                          <td>{client.id}</td>
                          <td>{client.давность}</td>
                          <td>{client.частота}</td>
                          <td>{client.сумма.toFixed(2)}</td>
                          <td>{client.rScore}</td>
                          <td>{client.fScore}</td>
                          <td>{client.mScore}</td>
                          <td>{client.segmentName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Нет клиентов, удовлетворяющих данному условию.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RFMAnalysisDashboard;