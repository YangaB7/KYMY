import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, SafeAreaView, Alert } from 'react-native';
import Header from '../components/header';
import ExitModal from '../components/exitpage';

const { width, height } = Dimensions.get('window');

const TILE_SIZE = width > height ? height / 12 : width / 12; 
const TILE_SPACING = 5;

const COLORS = {
  background: '#f0f0f0',
  tileBackground: '#ffffff',
  tileSelected: '#ffcccc',
  tileUnavailable: '#dddddd',
  textColor: '#000000',
  tileShadow: '#000000',
};

const MahjongGame = ({ navigation }) => {
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  useEffect(() => {
    if (tiles.length > 0 && !checkForPossibleMoves()) {
      Alert.alert('Game Over', 'No more moves available!');
    }
  }, [tiles]);

  const initializeBoard = () => {
    const newTiles = [];
    let tileId = 0;

    const layers = [
      { rows: 7, cols: 15, z: 0 }, 
      { rows: 5, cols: 11, z: 1 },
      { rows: 3, cols: 7, z: 2 },
      { rows: 1, cols: 3, z: 3 },
    ];

    layers.forEach((layer) => {
      const { rows, cols, z } = layer;
      const startX = (15 - cols) / 2;
      const startY = (7 - rows) / 2;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          newTiles.push({
            x: x + startX,
            y: y + startY,
            z: z,
            value: Math.floor(Math.random() * 9) + 1,
            id: tileId++,
          });
        }
      }
    });

    shuffleArray(newTiles);

    setTiles(newTiles);
  };

  const shuffleArray = (array) => {
    array.sort(() => Math.random() - 0.5);
  };

  const isTileAvailable = (tile) => {
    const { x, y, z } = tile;

    const tilesAbove = tiles.filter(
      (t) =>
        t.z > z &&
        Math.abs(t.x - x) < 1 && // Overlapping in x
        Math.abs(t.y - y) < 1 // Overlapping in y
    );

    const leftBlocked = tiles.some(
      (t) => t.x === x - 1 && t.y === y && t.z === z
    );
    const rightBlocked = tiles.some(
      (t) => t.x === x + 1 && t.y === y && t.z === z
    );

    return (
      tilesAbove.length === 0 && (!leftBlocked || !rightBlocked)
    );
  };

  const checkForPossibleMoves = () => {
    const availableTiles = tiles.filter(isTileAvailable);
    const values = availableTiles.map((tile) => tile.value);
    const uniqueValues = new Set(values);

    for (let value of uniqueValues) {
      if (values.filter((v) => v === value).length >= 2) {
        return true;
      }
    }

    return false;
  };

  const onTilePress = (tile) => {
    if (!isTileAvailable(tile)) {
      Alert.alert('Invalid Move', 'This tile is not available for selection.');
      return;
    }

    if (selectedTiles.length === 0) {
      setSelectedTiles([tile]);
    } else if (selectedTiles.length === 1) {
      if (selectedTiles[0].id === tile.id) {
        setSelectedTiles([]);
      } else {
        setSelectedTiles([...selectedTiles, tile]);
        checkMatch([...selectedTiles, tile]);
      }
    }
  };

  const checkMatch = (selected) => {
    if (selected[0].value === selected[1].value) {
      const newTiles = tiles.filter(
        (t) => t.id !== selected[0].id && t.id !== selected[1].id
      );
      setTiles(newTiles);
      setSelectedTiles([]);
      if (newTiles.length === 0) {
        Alert.alert('Congratulations!', "You've cleared all the tiles!");
      }
    } else {
      setTimeout(() => setSelectedTiles([]), 1000);
    }
  };

  const renderTile = (tile) => {
    const { x, y, z, value, id } = tile;
    const tileLeft =
      x * (TILE_SIZE + TILE_SPACING) +
      z * 10 +
      (width - 15 * (TILE_SIZE + TILE_SPACING)) / 2;
    const tileTop =
      y * (TILE_SIZE + TILE_SPACING) -
      z * 10 +
      (height - 7 * (TILE_SIZE + TILE_SPACING)) / 2;
    const isSelected = selectedTiles.some((t) => t.id === id);
    const isAvailable = isTileAvailable(tile);

    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.tile,
          {
            left: tileLeft,
            top: tileTop,
            width: TILE_SIZE,
            height: TILE_SIZE,
            backgroundColor: isSelected
              ? COLORS.tileSelected
              : isAvailable
              ? COLORS.tileBackground
              : COLORS.tileUnavailable,
            shadowOffset: { width: -z * 2, height: z * 2 },
            zIndex: z * 100 + y,
          },
        ]}
        onPress={() => onTilePress(tile)}
        disabled={!isAvailable}
      >
        <Text style={[styles.tileText, { color: COLORS.textColor }]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: COLORS.background }]}
    >
      <Header
        title={'MAHJONG'}
        handleGoHome={() => setModalVisible(true)}
      />
      <ExitModal
        canSee={modalVisible}
        closeModal={() => closeModal()}
        handleGoHome={() => navigation.navigate('Home')}
      />
      <View style={styles.board}>{tiles.map(renderTile)}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  board: {
    flex: 1,
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    shadowColor: COLORS.tileShadow,
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  tileText: {
    fontSize: TILE_SIZE / 2,
    fontWeight: 'bold',
  },
});

export default MahjongGame;
