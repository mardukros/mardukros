/**
 * Tensor Operations - Core ggml-inspired tensor operations for cognitive encoding
 * 
 * Provides tensor creation, manipulation, and mathematical operations
 * for encoding cognitive states and their evolution.
 */

import { Tensor, TensorShape, TensorData } from '../types.js';

/**
 * Creates a new tensor with specified shape and initial data
 */
export function makeTensor(shape: TensorShape, data?: TensorData, type: 'f32' | 'f16' | 'i32' = 'f32'): Tensor {
  const size = shape.reduce((acc, dim) => acc * dim, 1);
  
  let tensorData: TensorData;
  if (data) {
    if (data.length !== size) {
      throw new Error(`Data length ${data.length} doesn't match tensor size ${size}`);
    }
    tensorData = data instanceof Float32Array ? data : new Float32Array(data);
  } else {
    tensorData = new Float32Array(size).fill(0);
  }

  return {
    shape: [...shape],
    data: tensorData,
    type,
    size
  };
}

/**
 * Creates a tensor filled with random values
 */
export function randomTensor(shape: TensorShape, scale: number = 1.0): Tensor {
  const size = shape.reduce((acc, dim) => acc * dim, 1);
  const data = new Float32Array(size);
  
  for (let i = 0; i < size; i++) {
    // Box-Muller transform for Gaussian distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    data[i] = z * scale;
  }
  
  return makeTensor(shape, data);
}

/**
 * Creates a tensor filled with zeros
 */
export function zeroTensor(shape: TensorShape): Tensor {
  return makeTensor(shape);
}

/**
 * Creates a tensor filled with ones
 */
export function onesTensor(shape: TensorShape): Tensor {
  const size = shape.reduce((acc, dim) => acc * dim, 1);
  const data = new Float32Array(size).fill(1);
  return makeTensor(shape, data);
}

/**
 * Element-wise addition of two tensors
 */
export function addTensors(a: Tensor, b: Tensor): Tensor {
  if (!shapesEqual(a.shape, b.shape)) {
    throw new Error(`Shape mismatch: ${a.shape} vs ${b.shape}`);
  }
  
  const result = new Float32Array(a.size);
  const aData = a.data as Float32Array;
  const bData = b.data as Float32Array;
  
  for (let i = 0; i < a.size; i++) {
    result[i] = aData[i] + bData[i];
  }
  
  return makeTensor(a.shape, result);
}

/**
 * Element-wise multiplication of two tensors
 */
export function multiplyTensors(a: Tensor, b: Tensor): Tensor {
  if (!shapesEqual(a.shape, b.shape)) {
    throw new Error(`Shape mismatch: ${a.shape} vs ${b.shape}`);
  }
  
  const result = new Float32Array(a.size);
  const aData = a.data as Float32Array;
  const bData = b.data as Float32Array;
  
  for (let i = 0; i < a.size; i++) {
    result[i] = aData[i] * bData[i];
  }
  
  return makeTensor(a.shape, result);
}

/**
 * Scalar multiplication of a tensor
 */
export function scaleTensor(tensor: Tensor, scalar: number): Tensor {
  const result = new Float32Array(tensor.size);
  const data = tensor.data as Float32Array;
  
  for (let i = 0; i < tensor.size; i++) {
    result[i] = data[i] * scalar;
  }
  
  return makeTensor(tensor.shape, result);
}

/**
 * Matrix multiplication for 2D tensors
 */
export function matmul(a: Tensor, b: Tensor): Tensor {
  if (a.shape.length !== 2 || b.shape.length !== 2) {
    throw new Error('Matrix multiplication requires 2D tensors');
  }
  
  const [aRows, aCols] = a.shape;
  const [bRows, bCols] = b.shape;
  
  if (aCols !== bRows) {
    throw new Error(`Cannot multiply matrices: ${a.shape} x ${b.shape}`);
  }
  
  const result = new Float32Array(aRows * bCols);
  const aData = a.data as Float32Array;
  const bData = b.data as Float32Array;
  
  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      for (let k = 0; k < aCols; k++) {
        sum += aData[i * aCols + k] * bData[k * bCols + j];
      }
      result[i * bCols + j] = sum;
    }
  }
  
  return makeTensor([aRows, bCols], result);
}

/**
 * Applies softmax activation to a tensor
 */
export function softmax(tensor: Tensor): Tensor {
  const data = tensor.data as Float32Array;
  const result = new Float32Array(tensor.size);
  
  // Find max for numerical stability
  let max = -Infinity;
  for (let i = 0; i < tensor.size; i++) {
    max = Math.max(max, data[i]);
  }
  
  // Compute exponentials and sum
  let sum = 0;
  for (let i = 0; i < tensor.size; i++) {
    result[i] = Math.exp(data[i] - max);
    sum += result[i];
  }
  
  // Normalize
  for (let i = 0; i < tensor.size; i++) {
    result[i] /= sum;
  }
  
  return makeTensor(tensor.shape, result);
}

/**
 * Applies ReLU activation to a tensor
 */
export function relu(tensor: Tensor): Tensor {
  const data = tensor.data as Float32Array;
  const result = new Float32Array(tensor.size);
  
  for (let i = 0; i < tensor.size; i++) {
    result[i] = Math.max(0, data[i]);
  }
  
  return makeTensor(tensor.shape, result);
}

/**
 * Applies tanh activation to a tensor
 */
export function tanh(tensor: Tensor): Tensor {
  const data = tensor.data as Float32Array;
  const result = new Float32Array(tensor.size);
  
  for (let i = 0; i < tensor.size; i++) {
    result[i] = Math.tanh(data[i]);
  }
  
  return makeTensor(tensor.shape, result);
}

/**
 * Reshapes a tensor to new dimensions
 */
export function reshape(tensor: Tensor, newShape: TensorShape): Tensor {
  const newSize = newShape.reduce((acc, dim) => acc * dim, 1);
  
  if (newSize !== tensor.size) {
    throw new Error(`Cannot reshape tensor of size ${tensor.size} to shape with size ${newSize}`);
  }
  
  return makeTensor(newShape, tensor.data);
}

/**
 * Computes the L2 norm of a tensor
 */
export function norm(tensor: Tensor): number {
  const data = tensor.data as Float32Array;
  let sum = 0;
  
  for (let i = 0; i < tensor.size; i++) {
    sum += data[i] * data[i];
  }
  
  return Math.sqrt(sum);
}

/**
 * Normalizes a tensor to unit length
 */
export function normalize(tensor: Tensor): Tensor {
  const magnitude = norm(tensor);
  
  if (magnitude === 0) {
    return tensor;
  }
  
  return scaleTensor(tensor, 1 / magnitude);
}

/**
 * Computes cosine similarity between two tensors
 */
export function cosineSimilarity(a: Tensor, b: Tensor): number {
  if (!shapesEqual(a.shape, b.shape)) {
    throw new Error(`Shape mismatch: ${a.shape} vs ${b.shape}`);
  }
  
  const aData = a.data as Float32Array;
  const bData = b.data as Float32Array;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.size; i++) {
    dotProduct += aData[i] * bData[i];
    normA += aData[i] * aData[i];
    normB += bData[i] * bData[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Helper function to check if two shapes are equal
 */
function shapesEqual(a: TensorShape, b: TensorShape): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

/**
 * Clones a tensor
 */
export function cloneTensor(tensor: Tensor): Tensor {
  const data = new Float32Array(tensor.data as Float32Array);
  return makeTensor(tensor.shape, data, tensor.type);
}