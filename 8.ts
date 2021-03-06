import { input, test1 } from "./8.in";
import { assertEqual } from "./assert";

type Layer = number[][];
type Dimensions = {
  width: number;
  height: number;
};
type FrequencyMap = Record<number, number>;

function getLayers(raw: number[], dimensions: Dimensions): Layer[] {
  const layers: Layer[] = [];

  let i = 0;
  while (i < raw.length) {
    const layer = [];
    for (let y = 0; y < dimensions.height; y++) {
      const row = [];
      for (let x = 0; x < dimensions.width; x++) {
        row.push(raw[i]);
        i++;
      }
      layer.push(row);
    }
    layers.push(layer);
  }

  return layers;
}

function getFrequency(
  frequencyMap: FrequencyMap,
  index: keyof FrequencyMap
): number {
  return frequencyMap[index] || 0;
}

function getFrequencyMap(layer: Layer, dimensions: Dimensions): FrequencyMap {
  const frequencyMap: FrequencyMap = {};
  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      const pixel = layer[y][x];
      frequencyMap[pixel] = getFrequency(frequencyMap, pixel) + 1;
    }
  }
  return frequencyMap;
}

function getChecksum(layers: Layer[], dimensions: Dimensions) {
  let minFrequency = Infinity;
  let minChecksum: number = 0;

  for (let layer of layers) {
    const frequencyMap = getFrequencyMap(layer, dimensions);
    const frequency = getFrequency(frequencyMap, 0);

    if (frequency < minFrequency) {
      minFrequency = frequency;
      minChecksum =
        getFrequency(frequencyMap, 1) * getFrequency(frequencyMap, 2);
    }
  }

  return minChecksum;
}

function getFinalLayer(layers: Layer[], dimensions: Dimensions) {
  let finalLayer: Layer = new Array(dimensions.height);
  for (let i = 0; i < dimensions.height; i++) {
    finalLayer[i] = new Array(dimensions.width);
  }

  for (let layer of layers) {
    for (let y = 0; y < dimensions.height; y++) {
      for (let x = 0; x < dimensions.width; x++) {
        if (finalLayer[y][x] == undefined && layer[y][x] !== 2) {
          finalLayer[y][x] = layer[y][x];
        }
      }
    }
  }
  return finalLayer;
}

function printLayer(layer: Layer, dimensions: Dimensions) {
  for (let y = 0; y < dimensions.height; y++) {
    for (let x = 0; x < dimensions.width; x++) {
      if (layer[y][x] === 1) {
        // @ts-ignore
        process.stdout.write("X");
      } else {
        // @ts-ignore
        process.stdout.write(" ");
      }
    }
    console.log();
  }
}

// assertEqual(
//   getChecksum(getLayers(test1.data, test1.dimensions), test1.dimensions),
//   1
// );

assertEqual(
  getChecksum(getLayers(input.data, input.dimensions), input.dimensions),
  1620
);

console.log(
  printLayer(
    getFinalLayer(getLayers(input.data, input.dimensions), input.dimensions),
    input.dimensions
  )
);
