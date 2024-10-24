import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';

const { width, height } = Dimensions.get('window');
const maxGridSize = 500; // Maximum grid size to prevent it from being too large
const gridSize = Math.min(width, height) * 0.9;
const adjustedGridSize = Math.min(gridSize, maxGridSize);
const cellSize = adjustedGridSize / 9;

const SudokuGrid = ({ grid, pressedIndex, onCellPress, emptyIndices, hintedCells }) => {
  const renderGrid = () => {
    const gridComponents = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const isPressed = pressedIndex && pressedIndex[0] === row && pressedIndex[1] === col;
        const isEmpty = isCellEmpty(row, col);
        const isHinted = hintedCells && hintedCells.includes(`${row}-${col}`);
        const isEditable = isEmpty && !isHinted;

        gridComponents.push(
          <TouchableOpacity
            key={`${row}-${col}`}
            style={[
              styles.cell,
              !isEmpty && styles.preFilledCell,
              isHinted && styles.hintedCell,
              isPressed && styles.pressedCell,
            ]}
            onPress={() => onCellPress(row, col)}
            disabled={!isEditable}
          >
            <Text style={styles.cellText}>{grid[row][col]}</Text>
          </TouchableOpacity>
        );
      }
    }
    return gridComponents;
  };

  const isCellEmpty = (row, col) => {
    return emptyIndices.some(index => index[0] === row && index[1] === col);
  };

  return (
    <View style={styles.container}>
      <View style={styles.outline}>
        <View style={styles.grid}>{renderGrid()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'black',
    borderRadius: 15,
    borderWidth: 5,
    overflow: 'hidden',
    width: adjustedGridSize + 4,
    height: adjustedGridSize + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#333333',
    width: adjustedGridSize,
    height: adjustedGridSize,
  },
  cell: {
    width: cellSize - 2,
    height: cellSize - 2,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  preFilledCell: {
    backgroundColor: '#D3D3D3',
  },
  hintedCell: {
    backgroundColor: '#90EE90',
  },
  pressedCell: {
    backgroundColor: 'yellow',
  },
  cellText: {
    fontSize: cellSize * 0.5,
    fontFamily: 'Cabin-Medium',
  },
});

export default SudokuGrid;
