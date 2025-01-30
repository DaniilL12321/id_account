// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { Platform, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, StyleProp } from 'react-native';

const iconMap: Record<string, keyof typeof Ionicons['glyphMap']> = {
  'house.fill': 'home',
  'house': 'home-outline',
  'person.crop.circle': 'person-circle-outline',
  'person.crop.circle.fill': 'person-circle',
  'gearshape': 'settings-outline',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-forward',
  'moon.fill': 'moon',
  'gearshape.fill': 'settings',
  'bell.fill': 'notifications',
  'bell': 'notifications-outline',
  'globe': 'globe',
  'info.circle.fill': 'information-circle',
  'chevron.left': 'chevron-back',
  'star.fill': 'star',
  'checkmark.circle.fill': 'checkmark-circle',
  'exclamationmark.circle.fill': 'alert-circle',
  'doc.fill': 'document',
  'calendar': 'calendar',
  'person.2.fill': 'people',
  'books.vertical.fill': 'library',
  'mappin.circle.fill': 'location',
  'person.fill': 'person',
  'video.fill': 'videocam',
  'checkmark': 'checkmark',
  'xmark': 'close',
  'list.bullet': 'list',
  'chart.bar.fill': 'stats-chart',
  'graduationcap.fill': 'school',
  'creditcard.fill': 'card',
  'doc.text.fill': 'document-text',
  'doc.on.doc.fill': 'documents',
  'arrow.right.circle.fill': 'arrow-forward-circle',
  'arrow.left.circle.fill': 'arrow-back-circle',
  'photo.fill': 'images',
  'qrcode': 'qr-code',
  'gear': 'settings-outline',
};

export type IconSymbolName = keyof typeof iconMap;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = Platform.select({
    ios: name as any,
    default: iconMap[name]
  });
  
  return (
    <Ionicons 
      name={iconName} 
      size={size} 
      color={color} 
      style={[
        style,
        Platform.select({
          web: {
            cursor: 'pointer',
            userSelect: 'none',
          }
        })
      ]} 
    />
  );
}
