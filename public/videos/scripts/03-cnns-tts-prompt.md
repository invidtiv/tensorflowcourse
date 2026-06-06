# Module 03 — Gemini TTS Prompt

Paste the code block into Google AI Studio. AUDIO PROFILE / SCENE / DIRECTOR'S NOTES are identical
across all modules (locked "Cory N." voice + seed); only SAMPLE CONTEXT, pronunciation, and
TRANSCRIPT change. Target ~115–130s.

---

```
# AUDIO PROFILE: Cory N.
## "The Course Narrator"
Role: An expert deep-learning instructor narrating an online course. Calm, credible,
genuinely fascinated by the material — the kind of teacher who makes a hard idea feel
inevitable. Mid-30s to 40s. Sounds like they have written production code and taught the
concept many times.

## THE SCENE: The Lesson Studio
A quiet, acoustically treated home studio, late evening, one warm desk lamp. There is no
audience and no hype — just the narrator speaking directly and patiently to a single learner
on the other side of the microphone. The mood is focused, encouraging, and unhurried.

### DIRECTOR'S NOTES
Style:
* Warm authority. A restrained "vocal smile" — credible over peppy, never an ad read.
* Land the key ideas. On each section's core concept, drop into a slightly lower, more
  deliberate register — "this part matters."
* Conversational, not declamatory. Explaining to one smart person, not lecturing a hall.

Pacing:
* Measured, roughly 145 words per minute. Unhurried but never sleepy.
* Small, deliberate micro-pauses right before a technical term so it has room to land.
* Let lists breathe — a beat between items rather than racing through them.

Accent: Neutral General American. Clean and broadcast-clear, no strong regional markers.

Articulation / pronunciation:
* "CNN" → "C-N-N". "3 by 3", "1 by 1" for kernel sizes. "ReLU" → "RAY-loo".
* "LeNet" → "LEH-net". "AlexNet" → "ALEX-net". "VGG" → "V-G-G". "ResNet" → "REZ-net".
* "EfficientNet" → "efficient-net". "ConvNeXt" → "conv-NEXT". "ImageNet" → "IMAGE-net".
* "BatchNorm" → "batch-norm". "MixUp", "CutMix", "RandAugment" → say plainly.
* "GlobalAveragePooling" → "global average pooling".

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Three on convolutional neural networks —
why convolutions beat dense layers on images, how the classic architectures evolved, and how
transfer learning lets you stand on ImageNet's shoulders.

#### TRANSCRIPT
[warmly] Welcome to Module Three — convolutional neural networks, the architecture that made
deep learning practical for images. We'll cover why convolutions beat dense layers, the building
blocks, the classic architectures, and transfer learning.

[thoughtfully] The convolution itself is simple: a small kernel slides across the image, applying
the same weights at every position. [with quiet emphasis] That weight sharing is the whole trick —
it gives you translation equivariance and a tiny fraction of the parameters a dense layer would
need. The number of filters sets your output channels, and the receptive field grows as you stack
layers deeper.

Between convolutions you downsample. Max pooling keeps the strongest response in a window, average
pooling smooths, and a strided convolution does the same thing but learns how. In modern nets,
global average pooling quietly replaces the old dense classifier head.

[curious] The architecture story is a quick tour. LeNet-5 in 'ninety-eight. AlexNet in twenty-twelve,
which added ReLU, GPUs, and dropout to win ImageNet. VGG went deeper with stacked three-by-three
convolutions. ResNet added skip connections and suddenly a hundred-plus layers trained cleanly.
EfficientNet and ConvNeXt are the modern refinements.

[with quiet emphasis] Here's the move you'll use most: transfer learning. Start from ImageNet
weights, freeze the base, and train a small head on your own data. Then unfreeze and fine-tune with
a much smaller learning rate — and match your preprocessing to the pretrained model, keeping
batch-norm layers in inference mode at first.

And almost for free, data augmentation regularizes you. Random flips, crops, and rotations are
built into Keras; MixUp, CutMix, and RandAugment go further. Just apply it during training only,
and lean on it harder when your dataset is small.

[warmly, encouraging] Let's build and visualize a CNN — open the labs.
```

---

Tuning: if it runs long, compress the architecture-evolution paragraph. Keep dates spoken as words
("twenty-twelve", "ninety-eight") so digits aren't misread.
