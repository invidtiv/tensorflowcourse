# Module 02 — Gemini TTS Prompt

Paste the code block into Google AI Studio (Gemini Native Audio / TTS). Keep the AUDIO PROFILE,
SCENE, and DIRECTOR'S NOTES identical to Module 01 (same "Cory N." narrator + locked voice/seed);
only SAMPLE CONTEXT, pronunciation, and TRANSCRIPT change. Target ~115–130s.

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
on the other side of the microphone. The mood is focused, encouraging, and unhurried. Nothing
here is being sold; something is being taught.

### DIRECTOR'S NOTES
Style:
* Warm authority. A restrained "vocal smile" — you can hear that the narrator likes this
  subject, but it never tips into ad-read enthusiasm. Credible over peppy.
* Land the key ideas. On the core concept of each section, drop into a slightly lower, more
  deliberate register — "this part matters."
* Conversational, not declamatory. Explaining to one smart person, not lecturing a hall.

Pacing:
* Measured, roughly 145 words per minute. Unhurried but never sleepy.
* Small, deliberate micro-pauses right before a technical term so it has room to land.
* Let lists breathe — a beat between items rather than racing through them.

Accent: Neutral General American. Clean and broadcast-clear, no strong regional markers.

Articulation / pronunciation:
* "ReLU" → "RAY-loo". "GELU" → "GEH-loo". "tanh" → "tann-AITCH". "MLP" → "M-L-P".
* "XOR" → "EX-or". "Glorot" → "glor-OH". "He initialization" → "HEE initialization".
* "w·x + b" → "w dot x, plus b". "GradientTape" → one word, confident.

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Two, which builds the neural network from
its smallest unit — a single neuron — up to a full multi-layer perceptron and the Keras training
loop. The goal is to make backpropagation feel mechanical rather than mysterious.

#### TRANSCRIPT
[warmly] Welcome to Module Two — neural network fundamentals. We'll build the network from the
ground up: the artificial neuron, activation functions, the forward and backward pass, and the
shape of a Keras training loop.

[thoughtfully] It starts with the perceptron — a single neuron. It weights its inputs, sums
them, adds a bias, and passes the result through an activation. On its own it can only draw a
straight line, so it can't even solve XOR. [with quiet emphasis] But stack neurons into hidden
layers, and a multi-layer perceptron becomes a universal function approximator.

The activation is what gives the network its power. Sigmoid and tanh saturate and choke the
gradient. ReLU is the cheap, sparse workhorse you'll reach for by default, and GELU is a smoother
cousin popular in Transformers. Pick the activation and the initializer together — He for ReLU.

[curious] So how does it learn? The forward pass computes a loss from the inputs and the current
weights. The backward pass walks the chain rule in reverse, where each layer contributes a local
Jacobian — really just a matrix multiply. The optimizer then nudges every weight, and
GradientTape makes that whole tape visible when you need to debug it.

In Keras you'll meet two front doors to the same engine. The Sequential API stacks layers in a
line — fastest to prototype. The Functional API builds arbitrary graphs with multiple inputs and
outputs. And subclassing the Model gives you full research freedom.

[with quiet emphasis] One last thing makes deep networks actually trainable: normalize your inputs
to mean zero and unit variance, let batch norm steady the activations in between, and match your
initializer to your activation — because bad initialization is exactly how gradients vanish or
explode.

[warmly, encouraging] Let's build your first MLP — open the labs.
```

---

Tuning: if the read overshoots ~130s, trim the backprop paragraph first. If it sounds flat, push
the Style "vocal smile" line harder.
