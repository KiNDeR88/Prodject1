import React from 'react';
import ProductAnalytics from '../ProductAnalytics/Dashboard';
import RFMAnalysis from '../RFMAnalysis/RFMAnalysisDashboard';
import ClientFilter from '../ClientFilter/ClientFilter';
import LoyaltySettings from '../LoyaltySettings/LoyaltySettings';
import './MainContent.css';

const MainContent = ({ selectedTool }) => {
  const renderTool = () => {
    switch (selectedTool) {
      case 'ProductAnalytics':
        return <ProductAnalytics />;
      case 'RFMAnalysis':
        return <RFMAnalysis />;
      case 'ClientFilter':
        return <ClientFilter />;
      case 'LoyaltySettings':
        return <LoyaltySettings />;
      default:
        return <div>Выберите инструмент из меню</div>;
    }
  };

  return <div className="main-content">{renderTool()}</div>;
};

export default MainContent;