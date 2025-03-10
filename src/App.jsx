import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';

const App = () => {
  const [selectedTool, setSelectedTool] = useState('ProductAnalytics');

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <MainContent selectedTool={selectedTool} />
    </div>
  );
};

export default App;