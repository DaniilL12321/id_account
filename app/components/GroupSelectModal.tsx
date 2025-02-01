import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Constants from 'expo-constants';

const { API_URL } = Constants.expoConfig?.extra || {};

interface Department {
  name: string;
  groups: string[];
}

interface GroupSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (group: string) => void;
  theme: any;
  currentGroup?: string;
}

export function GroupSelectModal({ visible, onClose, onSelect, theme, currentGroup }: GroupSelectModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/s/schedule/v1/schedule/actual_groups`);
      const data = await response.json();
      setDepartments(data.items);
      setError(null);
    } catch (error) {
      setError('Ошибка загрузки списка групп');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.map(dept => ({
    name: dept.name,
    groups: [...new Set(dept.groups)]
      .filter(group => 
        group.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.localeCompare(b))
  })).filter(dept => dept.groups.length > 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={theme.textColor} />
            </TouchableOpacity>
            <ThemedText style={[styles.title, { color: theme.textColor }]}>
              Выбор группы
            </ThemedText>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
            <IconSymbol name="magnifyingglass" size={20} color={theme.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: theme.textColor }]}
              placeholder="Поиск группы..."
              placeholderTextColor={theme.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accentColor} />
            </View>
          ) : error ? (
            <ThemedText style={[styles.errorText, { color: theme.textColor }]}>
              {error}
            </ThemedText>
          ) : (
            <ScrollView style={styles.departmentsList}>
              {filteredDepartments.map((dept, index) => (
                <View key={index} style={styles.departmentSection}>
                  <ThemedText style={[styles.departmentName, { color: theme.secondaryText }]}>
                    {dept.name}
                  </ThemedText>
                  <View style={styles.groupsGrid}>
                    {dept.groups.map((group, groupIndex) => (
                      <TouchableOpacity
                        key={groupIndex}
                        style={[
                          styles.groupButton,
                          { 
                            backgroundColor: theme.background,
                            borderColor: theme.borderColor,
                            ...(currentGroup === group && {
                              borderColor: theme.accentColor,
                            })
                          }
                        ]}
                        onPress={() => {
                          onSelect(group);
                          onClose();
                        }}
                      >
                        <View style={styles.groupButtonContent}>
                          <ThemedText style={{ color: theme.textColor }}>
                            {group}
                          </ThemedText>
                          {currentGroup === group && (
                            <IconSymbol 
                              name="checkmark" 
                              size={16} 
                              color={theme.accentColor}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 8,
    maxHeight: '90%',

    ...(Platform.OS === 'web' ? {
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
      margin: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginTop: 50,
    } : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    padding: 8,
    borderRadius: 10,
    ...(Platform.OS === 'ios' ? {
      marginTop: -15,
      marginBottom: 5,
    } : {}),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 4,
  },
  departmentsList: {
    padding: 16,
  },
  departmentSection: {
    marginBottom: 20,
  },
  departmentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  groupsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupButton: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
  },
  groupButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    padding: 32,
    textAlign: 'center',
  },
}); 