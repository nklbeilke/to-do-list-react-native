import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BackBtn } from '../components/backBtn';

export default function PomodoroTimer() {
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(pomodoroDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/alarm.mp3')
      );
      soundRef.current = sound;
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) return prev - 1;

          clearInterval(interval);

          // Toca o som ao fim do ciclo
          if (soundRef.current) {
            soundRef.current.replayAsync();
          }

          const nextIsBreak = !isBreak;
          setIsBreak(nextIsBreak);

          // Se terminou um Pomodoro, salva como tarefa concluída
          if (!nextIsBreak) {
            salvarPomodoroComoTarefa();
          }

          const newTime = (nextIsBreak ? breakDuration : pomodoroDuration) * 60;
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isBreak, pomodoroDuration, breakDuration]);

  // Salva tarefa no AsyncStorage
  const salvarPomodoroComoTarefa = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tarefas');
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];

      const newTask = {
        id: Date.now(),
        title: 'Pomodoro concluído',
        description: 'Sessão de foco finalizada',
        category: 'foco',
        done: true,
      };

      const updatedTasks = [...parsedTasks, newTask];
      await AsyncStorage.setItem('tarefas', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Erro ao salvar pomodoro como tarefa:', error);
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60).padStart(2,'0'))
    const s = String(seconds % 60).startsWith(2, '0')
    return `${m}:${s}`;
  };

  return(
    <SafeAreaView>
     <View style={s.header}>
      <BackBtn/>
      <Text style={s.text2}>To Do List</Text>
     </View>

     <ScrollView>
      <View style={s.container}>
        <Text style={s.title}>Pomodoro Timer</Text>
        <Text style={s.modeText}>{isBreak? '|| Intervalo' : '🍅 Pomodoro'}</Text>
        <Text style={s.timer}>{formatTime(timeLeft)}</Text>

        <View style={s.inputContainer}>
          <Text>Pomodoro:</Text>
          <TextInput
            style={s.input}
            keyboardType="numeric"
            value={String(pomodoroDuration)}
            onChangeText={(text) =>{
              const val = parseInt(text) || 0;
              setPomodoroDuration(val);
              if(!isRunning && !isBreak) setTimeLeft(val * 60)
            }}
          />

          <Text>min</Text>
          <Text style={{ marginLeft: 20}}>intervalo:</Text>
          <TextInput
            style={s.input}
            keyboardType="numeric"
            value={String(breakDuration)}
            onChangeText={(text) => {
              const val = parseInt(text) || 0;
              setBreakDuration(val);
            }}
          />
          <Text>min</Text>
        </View>

            <TouchableOpacity
              style={[s.button, s.startButton]}
              onPress={() => setIsRunning(!isRunning)}
            >

            <Text style={s.buttonText}>
              {isRunning ? 'Pausar': 'Iniciar'}
            </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.button, s.resetButton]}
              onPress={() => {
                setIsRunning(false)
                setIsBreak(false)
                setTimeLeft(pomodoroDuration * 60);
              }}
            >
              <Text style={s.buttonText}>Resetar</Text>
            </TouchableOpacity>
      </View>
     </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#090909',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text2: {
    color: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 35,
    fontSize: 24,
    fontWeight: 'bold',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  container: {
    alignItems: 'center',
    marginTop: 10,
    padding: 5
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  modeText: {
    fontSize: 18,
    marginBottom: 10,
    fontStyle: 'italic'
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 50,
    height: 40,
    textAlign: 'center',
    marginHorizontal: 5,
    borderRadius: 5,
    paddingHorizontal: 5
  },
  button: {
    backgroundColor: '#090909',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    elevation: 3
  },
  resetButton: {
    backgroundColor: '#090909'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});