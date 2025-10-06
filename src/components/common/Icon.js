import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Icon as PaperIcon } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomIcon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const [iconError, setIconError] = useState(false);
  
  // Icon mapping for react-native-paper (which works on Android)
  const paperIconMap = {
    'home': 'home',
    'home': 'home',
    'database': 'database',
    'database': 'database',
    'swap-horizontal': 'swap-horizontal',
    'chart-bar': 'chart-bar',
    'chart-line': 'chart-line',
    'tools': 'tools',
    'account': 'account',
    'account': 'account',
    'book-open-variant': 'book-open-variant',
    'home-group': 'home-group',
    'credit-card': 'credit-card',
    'checkbook': 'checkbook',
    'help-circle': 'help-circle',
    'chart-line': 'chart-line',
    'file-document': 'file-document',
    'truck-delivery': 'truck-delivery',
    'phone-in-talk': 'phone-in-talk',
    'cash-plus': 'cash-plus',
    'file-document': 'file-document',
    'office-building': 'office-building',
    'home-city': 'home-city',
    'cash-multiple': 'cash-multiple',
    'package-variant': 'package-variant',
    'handshake': 'handshake',
    'account-group': 'account-group',
    'account-multiple': 'account-multiple',
    'bank': 'bank',
    'ruler': 'ruler',
    'home-analytics': 'home-analytics',
    'account-cash': 'account-cash',
    'format-list-bulleted': 'format-list-bulleted',
    'file-chart': 'file-chart',
    'check-circle': 'check-circle',
    'phone-log': 'phone-log',
    'email': 'email',
    'transfer': 'transfer',
    'package-variant-closed': 'package-variant-closed',
    'currency-usd': 'currency-usd',
    'close-circle': 'close-circle',
    'calendar-clock': 'calendar-clock',
    'account-details': 'account-details',
    'arrow-left': 'arrow-left',
    'menu': 'menu',
    'account-circle': 'account-circle',
    'cog': 'cog',
    'account-tie': 'account-tie',
    'file-certificate': 'file-certificate',
    'text-box-check': 'text-box-check',
    'cake-variant': 'cake-variant',
  };

  const paperIconName = paperIconMap[name] || name;

  // Use react-native-paper Icon (which works on Android)
  return (
    <PaperIcon
      source={paperIconName}
      size={size}
      color={color}
      style={style}
      {...props}
    />
  );
};

export default CustomIcon;
