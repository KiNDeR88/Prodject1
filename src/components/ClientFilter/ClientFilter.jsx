import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import debounce from 'lodash.debounce';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  CssBaseline,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const defaultFilters = {
  // Идентификатор
  customerId: "",
  // RFM-метрики
  recencyMin: "",
  recencyMax: "",
  frequencyMin: "",
  frequencyMax: "",
  monetaryMin: "",
  monetaryMax: "",
  loyaltyPointsMin: "",
  loyaltyPointsMax: "",
  // Карточка покупателя
  customerName: "",
  cardNumber: "",
  gender: "",
  ageMin: "",
  ageMax: "",
  region: "",
  registrationDateStart: "",
  registrationDateEnd: "",
  // Маркетинг
  marketingOpensMin: "",
  marketingOpensMax: "",
  marketingClicksMin: "",
  marketingClicksMax: "",
  socialActivityMin: "",
  socialActivityMax: "",
  salesChannel: "",
  // Лояльность и покупки
  clientStatus: "",
  purchaseCategory: "",
  avgCheckMin: "",
  avgCheckMax: "",
  purchaseCountMin: "",
  purchaseCountMax: "",
  // Дополнительные покупки
  lastPurchaseDateStart: "",
  lastPurchaseDateEnd: "",
  totalSpentPeriodMin: "",
  totalSpentPeriodMax: ""
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: "#2196f3" },
    secondary: { main: "#f50057" },
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '24px',
          margin: '16px 0',
          borderRadius: '12px',
          boxShadow: '0 3px 5px 2px rgba(33,203,243,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#2196f3",
          color: "#fff",
          fontWeight: 600,
          fontSize: '0.9rem',
        },
        body: { fontSize: '0.85rem' },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginTop: '8px',
          marginBottom: '8px',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '24px',
          margin: '16px 0',
          borderRadius: '12px',
          boxShadow: '0 3px 5px 2px rgba(144,202,249,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#90caf9",
          color: "#000",
          fontWeight: 600,
          fontSize: '0.9rem',
        },
        body: { fontSize: '0.85rem' },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:nth-of-type(odd)': { backgroundColor: '#2c2c2c' } } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginTop: '8px',
          marginBottom: '8px',
        },
      },
    },
  },
});

// Компонент для загрузки файла
function FileUpload({ onFileLoad, dataCount }) {
  return (
    <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Button variant="contained" component="label">
        Загрузить CSV файл
        <input type="file" accept=".csv" hidden onChange={onFileLoad} />
      </Button>
      {dataCount > 0 && (
        <Typography variant="body1">Загружено записей: {dataCount}</Typography>
      )}
    </Paper>
  );
}

