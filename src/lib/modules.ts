import type { ModuleMeta } from "@/types/module";

export const modules: ModuleMeta[] = [
  {
    id: "01-intro-deep-learning",
    number: 1,
    title: "Introduction to Deep Learning and TensorFlow",
    shortTitle: "Intro to DL",
    description:
      "Understand the evolution of AI, master NumPy fundamentals, install TensorFlow, and implement gradient descent from scratch.",
    duration: "2 weeks",
    difficulty: "beginner",
    prerequisites: [],
    objectives: [
      "Understand the historical evolution of AI and deep learning",
      "Distinguish between AI, ML, and deep learning paradigms",
      "Master NumPy for numerical computing",
      "Install and configure TensorFlow environments",
      "Implement gradient descent optimization from scratch",
    ],
    icon: "🧠",
    color: "#00d4ff",
    labCount: 8,
  },
  {
    id: "02-neural-network-fundamentals",
    number: 2,
    title: "Neural Network Fundamentals",
    shortTitle: "NN Fundamentals",
    description:
      "Master perceptrons, activation functions, loss functions, backpropagation, and build networks with Keras Sequential and Functional APIs.",
    duration: "2 weeks",
    difficulty: "beginner",
    prerequisites: [1],
    objectives: [
      "Understand perceptron architecture and universal approximation",
      "Master activation and loss functions",
      "Implement backpropagation from scratch",
      "Build models with Keras Sequential and Functional APIs",
      "Apply normalization and custom training loops",
    ],
    icon: "🔗",
    color: "#8b5cf6",
    labCount: 16,
  },
  {
    id: "03-cnns",
    number: 3,
    title: "Convolutional Neural Networks",
    shortTitle: "CNNs",
    description:
      "Learn convolution mathematics, receptive fields, classic architectures (LeNet to Vision Transformers), and transfer learning.",
    duration: "2 weeks",
    difficulty: "beginner",
    prerequisites: [2],
    objectives: [
      "Understand convolution operations and receptive fields",
      "Implement CNNs from scratch and with Keras",
      "Master architecture evolution: LeNet → ResNet → ViT",
      "Apply feature visualization and transfer learning",
      "Build image classifiers on real datasets",
    ],
    icon: "👁️",
    color: "#ec4899",
    labCount: 14,
  },
  {
    id: "04-advanced-training",
    number: 4,
    title: "Advanced Training Methodologies",
    shortTitle: "Advanced Training",
    description:
      "Master optimizers, learning rate scheduling, normalization, regularization, data pipelines, mixed precision, and distributed training.",
    duration: "1 week",
    difficulty: "intermediate",
    prerequisites: [3],
    objectives: [
      "Compare and select optimizers (SGD, Adam, AdamW)",
      "Implement learning rate scheduling strategies",
      "Apply batch/layer/group normalization",
      "Build efficient tf.data pipelines",
      "Use mixed precision and distributed training",
    ],
    icon: "⚡",
    color: "#f59e0b",
    labCount: 19,
  },
  {
    id: "05-semantic-segmentation",
    number: 5,
    title: "Semantic Segmentation",
    shortTitle: "Segmentation",
    description:
      "Pixel-level prediction with FCN, U-Net, DeepLab architectures. Atrous convolution, loss functions, and post-processing.",
    duration: "1 week",
    difficulty: "intermediate",
    prerequisites: [3],
    objectives: [
      "Understand encoder-decoder architectures",
      "Implement FCN, U-Net, and DeepLab",
      "Master atrous/dilated convolutions",
      "Apply segmentation loss functions",
      "Post-process predictions with CRFs",
    ],
    icon: "🎨",
    color: "#10b981",
    labCount: 12,
  },
  {
    id: "06-object-detection",
    number: 6,
    title: "Object Detection Systems",
    shortTitle: "Object Detection",
    description:
      "Anchors, IoU, Feature Pyramid Networks, YOLO evolution, and Transformer-based detection with the TF Object Detection API.",
    duration: "1 week",
    difficulty: "intermediate",
    prerequisites: [3],
    objectives: [
      "Understand anchor-based detection",
      "Implement IoU and Non-Max Suppression",
      "Master YOLO family architectures",
      "Use TF Object Detection API",
      "Apply Feature Pyramid Networks",
    ],
    icon: "🎯",
    color: "#ef4444",
    labCount: 12,
  },
  {
    id: "07-gans",
    number: 7,
    title: "Generative Adversarial Networks",
    shortTitle: "GANs",
    description:
      "Minimax theory, mode collapse, DCGAN, conditional GAN, WGAN-GP, StyleGAN concepts, and evaluation metrics (IS/FID).",
    duration: "1 week",
    difficulty: "intermediate",
    prerequisites: [4],
    objectives: [
      "Understand adversarial training theory",
      "Implement GAN, DCGAN, and conditional GAN",
      "Address mode collapse with WGAN-GP",
      "Evaluate generative models with IS and FID",
      "Explore StyleGAN architecture concepts",
    ],
    icon: "🎭",
    color: "#a855f7",
    labCount: 14,
  },
  {
    id: "08-nlp",
    number: 8,
    title: "Natural Language Processing",
    shortTitle: "NLP",
    description:
      "Embeddings, RNN/LSTM/GRU, attention mechanisms, Transformer architecture, and BERT/GPT concepts with TensorFlow.",
    duration: "2 weeks",
    difficulty: "intermediate",
    prerequisites: [4],
    objectives: [
      "Master word embeddings and Word2Vec",
      "Implement RNN, LSTM, and GRU networks",
      "Understand attention mechanisms",
      "Build Transformer components from scratch",
      "Use pretrained embeddings for NLP tasks",
    ],
    icon: "📝",
    color: "#06b6d4",
    labCount: 15,
  },
  {
    id: "09-time-series",
    number: 9,
    title: "Time Series and Sequence Prediction",
    shortTitle: "Time Series",
    description:
      "Stationarity, ARIMA, windowing techniques, 1D CNNs, LSTMs for forecasting, multi-step prediction, and anomaly detection.",
    duration: "1 week",
    difficulty: "intermediate",
    prerequisites: [4],
    objectives: [
      "Understand time series fundamentals and stationarity",
      "Implement windowing and data preparation",
      "Build 1D CNN and LSTM forecasting models",
      "Apply multi-step and multi-variate prediction",
      "Detect anomalies in time series data",
    ],
    icon: "📈",
    color: "#14b8a6",
    labCount: 16,
  },
  {
    id: "10-production-deployment",
    number: 10,
    title: "Production Deployment and Optimization",
    shortTitle: "Deployment",
    description:
      "Model quantization, TFLite, TF Serving, TFX pipelines, MLOps practices, monitoring, and edge deployment.",
    duration: "2 weeks",
    difficulty: "advanced",
    prerequisites: [4],
    objectives: [
      "Optimize models with quantization and pruning",
      "Deploy with TFLite for mobile/edge",
      "Set up TF Serving for production",
      "Build TFX pipelines for MLOps",
      "Monitor models in production",
    ],
    icon: "🚀",
    color: "#f97316",
    labCount: 13,
  },
];

export function getModule(id: string): ModuleMeta | undefined {
  return modules.find((m) => m.id === id);
}

export function getModuleByNumber(num: number): ModuleMeta | undefined {
  return modules.find((m) => m.number === num);
}

export function getAdjacentModules(id: string) {
  const idx = modules.findIndex((m) => m.id === id);
  return {
    prev: idx > 0 ? modules[idx - 1] : null,
    next: idx < modules.length - 1 ? modules[idx + 1] : null,
  };
}
