import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, SafeAreaView } from 'react-native';
import { AuthScreen } from './src/components/AuthScreen';
import { TaskListScreen } from './src/components/TaskListScreen';
import { User } from './src/types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView style={styles.container}>
        {user ? (
          <TaskListScreen user={user} onLogout={() => setUser(null)} />
        ) : (
          <AuthScreen onLoginSuccess={fetchedUser => setUser(fetchedUser)} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default App;