// Основная панель фильтров
function FilterPanel({ filters, onFilterChange, onReset }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Идентификаторы */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Идентификаторы</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="ID клиента"
                name="customerId"
                value={filters.customerId}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* RFM Метрики */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">RFM Метрики</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Срок давности */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Срок давности</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="recencyMin"
                    type="number"
                    value={filters.recencyMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="recencyMax"
                    type="number"
                    value={filters.recencyMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Частота */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Частота</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="frequencyMin"
                    type="number"
                    value={filters.frequencyMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="frequencyMax"
                    type="number"
                    value={filters.frequencyMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Сумма */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Сумма</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="monetaryMin"
                    type="number"
                    value={filters.monetaryMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="monetaryMax"
                    type="number"
                    value={filters.monetaryMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Бонусные баллы */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Бонусные баллы</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="loyaltyPointsMin"
                    type="number"
                    value={filters.loyaltyPointsMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="loyaltyPointsMax"
                    type="number"
                    value={filters.loyaltyPointsMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Карточка покупателя */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Карточка покупателя</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Имя покупателя"
                name="customerName"
                value={filters.customerName}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Номер карточки"
                name="cardNumber"
                value={filters.cardNumber}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Пол"
                name="gender"
                value={filters.gender}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Возраст: От / До */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Возраст</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="ageMin"
                    type="number"
                    value={filters.ageMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="ageMax"
                    type="number"
                    value={filters.ageMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Регион/Город"
                name="region"
                value={filters.region}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Дата регистрации: От / До */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Дата регистрации</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="С"
                    name="registrationDateStart"
                    type="date"
                    value={filters.registrationDateStart}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="По"
                    name="registrationDateEnd"
                    type="date"
                    value={filters.registrationDateEnd}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Маркетинг */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Маркетинг</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Открытия маркетинга */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Открытия маркетинга</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="marketingOpensMin"
                    type="number"
                    value={filters.marketingOpensMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="marketingOpensMax"
                    type="number"
                    value={filters.marketingOpensMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Клики маркетинга */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Клики маркетинга</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="marketingClicksMin"
                    type="number"
                    value={filters.marketingClicksMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="marketingClicksMax"
                    type="number"
                    value={filters.marketingClicksMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Социальная активность */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Социальная активность</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="socialActivityMin"
                    type="number"
                    value={filters.socialActivityMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="socialActivityMax"
                    type="number"
                    value={filters.socialActivityMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Канал продаж */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Канал продаж"
                name="salesChannel"
                value={filters.salesChannel}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Лояльность и покупки */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Лояльность и покупки</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="client-status-label">Статус клиента</InputLabel>
                <Select
                  labelId="client-status-label"
                  label="Статус клиента"
                  name="clientStatus"
                  value={filters.clientStatus}
                  onChange={onFilterChange}
                >
                  <MenuItem value=""><em>Не выбран</em></MenuItem>
                  <MenuItem value="Bronze">Бронзовый</MenuItem>
                  <MenuItem value="Silver">Серебряный</MenuItem>
                  <MenuItem value="Gold">Золотой</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Категория покупок"
                name="purchaseCategory"
                value={filters.purchaseCategory}
                onChange={onFilterChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Средний чек */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Средний чек</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="avgCheckMin"
                    type="number"
                    value={filters.avgCheckMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="avgCheckMax"
                    type="number"
                    value={filters.avgCheckMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Кол-во покупок */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Кол-во покупок</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="purchaseCountMin"
                    type="number"
                    value={filters.purchaseCountMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="purchaseCountMax"
                    type="number"
                    value={filters.purchaseCountMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Дополнительные покупки */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Дополнительные покупки</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Дата последней покупки */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Дата последней покупки</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="С"
                    name="lastPurchaseDateStart"
                    type="date"
                    value={filters.lastPurchaseDateStart}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="По"
                    name="lastPurchaseDateEnd"
                    type="date"
                    value={filters.lastPurchaseDateEnd}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Суммарные траты */}
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>Суммарные траты</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label="От"
                    name="totalSpentPeriodMin"
                    type="number"
                    value={filters.totalSpentPeriodMin}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="До"
                    name="totalSpentPeriodMax"
                    type="number"
                    value={filters.totalSpentPeriodMax}
                    onChange={onFilterChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onReset}>Сбросить фильтры</Button>
      </Box>
    </Paper>
  );
}

// Таблица результатов
function DataTable({ data }) {
  return (
    <Paper>
      <Typography variant="h6" gutterBottom>
        Результаты фильтрации ({data.length} записей)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID клиента</TableCell>
              <TableCell>Срок давности</TableCell>
              <TableCell>Частота</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Бонусные баллы</TableCell>
              <TableCell>Имя покупателя</TableCell>
              <TableCell>Номер карточки</TableCell>
              <TableCell>Пол</TableCell>
              <TableCell>Возраст</TableCell>
              <TableCell>Регион</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell>Посещения сайта</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Категория покупок</TableCell>
              <TableCell>Средний чек</TableCell>
              <TableCell>Кол-во покупок</TableCell>
              <TableCell>Дата последней покупки</TableCell>
              <TableCell>Суммарные траты</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.customer_id}</TableCell>
                <TableCell>{row.recency}</TableCell>
                <TableCell>{row.frequency}</TableCell>
                <TableCell>{row.monetary}</TableCell>
                <TableCell>{row.loyalty_points}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.card_number}</TableCell>
                <TableCell>{row.gender}</TableCell>
                <TableCell>{row.age}</TableCell>
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.registration_date}</TableCell>
                <TableCell>{row.site_visits}</TableCell>
                <TableCell>{row.client_status}</TableCell>
                <TableCell>{row.purchase_category}</TableCell>
                <TableCell>{row.avg_check}</TableCell>
                <TableCell>{row.purchase_count}</TableCell>
                <TableCell>{row.last_purchase_date}</TableCell>
                <TableCell>{row.total_spent_period}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// Основной компонент
function App() {
  const [data, setData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [filters, setFilters] = useState(defaultFilters);
  const [darkMode, setDarkMode] = useState(false);

  // Обработка загрузки файла
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data;
        setData(parsedData);
        setFilteredData(parsedData);
        setPreviewData(parsedData.slice(0, 5));
        setSnackbar({ open: true, message: `Файл загружен. Записей: ${parsedData.length}`, severity: "success" });
      },
      error: (error) => {
        console.error("Ошибка при парсинге CSV:", error);
        setSnackbar({ open: true, message: "Ошибка при загрузке файла", severity: "error" });
      }
    });
  };

  // Изменение значений фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Применение фильтров
  const applyFilters = useCallback(() => {
    let newData = data;
    if (filters.customerId) newData = newData.filter(item => String(item.customer_id).includes(filters.customerId));
    if (filters.recencyMin !== "") newData = newData.filter(item => item.recency >= Number(filters.recencyMin));
    if (filters.recencyMax !== "") newData = newData.filter(item => item.recency <= Number(filters.recencyMax));
    if (filters.frequencyMin !== "") newData = newData.filter(item => item.frequency >= Number(filters.frequencyMin));
    if (filters.frequencyMax !== "") newData = newData.filter(item => item.frequency <= Number(filters.frequencyMax));
    if (filters.monetaryMin !== "") newData = newData.filter(item => item.monetary >= Number(filters.monetaryMin));
    if (filters.monetaryMax !== "") newData = newData.filter(item => item.monetary <= Number(filters.monetaryMax));
    if (filters.loyaltyPointsMin !== "") newData = newData.filter(item => item.loyalty_points >= Number(filters.loyaltyPointsMin));
    if (filters.loyaltyPointsMax !== "") newData = newData.filter(item => item.loyalty_points <= Number(filters.loyaltyPointsMax));
    // Карточка покупателя
    if (filters.customerName) newData = newData.filter(item => String(item.customer_name).toLowerCase().includes(filters.customerName.toLowerCase()));
    if (filters.cardNumber) newData = newData.filter(item => String(item.card_number).toLowerCase().includes(filters.cardNumber.toLowerCase()));
    if (filters.gender) newData = newData.filter(item => item.gender?.toLowerCase() === filters.gender.toLowerCase());
    if (filters.ageMin !== "") newData = newData.filter(item => item.age >= Number(filters.ageMin));
    if (filters.ageMax !== "") newData = newData.filter(item => item.age <= Number(filters.ageMax));
    if (filters.region) newData = newData.filter(item => String(item.region).toLowerCase().includes(filters.region.toLowerCase()));
    if (filters.registrationDateStart) newData = newData.filter(item => new Date(item.registration_date) >= new Date(filters.registrationDateStart));
    if (filters.registrationDateEnd) newData = newData.filter(item => new Date(item.registration_date) <= new Date(filters.registrationDateEnd));
    // Маркетинг
    if (filters.marketingOpensMin !== "") newData = newData.filter(item => item.marketing_opens >= Number(filters.marketingOpensMin));
    if (filters.marketingOpensMax !== "") newData = newData.filter(item => item.marketing_opens <= Number(filters.marketingOpensMax));
    if (filters.marketingClicksMin !== "") newData = newData.filter(item => item.marketing_clicks >= Number(filters.marketingClicksMin));
    if (filters.marketingClicksMax !== "") newData = newData.filter(item => item.marketing_clicks <= Number(filters.marketingClicksMax));
    if (filters.socialActivityMin !== "") newData = newData.filter(item => item.social_activity >= Number(filters.socialActivityMin));
    if (filters.socialActivityMax !== "") newData = newData.filter(item => item.social_activity <= Number(filters.socialActivityMax));
    if (filters.salesChannel) newData = newData.filter(item => item.sales_channel === filters.salesChannel);
    // Лояльность и покупки
    if (filters.clientStatus) newData = newData.filter(item => item.client_status === filters.clientStatus);
    if (filters.purchaseCategory) newData = newData.filter(item => String(item.purchase_category).toLowerCase().includes(filters.purchaseCategory.toLowerCase()));
    if (filters.avgCheckMin !== "") newData = newData.filter(item => item.avg_check >= Number(filters.avgCheckMin));
    if (filters.avgCheckMax !== "") newData = newData.filter(item => item.avg_check <= Number(filters.avgCheckMax));
    if (filters.purchaseCountMin !== "") newData = newData.filter(item => item.purchase_count >= Number(filters.purchaseCountMin));
    if (filters.purchaseCountMax !== "") newData = newData.filter(item => item.purchase_count <= Number(filters.purchaseCountMax));
    // Дополнительные покупки
    if (filters.lastPurchaseDateStart) newData = newData.filter(item => new Date(item.last_purchase_date) >= new Date(filters.lastPurchaseDateStart));
    if (filters.lastPurchaseDateEnd) newData = newData.filter(item => new Date(item.last_purchase_date) <= new Date(filters.lastPurchaseDateEnd));
    if (filters.totalSpentPeriodMin !== "") newData = newData.filter(item => item.total_spent_period >= Number(filters.totalSpentPeriodMin));
    if (filters.totalSpentPeriodMax !== "") newData = newData.filter(item => item.total_spent_period <= Number(filters.totalSpentPeriodMax));

    setFilteredData(newData);
    setSnackbar({ open: true, message: `Найдено записей: ${newData.length}`, severity: "info" });
  }, [data, filters]);

  // Дебаунс, чтобы не фильтровать при каждом символе
  const debouncedApplyFilters = useMemo(() => debounce(applyFilters, 300), [applyFilters]);

  useEffect(() => {
    debouncedApplyFilters();
    return () => debouncedApplyFilters.cancel();
  }, [filters, data, debouncedApplyFilters]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Система фильтрации клиентской базы
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FileUpload onFileLoad={handleFileUpload} dataCount={data.length} />
              {previewData.length > 0 && (
                <Paper sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Предпросмотр данных (первые 5 записей):</Typography>
                  <pre style={{ maxHeight: 150, overflow: 'auto', backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </Paper>
              )}
            </Grid>
            <Grid item xs={12}>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />
            </Grid>
            <Grid item xs={12}>
              <DataTable data={filteredData} />
            </Grid>
          </Grid>
        </Container>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;