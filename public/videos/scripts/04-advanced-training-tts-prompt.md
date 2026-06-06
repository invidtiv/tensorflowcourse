# Module 04 — Gemini TTS Prompt

Paste the code block into Google AI Studio. AUDIO PROFILE / SCENE / DIRECTOR'S NOTES are identical
across all modules (locked "Cory N." voice + seed); only SAMPLE CONTEXT, pronunciation, and
TRANSCRIPT change. Target ~120–135s.

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
* "SGD" → "S-G-D". "Adam" → "ADD-um". "AdamW" → "Adam-W". "Nadam" → "NAH-dam".
* "Nesterov" → "NESS-teh-rov". "Adamax" → "ADD-a-max". "OneCycle" → "one cycle".
* "FP16" → "F-P sixteen". "tf.data" → "T-F-dot-data". "AUTOTUNE" → "auto-tune".
* "MirroredStrategy" → "mirrored strategy". "L1 / L2" → "L-one / L-two".
* "BatchNorm / LayerNorm / GroupNorm / InstanceNorm" → say each as written.

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Four on advanced training — the optimizer
zoo, learning-rate schedules, the regularization toolkit, normalization variants, and fast
mixed-precision data pipelines. The tone is "let me save you a week of trial and error."

#### TRANSCRIPT
[warmly] Welcome to Module Four — advanced training. This is where you learn to optimize the way
the papers do: better optimizers, learning-rate schedules, regularization, and fast data pipelines.

[thoughtfully] Start with the optimizer zoo. For vision, plain SGD with momentum still beats Adam
surprisingly often. Adam adapts a per-parameter learning rate for you, and AdamW fixes it by
decoupling weight decay from the gradient step. [with quiet emphasis] But here's the thing — your
learning-rate schedule usually matters more than which optimizer you pick.

A constant learning rate plateaus early and wastes epochs. Step and exponential decay are simple but
dated. The modern default is cosine annealing with a short warmup, and the OneCycle policy can give
you super-convergence at a surprisingly large rate. Run an LR range test to find the highest stable
value first.

[curious] To fight overfitting, reach into the regularization toolkit. Dropout zeroes activations at
training time only. Weight decay penalizes large weights, while L1 also sparsifies them. Label
smoothing softens those hard one-hot targets. And early stopping simply remembers your best
validation loss and restores it.

Normalization deserves its own moment. Batch norm normalizes across the batch — great until your
batch is tiny. Layer norm works per sample and is the default inside Transformers. Group norm is the
batch-size-independent middle ground, and instance norm shows up in style transfer.

[with quiet emphasis] Finally, make it fast. Mixed-precision FP16 buys roughly a one-and-a-half to
two times speedup on modern GPUs, with a loss-scale optimizer guarding against underflow. Build the
input side with tf.data — prefetch, cache, and AUTOTUNE — scale out with MirroredStrategy, and
always profile before you guess where the bottleneck is.

[warmly, encouraging] Let's benchmark optimizers and schedules — open the labs.
```

---

Tuning: this module is dense; if it overshoots ~135s, trim the normalization paragraph to two
sentences. Spell out "FP16" as "F-P sixteen" if the model reads it oddly.
