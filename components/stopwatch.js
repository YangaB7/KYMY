import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Stopwatch = ({ startImmediately, externalPause }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (startImmediately) {
      startStopwatch();
    }

    return () => clearInterval(intervalRef.current); 
  }, [startImmediately]);

  useEffect(() => {
    if(externalPause) {
      stopStopwatch();
    }
  },[externalPause])

  const startStopwatch = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  const stopStopwatch = () => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTime(0);
  };

  const formatTime = (seconds) => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);
    return `${getHours} : ${getMinutes} : ${getSeconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(time)}</Text>
      <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={startStopwatch} style={styles.button}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetStopwatch} style={styles.button}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: "45%",
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  button: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 7,
  },
  buttonText: {
    color: '#ffcccc',
    fontSize: 25,
  },
});

export default Stopwatch;
