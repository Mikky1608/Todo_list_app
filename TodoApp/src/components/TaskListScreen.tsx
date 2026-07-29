import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { Task, User, StatusFilter, PriorityFilter } from '../types';
import { TaskModal } from './TaskModal';

interface TaskListScreenProps {
  user: User;
  onLogout: () => void;
}

export const TaskListScreen: React.FC<TaskListScreenProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      console.error('Fetch tasks error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.token, onLogout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleCreateOrUpdateTask = async (taskData: {
    title: string;
    description: string;
    dateTime: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    if (editingTask) {
      // Update Task
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updated = await response.json();
      setTasks(prev => prev.map(t => (t._id === updated._id ? updated : t)));
    } else {
      // Create Task
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const created = await response.json();
      setTasks(prev => [created, ...prev]);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newCompleted = !task.completed;
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t._id === task._id ? { ...t, completed: newCompleted } : t)),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!response.ok) {
        // Revert on error
        setTasks(prev =>
          prev.map(t => (t._id === task._id ? { ...t, completed: task.completed } : t)),
        );
      }
    } catch (err) {
      setTasks(prev =>
        prev.map(t => (t._id === task._id ? { ...t, completed: task.completed } : t)),
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            setTasks(prev => prev.filter(t => t._id !== taskId));
            try {
              await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });
            } catch (err) {
              fetchTasks(); // Reload if delete fails
            }
          },
        },
      ],
    );
  };

  const filteredTasks = tasks.filter(task => {
    // Search query filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = !task.completed;
    if (statusFilter === 'completed') matchesStatus = task.completed;

    // Priority filter
    let matchesPriority = true;
    if (priorityFilter !== 'all') matchesPriority = task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;

  const renderTaskItem = ({ item }: { item: Task }) => {
    const priorityColor =
      item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#F59E0B' : '#10B981';

    return (
      <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
        <TouchableOpacity
          style={styles.checkboxTouch}
          onPress={() => handleToggleComplete(item)}>
          <View
            style={[
              styles.checkbox,
              item.completed && styles.checkboxChecked,
            ]}>
            {item.completed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
        </TouchableOpacity>

        <View style={styles.taskDetails}>
          <View style={styles.taskTopRow}>
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.taskTitleCompleted,
              ]}>
              {item.title}
            </Text>
            <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
              <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
                {item.priority?.toUpperCase() || 'MEDIUM'}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text
              style={[
                styles.taskDescription,
                item.completed && styles.taskDescriptionCompleted,
              ]}
              numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.taskMetaRow}>
            <Text style={styles.metaText}>📅 {item.dateTime?.slice(0, 10) || 'Scheduled'}</Text>
            <Text style={styles.metaText}>⏰ Deadline: {item.deadline?.slice(0, 10) || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => {
              setEditingTask(item);
              setModalVisible(true);
            }}>
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => handleDeleteTask(item._id)}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.greetingText}>Hello 👋</Text>
          <Text style={styles.userEmailText}>{user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Log Out 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['all', 'pending', 'completed'] as StatusFilter[]).map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterPill,
              statusFilter === status && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter(status)}>
            <Text
              style={[
                styles.filterPillText,
                statusFilter === status && styles.filterPillTextActive,
              ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.filterPill,
            priorityFilter === 'high' && styles.filterPillActiveHigh,
          ]}
          onPress={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}>
          <Text
            style={[
              styles.filterPillText,
              priorityFilter === 'high' && styles.filterPillTextActive,
            ]}>
            🔥 High
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Task List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item._id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try tweaking your search term or filters'
                  : 'Tap the + button below to create your first task!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Add Task Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTask(null);
          setModalVisible(true);
        }}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create / Edit Modal */}
      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateOrUpdateTask}
        initialTask={editingTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greetingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  userEmailText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  logoutButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
    padding: 0,
  },
  clearIcon: {
    color: '#94A3B8',
    fontSize: 14,
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterPillActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterPillActiveHigh: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'flex-start',
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#0F172A',
  },
  checkboxTouch: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskDetails: {
    flex: 1,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  taskDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
    lineHeight: 18,
  },
  taskDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  taskMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  actionIconButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});
