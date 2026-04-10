#!/usr/bin/env node
/**
 * Seed per-module quiz.json files extracted from module theory.
 *
 * Each quiz has 5 MCQs authored against the theory headings and core
 * concepts of the module. Marked as v1 — Tiago should review before
 * publishing.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES_DIR = path.join(ROOT, "content", "modules");

const quizzes = {
  1: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m1-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Gradient Descent",
        question: "In vanilla gradient descent, what does the learning rate control?",
        options: [
          { text: "The number of training epochs", correct: false },
          { text: "The step size taken in the direction of the negative gradient", correct: true },
          { text: "The number of parameters in the model", correct: false },
          { text: "The batch size used during training", correct: false }
        ],
        explanation: "The learning rate α scales the gradient to determine how far each parameter update moves in the negative gradient direction."
      },
      {
        id: "m1-q2",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "SGD vs Batch GD",
        question: "What is the primary advantage of stochastic gradient descent (SGD) over full-batch gradient descent?",
        options: [
          { text: "SGD always converges to a lower loss", correct: false },
          { text: "SGD updates parameters more frequently and scales to large datasets", correct: true },
          { text: "SGD does not require a learning rate", correct: false },
          { text: "SGD computes the exact true gradient", correct: false }
        ],
        explanation: "SGD uses a single sample (or mini-batch) per update, enabling faster updates and tractable training on large datasets, at the cost of gradient noise."
      },
      {
        id: "m1-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "NumPy",
        question: "Which NumPy operation computes the element-wise product of two arrays of identical shape?",
        options: [
          { text: "np.dot(a, b)", correct: false },
          { text: "a @ b", correct: false },
          { text: "a * b", correct: true },
          { text: "np.matmul(a, b)", correct: false }
        ],
        explanation: "The * operator performs element-wise (Hadamard) multiplication in NumPy, whereas np.dot and @ perform matrix multiplication."
      },
      {
        id: "m1-q4",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "TensorFlow Basics",
        question: "What is the purpose of tf.GradientTape?",
        options: [
          { text: "To record operations for automatic differentiation", correct: true },
          { text: "To save model weights to disk", correct: false },
          { text: "To accelerate training on GPU only", correct: false },
          { text: "To visualize training metrics", correct: false }
        ],
        explanation: "tf.GradientTape records forward operations so gradients can be computed via reverse-mode autodiff when tape.gradient() is called."
      },
      {
        id: "m1-q5",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Deep Learning History",
        question: "Which factor is generally NOT considered a primary driver of the deep learning revolution of the 2010s?",
        options: [
          { text: "Availability of large labeled datasets (e.g. ImageNet)", correct: false },
          { text: "GPU-accelerated parallel computation", correct: false },
          { text: "Quantum computing hardware", correct: true },
          { text: "Algorithmic advances (ReLU, dropout, batch norm)", correct: false }
        ],
        explanation: "The deep learning revolution was driven by data, compute (GPUs), and algorithmic advances. Quantum computing was not a contributor."
      }
    ]
  },
  2: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m2-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Activation Functions",
        question: "Which activation function suffers most severely from the vanishing gradient problem in deep networks?",
        options: [
          { text: "ReLU", correct: false },
          { text: "Sigmoid", correct: true },
          { text: "Leaky ReLU", correct: false },
          { text: "GELU", correct: false }
        ],
        explanation: "Sigmoid saturates at both ends, squashing gradients toward zero. ReLU and its variants mitigate this by having a constant gradient on the positive side."
      },
      {
        id: "m2-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Universal Approximation",
        question: "The Universal Approximation Theorem states that a feedforward network with at least one hidden layer can approximate any continuous function. What does it NOT guarantee?",
        options: [
          { text: "That such a network exists in principle", correct: false },
          { text: "That training will find the approximating network", correct: true },
          { text: "That arbitrary precision is theoretically possible", correct: false },
          { text: "That non-linear activations are required", correct: false }
        ],
        explanation: "The theorem is an existence result. It does not guarantee that optimization (gradient descent) will actually find such a network, or how wide it must be."
      },
      {
        id: "m2-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Backpropagation",
        question: "Backpropagation computes gradients by applying which calculus rule?",
        options: [
          { text: "The product rule only", correct: false },
          { text: "The chain rule", correct: true },
          { text: "Integration by parts", correct: false },
          { text: "Taylor expansion", correct: false }
        ],
        explanation: "Backpropagation is a systematic application of the chain rule in reverse topological order over the computation graph."
      },
      {
        id: "m2-q4",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Loss Functions",
        question: "Which loss function is most appropriate for multi-class classification with mutually exclusive classes?",
        options: [
          { text: "Mean Squared Error", correct: false },
          { text: "Binary Cross-Entropy", correct: false },
          { text: "Categorical Cross-Entropy", correct: true },
          { text: "Huber Loss", correct: false }
        ],
        explanation: "Categorical cross-entropy (combined with softmax) is the standard choice for single-label multi-class classification."
      },
      {
        id: "m2-q5",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Gradient Flow",
        question: "Which technique does NOT directly help stabilize gradient flow in deep networks?",
        options: [
          { text: "Batch Normalization", correct: false },
          { text: "Residual (skip) connections", correct: false },
          { text: "Xavier/He initialization", correct: false },
          { text: "Increasing the mini-batch size arbitrarily", correct: true }
        ],
        explanation: "Simply enlarging the batch size does not address gradient vanishing or exploding; normalization, skip connections, and proper init do."
      }
    ]
  },
  3: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m3-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Convolution Basics",
        question: "What is the output spatial size for a convolution with input size 32, kernel 3, stride 1, and padding 1?",
        options: [
          { text: "30", correct: false },
          { text: "32", correct: true },
          { text: "34", correct: false },
          { text: "16", correct: false }
        ],
        explanation: "Output = (32 + 2·1 − 3)/1 + 1 = 32. 'Same' padding preserves spatial dimensions at stride 1."
      },
      {
        id: "m3-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Convolution vs Cross-Correlation",
        question: "What is a key difference between mathematical convolution and the 'convolution' used in deep learning?",
        options: [
          { text: "DL convolution uses matrix multiplication; math convolution doesn't", correct: false },
          { text: "DL convolution skips the kernel flip, so it's actually cross-correlation", correct: true },
          { text: "DL convolution only works on 1D data", correct: false },
          { text: "They are computationally identical with no difference", correct: false }
        ],
        explanation: "Deep learning 'convolution' layers skip the kernel-flip step, making them cross-correlation. For learned kernels, this is functionally equivalent."
      },
      {
        id: "m3-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Receptive Field",
        question: "Stacking two 3×3 convolutions (stride 1) produces an effective receptive field of what size?",
        options: [
          { text: "3×3", correct: false },
          { text: "5×5", correct: true },
          { text: "6×6", correct: false },
          { text: "9×9", correct: false }
        ],
        explanation: "Two 3×3 convolutions compose to cover 5×5 input pixels — the motivation behind VGG's stacked small filters."
      },
      {
        id: "m3-q4",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Dilated Convolution",
        question: "What is the main benefit of dilated (atrous) convolutions?",
        options: [
          { text: "They reduce the number of parameters relative to standard convolutions", correct: false },
          { text: "They expand the receptive field without increasing parameters or losing resolution", correct: true },
          { text: "They automatically learn the optimal kernel size", correct: false },
          { text: "They eliminate the need for pooling", correct: false }
        ],
        explanation: "Dilation inserts gaps between kernel taps, enlarging the receptive field while keeping parameter count and feature map size fixed."
      },
      {
        id: "m3-q5",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Translation Invariance",
        question: "Which operation in a CNN contributes most to approximate translation invariance of the final representation?",
        options: [
          { text: "Weight sharing in convolutional filters", correct: false },
          { text: "Spatial pooling (e.g. max pooling)", correct: true },
          { text: "Batch normalization", correct: false },
          { text: "Dropout", correct: false }
        ],
        explanation: "Convolution gives equivariance; pooling (plus the final global average) is what yields approximate translation invariance of outputs."
      }
    ]
  },
  4: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m4-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Adam Optimizer",
        question: "The Adam optimizer combines which two ideas?",
        options: [
          { text: "Momentum and adaptive per-parameter learning rates", correct: true },
          { text: "Second-order Newton updates and line search", correct: false },
          { text: "Dropout and batch normalization", correct: false },
          { text: "Weight decay and gradient clipping", correct: false }
        ],
        explanation: "Adam uses exponentially decaying moving averages of gradients (momentum) and squared gradients (RMSProp-style adaptive rates)."
      },
      {
        id: "m4-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "LR Scheduling",
        question: "What is the main goal of a learning-rate warm-up schedule?",
        options: [
          { text: "To start with a small LR and gradually increase it, stabilizing early training", correct: true },
          { text: "To reduce the LR at each step until convergence", correct: false },
          { text: "To avoid needing an optimizer at all", correct: false },
          { text: "To train with a constant LR throughout", correct: false }
        ],
        explanation: "Warm-up avoids divergent updates early in training when gradient statistics are unstable, especially for large-batch or transformer training."
      },
      {
        id: "m4-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Batch Normalization",
        question: "Batch Normalization primarily addresses which problem?",
        options: [
          { text: "Overfitting", correct: false },
          { text: "Internal covariate shift and gradient scale instability", correct: true },
          { text: "Computation cost of activations", correct: false },
          { text: "Label noise", correct: false }
        ],
        explanation: "BN stabilizes the distribution of layer inputs across training, accelerating convergence and enabling higher learning rates."
      },
      {
        id: "m4-q4",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Second-Order Methods",
        question: "Why are exact second-order methods (e.g. full Newton) rarely used in deep learning?",
        options: [
          { text: "They don't converge in theory", correct: false },
          { text: "The Hessian is too large to compute and invert for modern networks", correct: true },
          { text: "They require reinforcement learning", correct: false },
          { text: "TensorFlow doesn't support them", correct: false }
        ],
        explanation: "For N parameters the Hessian is N×N — prohibitive for millions of parameters. Approximations like K-FAC or Hessian-vector products are used instead."
      },
      {
        id: "m4-q5",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Regularization",
        question: "Which statement about weight decay (L2 regularization) is TRUE?",
        options: [
          { text: "It penalizes large weights to reduce overfitting", correct: true },
          { text: "It forces all weights to zero", correct: false },
          { text: "It is mathematically equivalent to dropout", correct: false },
          { text: "It replaces the need for a validation set", correct: false }
        ],
        explanation: "L2 weight decay adds λ·||w||² to the loss, discouraging large weights and improving generalization."
      }
    ]
  },
  5: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m5-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Segmentation Basics",
        question: "What distinguishes semantic segmentation from object detection?",
        options: [
          { text: "Segmentation predicts bounding boxes; detection predicts pixels", correct: false },
          { text: "Segmentation assigns a class label to every pixel; detection localizes object instances with boxes", correct: true },
          { text: "They are the same task", correct: false },
          { text: "Segmentation only works on grayscale images", correct: false }
        ],
        explanation: "Semantic segmentation produces per-pixel class labels; object detection outputs bounding boxes per instance."
      },
      {
        id: "m5-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "U-Net",
        question: "What is the purpose of U-Net's skip connections?",
        options: [
          { text: "To combine high-resolution encoder features with upsampled decoder features", correct: true },
          { text: "To reduce the number of parameters", correct: false },
          { text: "To skip training unnecessary layers", correct: false },
          { text: "To implement residual learning like ResNet", correct: false }
        ],
        explanation: "Skip connections preserve spatial detail from the encoder and fuse it with the decoder's upsampled features, improving localization."
      },
      {
        id: "m5-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Atrous Convolution",
        question: "In DeepLab, why are atrous (dilated) convolutions used?",
        options: [
          { text: "To reduce inference time via sparser kernels", correct: false },
          { text: "To preserve feature map resolution while enlarging the receptive field", correct: true },
          { text: "To replace pooling entirely with learnable layers", correct: false },
          { text: "To enable color-space augmentation", correct: false }
        ],
        explanation: "DeepLab uses atrous convolutions to capture multi-scale context without downsampling the feature maps."
      },
      {
        id: "m5-q4",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Loss Functions",
        question: "Which loss is commonly used to handle severe class imbalance in segmentation?",
        options: [
          { text: "Mean Squared Error", correct: false },
          { text: "Dice loss or focal loss", correct: true },
          { text: "Hinge loss", correct: false },
          { text: "KL divergence", correct: false }
        ],
        explanation: "Dice and focal losses directly address class imbalance by emphasizing under-represented regions or hard examples."
      },
      {
        id: "m5-q5",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Evaluation",
        question: "What does mean Intersection over Union (mIoU) measure?",
        options: [
          { text: "The average pixel accuracy across images", correct: false },
          { text: "The average per-class overlap between predicted and ground-truth masks", correct: true },
          { text: "The mean training loss", correct: false },
          { text: "The variance of predictions", correct: false }
        ],
        explanation: "mIoU averages IoU over classes; it is the standard segmentation metric because it is robust to class imbalance."
      }
    ]
  },
  6: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m6-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "IoU",
        question: "Intersection over Union (IoU) between two bounding boxes is computed as:",
        options: [
          { text: "Area of intersection divided by area of union", correct: true },
          { text: "Area of union divided by area of intersection", correct: false },
          { text: "Sum of areas minus intersection", correct: false },
          { text: "Intersection area divided by image area", correct: false }
        ],
        explanation: "IoU = |A ∩ B| / |A ∪ B|, ranging from 0 (no overlap) to 1 (perfect)."
      },
      {
        id: "m6-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Anchor Boxes",
        question: "What problem do anchor boxes help solve in object detectors?",
        options: [
          { text: "They remove the need for a classification head", correct: false },
          { text: "They provide reference shapes for predicting objects of varying sizes and aspect ratios", correct: true },
          { text: "They replace non-max suppression", correct: false },
          { text: "They eliminate the need for training data", correct: false }
        ],
        explanation: "Anchors provide a set of prior box shapes at each spatial location, so the network predicts offsets relative to them."
      },
      {
        id: "m6-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "NMS",
        question: "What is the purpose of non-maximum suppression (NMS) in detection?",
        options: [
          { text: "To increase recall by keeping all predictions", correct: false },
          { text: "To remove redundant overlapping boxes, keeping the highest-scoring one", correct: true },
          { text: "To normalize bounding box coordinates", correct: false },
          { text: "To compute the loss function", correct: false }
        ],
        explanation: "NMS removes duplicate detections of the same object by suppressing lower-scoring boxes that overlap a higher-scoring one above an IoU threshold."
      },
      {
        id: "m6-q4",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Focal Loss",
        question: "Focal Loss modifies cross-entropy to address what problem?",
        options: [
          { text: "Vanishing gradients", correct: false },
          { text: "The extreme foreground/background class imbalance in dense detectors", correct: true },
          { text: "Overfitting small models", correct: false },
          { text: "Learning rate decay", correct: false }
        ],
        explanation: "Focal loss down-weights easy examples so that training focuses on hard, misclassified examples — critical for one-stage detectors like RetinaNet."
      },
      {
        id: "m6-q5",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "FPN",
        question: "What does a Feature Pyramid Network (FPN) provide?",
        options: [
          { text: "A smaller model for embedded devices", correct: false },
          { text: "Multi-scale feature maps enabling detection of objects at various sizes", correct: true },
          { text: "Quantized inference", correct: false },
          { text: "A replacement for the backbone network", correct: false }
        ],
        explanation: "FPN builds a top-down pathway with lateral connections, producing feature maps at multiple scales with rich semantics at each."
      }
    ]
  },
  7: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m7-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "GAN Basics",
        question: "What are the two networks in a GAN, and what do they do?",
        options: [
          { text: "Encoder and decoder, which compress and reconstruct", correct: false },
          { text: "Generator produces samples; discriminator tries to distinguish real from fake", correct: true },
          { text: "Teacher and student, for knowledge distillation", correct: false },
          { text: "Actor and critic, for reinforcement learning", correct: false }
        ],
        explanation: "A GAN trains a generator and a discriminator in an adversarial minimax game."
      },
      {
        id: "m7-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Mode Collapse",
        question: "What is mode collapse in GAN training?",
        options: [
          { text: "The discriminator becoming too weak to train further", correct: false },
          { text: "The generator producing only a limited variety of outputs, ignoring large parts of the data distribution", correct: true },
          { text: "Gradients exploding in the generator", correct: false },
          { text: "The loss function going negative", correct: false }
        ],
        explanation: "Mode collapse occurs when the generator maps many latent vectors to few outputs, failing to cover the true data distribution."
      },
      {
        id: "m7-q3",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "WGAN",
        question: "Wasserstein GAN replaces Jensen-Shannon divergence with which metric?",
        options: [
          { text: "KL divergence", correct: false },
          { text: "Earth Mover's (Wasserstein-1) distance", correct: true },
          { text: "L2 distance in pixel space", correct: false },
          { text: "Hellinger distance", correct: false }
        ],
        explanation: "WGAN minimizes the Earth Mover's distance, which provides smoother gradients even when distributions don't overlap."
      },
      {
        id: "m7-q4",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Spectral Normalization",
        question: "Spectral normalization constrains each layer's:",
        options: [
          { text: "Mean activation to be zero", correct: false },
          { text: "Largest singular value (spectral norm), enforcing 1-Lipschitz continuity", correct: true },
          { text: "L1 norm of weights", correct: false },
          { text: "Number of parameters", correct: false }
        ],
        explanation: "Dividing weights by their largest singular value keeps the discriminator 1-Lipschitz, stabilizing training in WGAN and related formulations."
      },
      {
        id: "m7-q5",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "StyleGAN",
        question: "What innovation does StyleGAN introduce in its generator architecture?",
        options: [
          { text: "A purely convolutional encoder", correct: false },
          { text: "A mapping network plus adaptive instance normalization (AdaIN) injecting styles at each resolution", correct: true },
          { text: "Reinforcement learning for generation", correct: false },
          { text: "A transformer-only architecture", correct: false }
        ],
        explanation: "StyleGAN maps latent z to intermediate w, then injects w via AdaIN at each scale — disentangling coarse and fine style attributes."
      }
    ]
  },
  8: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m8-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Word Embeddings",
        question: "Why are distributed word embeddings preferred over one-hot representations?",
        options: [
          { text: "They are smaller AND capture semantic similarity between words", correct: true },
          { text: "They are easier to interpret by humans", correct: false },
          { text: "They don't require training data", correct: false },
          { text: "They are always sparse", correct: false }
        ],
        explanation: "Dense embeddings are low-dimensional and place semantically similar words near each other in vector space."
      },
      {
        id: "m8-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Word2Vec",
        question: "The Word2Vec skip-gram objective predicts:",
        options: [
          { text: "The current word from surrounding context", correct: false },
          { text: "Surrounding context words from the current word", correct: true },
          { text: "The next sentence given the current one", correct: false },
          { text: "Whether two documents are similar", correct: false }
        ],
        explanation: "Skip-gram inverts CBOW: given a center word, predict its context words within a window."
      },
      {
        id: "m8-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Attention",
        question: "In scaled dot-product attention, why is the dot product divided by √dₖ?",
        options: [
          { text: "To normalize the output to sum to 1", correct: false },
          { text: "To prevent the softmax from saturating when dₖ is large", correct: true },
          { text: "To enforce a positive-definite kernel", correct: false },
          { text: "To speed up computation on GPU", correct: false }
        ],
        explanation: "Large dₖ makes dot products grow in magnitude, pushing softmax into saturated regions with vanishing gradients. Scaling by √dₖ counteracts this."
      },
      {
        id: "m8-q4",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Tokenization",
        question: "Subword tokenization (e.g. BPE) is useful because it:",
        options: [
          { text: "Eliminates the need for embeddings", correct: false },
          { text: "Handles rare and out-of-vocabulary words by composing them from subword units", correct: true },
          { text: "Always produces fewer tokens than word tokenization", correct: false },
          { text: "Works only for English", correct: false }
        ],
        explanation: "BPE, WordPiece, and SentencePiece split rare words into known subunits, giving open-vocabulary coverage with a fixed vocabulary."
      },
      {
        id: "m8-q5",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Transformers",
        question: "What role do positional encodings play in a transformer?",
        options: [
          { text: "They inject information about token order into an otherwise permutation-invariant architecture", correct: true },
          { text: "They determine the learning rate", correct: false },
          { text: "They replace the embedding layer", correct: false },
          { text: "They are only used during inference", correct: false }
        ],
        explanation: "Self-attention is permutation-invariant, so positional encodings (sinusoidal or learned) are added to embeddings to preserve sequence order information."
      }
    ]
  },
  9: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m9-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Stationarity",
        question: "A stationary time series has:",
        options: [
          { text: "Statistical properties (mean, variance, autocorrelation) that do not depend on time", correct: true },
          { text: "A constant value over time", correct: false },
          { text: "No seasonality only if the mean is zero", correct: false },
          { text: "Values that are all identical", correct: false }
        ],
        explanation: "Weak stationarity requires constant mean and autocovariance that depends only on lag, not on absolute time."
      },
      {
        id: "m9-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "ARIMA",
        question: "In ARIMA(p, d, q), the parameter d represents:",
        options: [
          { text: "The number of differencing operations applied to make the series stationary", correct: true },
          { text: "The number of data points per day", correct: false },
          { text: "The damping factor of the AR term", correct: false },
          { text: "The Kalman filter order", correct: false }
        ],
        explanation: "d is the integration order — how many times the series is differenced before fitting the ARMA(p, q) model."
      },
      {
        id: "m9-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Forecasting Strategies",
        question: "What is a disadvantage of recursive multi-step forecasting vs. direct forecasting?",
        options: [
          { text: "Recursive forecasting requires retraining for each horizon", correct: false },
          { text: "Errors compound because predictions are fed back as inputs", correct: true },
          { text: "It cannot handle multivariate data", correct: false },
          { text: "It only works with linear models", correct: false }
        ],
        explanation: "Recursive forecasting feeds predicted values into the next step, so forecasting error accumulates across the horizon."
      },
      {
        id: "m9-q4",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "LSTM",
        question: "What does the forget gate of an LSTM control?",
        options: [
          { text: "How much of the previous cell state to retain", correct: true },
          { text: "Which inputs are discarded entirely before processing", correct: false },
          { text: "The learning rate for that time step", correct: false },
          { text: "The gradient clipping threshold", correct: false }
        ],
        explanation: "The forget gate produces values in [0,1] that elementwise multiply the previous cell state, deciding what to retain."
      },
      {
        id: "m9-q5",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "Windowing",
        question: "When using a sliding window for sequence modeling, the window size should be chosen based on:",
        options: [
          { text: "The GPU memory only", correct: false },
          { text: "The relevant temporal dependency in the data (plus memory constraints)", correct: true },
          { text: "The number of classes", correct: false },
          { text: "The optimizer learning rate", correct: false }
        ],
        explanation: "The window must be long enough to capture relevant temporal dependencies (seasonality, lag structure) without exceeding memory budgets."
      }
    ]
  },
  10: {
    version: 1,
    passingScore: 70,
    questions: [
      {
        id: "m10-q1",
        type: "multiple-choice",
        difficulty: "easy",
        topic: "Quantization",
        question: "Post-training INT8 quantization primarily aims to:",
        options: [
          { text: "Increase model accuracy on the training set", correct: false },
          { text: "Reduce model size and speed up inference with minimal accuracy loss", correct: true },
          { text: "Improve the training loss", correct: false },
          { text: "Replace the optimizer", correct: false }
        ],
        explanation: "INT8 quantization shrinks weights/activations from 32-bit floats to 8-bit ints, cutting memory ~4× and often accelerating inference."
      },
      {
        id: "m10-q2",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "TFLite",
        question: "TensorFlow Lite is optimized primarily for which deployment target?",
        options: [
          { text: "Large multi-GPU training clusters", correct: false },
          { text: "Mobile, embedded, and edge devices", correct: true },
          { text: "Web browsers only", correct: false },
          { text: "High-throughput serving in data centers", correct: false }
        ],
        explanation: "TFLite provides a compact runtime and ops tuned for on-device inference on phones, microcontrollers, and edge accelerators."
      },
      {
        id: "m10-q3",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "TF Serving",
        question: "TensorFlow Serving exposes models via:",
        options: [
          { text: "Only gRPC", correct: false },
          { text: "Both gRPC and REST APIs, with model versioning", correct: true },
          { text: "File I/O only", correct: false },
          { text: "A mandatory GUI", correct: false }
        ],
        explanation: "TF Serving supports gRPC and REST endpoints and manages multiple model versions for zero-downtime rollouts."
      },
      {
        id: "m10-q4",
        type: "multiple-choice",
        difficulty: "hard",
        topic: "TFX",
        question: "Which TFX component is responsible for detecting data anomalies and schema drift?",
        options: [
          { text: "Trainer", correct: false },
          { text: "ExampleGen", correct: false },
          { text: "StatisticsGen + ExampleValidator", correct: true },
          { text: "Pusher", correct: false }
        ],
        explanation: "StatisticsGen computes dataset statistics; ExampleValidator compares them against a schema to flag anomalies and drift."
      },
      {
        id: "m10-q5",
        type: "multiple-choice",
        difficulty: "medium",
        topic: "Monitoring",
        question: "Which metric is MOST useful for detecting concept drift in a deployed model?",
        options: [
          { text: "GPU utilization", correct: false },
          { text: "A decline in production accuracy or calibration on newly labeled data", correct: true },
          { text: "Docker image size", correct: false },
          { text: "Number of model versions", correct: false }
        ],
        explanation: "Concept drift manifests as degraded predictive performance on fresh labeled data; monitoring live accuracy/calibration detects it."
      }
    ]
  }
};

const moduleDirs = fs
  .readdirSync(MODULES_DIR)
  .filter((d) => /^\d{2}-/.test(d))
  .sort();

let written = 0;
for (const d of moduleDirs) {
  const metaPath = path.join(MODULES_DIR, d, "_meta.json");
  if (!fs.existsSync(metaPath)) continue;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  const q = quizzes[meta.number];
  if (!q) {
    console.warn(`No quiz defined for module ${meta.number}`);
    continue;
  }
  const out = path.join(MODULES_DIR, d, "quiz.json");
  fs.writeFileSync(out, JSON.stringify(q, null, 2) + "\n");
  console.log(`wrote ${out} (${q.questions.length} questions)`);
  written++;
}
console.log(`\nSeeded ${written} quiz.json files.`);
