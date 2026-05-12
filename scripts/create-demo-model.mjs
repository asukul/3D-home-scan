import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(rootDir, 'public', 'models', 'demo-home.gltf');

const positions = [
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
  [1, -1, -1],
  [-1, -1, -1],
  [-1, 1, -1],
  [1, 1, -1],
  [-1, -1, -1],
  [-1, -1, 1],
  [-1, 1, 1],
  [-1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
  [1, 1, -1],
  [1, 1, 1],
  [-1, 1, 1],
  [1, 1, 1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, -1],
  [1, -1, -1],
  [1, -1, 1],
  [-1, -1, 1],
];

const normals = [
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, 1],
  [0, 0, -1],
  [0, 0, -1],
  [0, 0, -1],
  [0, 0, -1],
  [-1, 0, 0],
  [-1, 0, 0],
  [-1, 0, 0],
  [-1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, -1, 0],
  [0, -1, 0],
  [0, -1, 0],
];

const indices = [
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14,
  12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
];

const positionBuffer = Buffer.alloc(positions.length * 3 * 4);
positions.flat().forEach((value, index) => {
  positionBuffer.writeFloatLE(value, index * 4);
});

const normalBuffer = Buffer.alloc(normals.length * 3 * 4);
normals.flat().forEach((value, index) => {
  normalBuffer.writeFloatLE(value, index * 4);
});

const indexBuffer = Buffer.alloc(indices.length * 2);
indices.forEach((value, index) => {
  indexBuffer.writeUInt16LE(value, index * 2);
});

const combinedBuffer = Buffer.concat([positionBuffer, normalBuffer, indexBuffer]);
const positionOffset = 0;
const normalOffset = positionBuffer.byteLength;
const indexOffset = positionBuffer.byteLength + normalBuffer.byteLength;

const materials = [
  {
    name: 'warm oak floor',
    pbrMetallicRoughness: {
      baseColorFactor: [0.65, 0.48, 0.31, 1],
      metallicFactor: 0,
      roughnessFactor: 0.86,
    },
  },
  {
    name: 'painted wall',
    pbrMetallicRoughness: {
      baseColorFactor: [0.9, 0.91, 0.87, 1],
      metallicFactor: 0,
      roughnessFactor: 0.78,
    },
  },
  {
    name: 'deep green cabinet',
    pbrMetallicRoughness: {
      baseColorFactor: [0.08, 0.24, 0.2, 1],
      metallicFactor: 0,
      roughnessFactor: 0.62,
    },
  },
  {
    name: 'soft blue sofa',
    pbrMetallicRoughness: {
      baseColorFactor: [0.17, 0.34, 0.55, 1],
      metallicFactor: 0,
      roughnessFactor: 0.7,
    },
  },
  {
    name: 'sunlit scan volume',
    alphaMode: 'BLEND',
    pbrMetallicRoughness: {
      baseColorFactor: [0.96, 0.67, 0.28, 0.32],
      metallicFactor: 0,
      roughnessFactor: 0.38,
    },
  },
];

const meshes = materials.map((_, materialIndex) => ({
  primitives: [
    {
      attributes: {
        POSITION: 0,
        NORMAL: 1,
      },
      indices: 2,
      material: materialIndex,
    },
  ],
}));

const nodes = [
  {
    name: 'floor slab',
    mesh: 0,
    scale: [3.6, 0.04, 2.45],
    translation: [0, 0, 0],
  },
  {
    name: 'ceiling slab',
    mesh: 1,
    scale: [3.6, 0.04, 2.45],
    translation: [0, 2.7, 0],
  },
  {
    name: 'back wall',
    mesh: 1,
    scale: [3.6, 1.35, 0.05],
    translation: [0, 1.35, -2.45],
  },
  {
    name: 'left wall',
    mesh: 1,
    scale: [0.05, 1.35, 2.45],
    translation: [-3.6, 1.35, 0],
  },
  {
    name: 'right wall',
    mesh: 1,
    scale: [0.05, 1.35, 2.45],
    translation: [3.6, 1.35, 0],
  },
  {
    name: 'kitchen island',
    mesh: 2,
    scale: [0.72, 0.44, 0.38],
    translation: [-0.95, 0.48, -0.9],
  },
  {
    name: 'sofa base',
    mesh: 3,
    scale: [1.05, 0.32, 0.42],
    translation: [1.3, 0.36, 0.85],
  },
  {
    name: 'sofa back',
    mesh: 3,
    scale: [1.05, 0.42, 0.12],
    translation: [1.3, 0.78, 1.22],
  },
  {
    name: 'scan volume',
    mesh: 4,
    scale: [1.1, 1.18, 0.04],
    translation: [0, 1.26, 1.62],
  },
];

const gltf = {
  asset: {
    version: '2.0',
    generator: '3D Home Scan demo generator',
  },
  scene: 0,
  scenes: [
    {
      nodes: nodes.map((_, index) => index),
    },
  ],
  nodes,
  meshes,
  materials,
  buffers: [
    {
      byteLength: combinedBuffer.byteLength,
      uri: `data:application/octet-stream;base64,${combinedBuffer.toString('base64')}`,
    },
  ],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: positionOffset,
      byteLength: positionBuffer.byteLength,
      target: 34962,
    },
    {
      buffer: 0,
      byteOffset: normalOffset,
      byteLength: normalBuffer.byteLength,
      target: 34962,
    },
    {
      buffer: 0,
      byteOffset: indexOffset,
      byteLength: indexBuffer.byteLength,
      target: 34963,
    },
  ],
  accessors: [
    {
      bufferView: 0,
      byteOffset: 0,
      componentType: 5126,
      count: positions.length,
      type: 'VEC3',
      min: [-1, -1, -1],
      max: [1, 1, 1],
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5126,
      count: normals.length,
      type: 'VEC3',
    },
    {
      bufferView: 2,
      byteOffset: 0,
      componentType: 5123,
      count: indices.length,
      type: 'SCALAR',
    },
  ],
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(gltf, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
