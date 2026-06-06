# Module 01 — Narration Script (TEST DRAFT)

**Video:** Introduction to Deep Learning and TensorFlow
**Spec:** 1920×1080 · 30fps · matches `01-intro-deep-learning.json` storyboard
**Voice:** single narrator, calm/instructional, ~145 wpm

> ⚠️ Timing note: the storyboard scenes total **72s**, but comfortable narration of this content runs **~110s**. Either extend the scene `durationSec` values (recommended values in the last column) or trim narration. Recommended durations bring the video to **~108s**.

| # | Scene (storyboard) | On-screen | Voiceover | Words | Storyboard | Recommend |
|---|--------------------|-----------|-----------|------:|-----------:|----------:|
| 1 | title | "Introduction to Deep Learning" | Welcome to Module One — an introduction to deep learning and TensorFlow. | 11 | 4s | 5s |
| 2 | bullets | what DL is / why / 3 anchors | In the next minute: what deep learning actually is, why it took over machine learning this decade, and the three ideas it all rests on — representations, the chain rule, and gradient descent. | 32 | 8s | 13s |
| 3 | title | hand-crafted → learned | The big shift that started it all: moving from hand-crafted features to learned ones. | 14 | 3s | 6s |
| 4 | bullets | stack / composition / loss / backward | A deep network is just a stack of differentiable functions. Its power comes from composition, not one clever layer. Training means minimizing a single loss with gradient descent, and gradients flow backward through the chain rule. | 36 | 8s | 15s |
| 5 | title | "Why now?" | So why did all of this happen now? | 8 | 3s | 4s |
| 6 | bullets | ImageNet / GPUs / ReLU+BN / OSS | Three things converged: AlexNet on ImageNet in 2012 halved error rates, GPUs unlocked massive training, and tricks like ReLU and batch norm made depth stable — all wrapped in open-source frameworks. | 33 | 7s | 13s |
| 7 | title | TF, Keras, eager | The stack you'll use for that is TensorFlow and Keras. | 10 | 3s | 4s |
| 8 | bullets | Tensor / tf.function / Keras / Tape | Tensors are arrays that live on CPU or GPU. tf.function compiles your Python into a graph. Keras is the high-level API most courses teach. And GradientTape handles differentiation when you write custom loops. | 33 | 8s | 14s |
| 9 | title | GD in 30 seconds | Here's gradient descent in thirty seconds. | 6 | 3s | 3s |
| 10 | bullets | loss / gradient / step / repeat | Pick a loss that measures how wrong you are. Compute its gradient with respect to the parameters. Step against that gradient. Repeat on mini-batches until the loss plateaus — everything else in this course is variance reduction on that loop. | 39 | 9s | 15s |
| 11 | title | Course roadmap | Here's the road ahead. | 4 | 3s | 3s |
| 12 | bullets | modules / theory+labs+quiz / local | Ten modules — fundamentals, CNNs, advanced training, segmentation, detection, GANs, NLP, time series, and production. Each has theory, hands-on labs, and a quiz. And your progress stays on your device. | 31 | 9s | 13s |
| 13 | cta | "Start the hands-on labs →" | Let's get started — open the first lab. | 8 | 4s | 4s |
| | | | **Total** | **265** | **72s** | **~108s** |

---

## Continuous voiceover (for TTS / recording / Whisper alignment)

Welcome to Module One — an introduction to deep learning and TensorFlow.

In the next minute: what deep learning actually is, why it took over machine learning this decade, and the three ideas it all rests on — representations, the chain rule, and gradient descent.

The big shift that started it all: moving from hand-crafted features to learned ones. A deep network is just a stack of differentiable functions. Its power comes from composition, not one clever layer. Training means minimizing a single loss with gradient descent, and gradients flow backward through the chain rule.

So why did all of this happen now? Three things converged: AlexNet on ImageNet in 2012 halved error rates, GPUs unlocked massive training, and tricks like ReLU and batch norm made depth stable — all wrapped in open-source frameworks.

The stack you'll use for that is TensorFlow and Keras. Tensors are arrays that live on CPU or GPU. tf.function compiles your Python into a graph. Keras is the high-level API most courses teach. And GradientTape handles differentiation when you write custom loops.

Here's gradient descent in thirty seconds. Pick a loss that measures how wrong you are. Compute its gradient with respect to the parameters. Step against that gradient. Repeat on mini-batches until the loss plateaus — everything else in this course is variance reduction on that loop.

Here's the road ahead. Ten modules — fundamentals, CNNs, advanced training, segmentation, detection, GANs, NLP, time series, and production. Each has theory, hands-on labs, and a quiz. And your progress stays on your device.

Let's get started — open the first lab.
