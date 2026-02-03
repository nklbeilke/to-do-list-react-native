import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TaskItem from '../components/TaskItem';

    export default function Home (){
        const {tasks, setTasks} = useState([]);
        const {filter, setFilter} = useState('all');
        const router = useRouter();

        useEffect(() => {
            loadTasks();
        }, []);

        const loadTasks = async () => {
            const saved = await AsyncStorage.getItem('@tasks')
            if(saved){
                const parsed = JSON.parse(saved);
                // Garante que todas as tasks tenham o campo pomodoros como números mínimo 1
                const normalized = parsed.map( task => ({
                    ...task,
                    pomodoros: typeof task.pomodoros === 'number' && task.pomodoros > 0 ? task.pomodoros: 1,
                }));
                setTasks(normalized)
            }
        };


    const saveTasks = async(newTasks) => {
        setTasks(newTasks);
        await AsyncStorage.setItem('@tasks', JSON.stringify(newTasks));
    };

    const toggleDone = (id) => {

        const updated = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task
        );
        saveTasks(updated);
    };

    const startPomodoro = (task) => {
        router.push({
            pathname: '/pomodoroTimer',
            params: {taskId: task.id}
        });
    };

    const deleteTask = (id) => {
        const updated = tasks.filter(task => task.id !== id);
        saveTasks(updated);
    };

    const filteredTasks = tasks.filter(task => {
        if(filter === 'all') return true;
        if(filter === 'done') return task.done;
        if(filter === 'todo') return !task.done;
    });

    return(
        <SafeAreaView>
            <Text style={saveTasks.text2}>To Do List</Text>
            <ScrollView>
                <View style={s.container}>
                    <Text style={s.title}>Minhas Tarefas</Text>

                <View>
                    <TouchableOpacity onPress={() => setFilter('all')}>
                        <Text style={filter === 'all' ? s.active :s.filter}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilter('todo')}>
                        <Text style={filter === 'todo' ? s.active : s.filter}>Pendentes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilter('done')}>
                        <Text style={filter === 'done' ? s.active :s.filter}>Todas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('./add')}>
                        <Text style={s.filter}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('./pomodoroTimer')}>
                        <Text style={s.filter}>Pomodoro</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TaskItem
                        task={item}
                        onToggle={() => toggleDone(item.id)}
                        onDelete={() => deleteTask(item.id)}
                        onEdit={() => router.push({ pathname: '/edit', params: { id: item.id} })}
                        onStartPomodoro={() => startPomodoro(item)}
                        />
                    )}
                />
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    color: '#090909',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  text2: {
    color: '#ffffff',
    backgroundColor: '#090909',
    paddingHorizontal: 20,
    paddingVertical: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
    textAlign: "center",
    fontSize: 24,
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: "center",
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  filter: {
    color: 'gray'
  },
  active: {
    color: 'black',
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 10,
    position: 'absolute',
    alignItems: 'flex-end',
    right: 30,
    elevation: 4,
  }
});