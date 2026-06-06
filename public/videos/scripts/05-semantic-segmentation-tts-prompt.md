# Module 05 — Gemini TTS Prompt

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
* "FCN" → "F-C-N". "1 by 1" convs. "U-Net" → "YOU-net". "ASPP" → "A-S-P-P".
* "DeepLab" → "DEEP-lab". "DeepLabv3+" → "deep-lab-v-three-plus". "atrous" → "AY-truss".
* "Dice loss" → "dice loss". "Tversky" → "TVERR-skee". "Focal" → "FOH-kul".
* "CRF" → "C-R-F". "mIoU" → "mean I-O-U". "Cityscapes", "Pascal VOC" → "pascal V-O-C".
* "nnU-Net" → "N-N-U-net".

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Five on semantic segmentation — moving from
whole-image labels to a class for every pixel, the encoder–decoder architectures that make that
possible, and the losses that survive heavy class imbalance.

#### TRANSCRIPT
[warmly] Welcome to Module Five — semantic segmentation. Here we go from labeling a whole image to
predicting a class for every single pixel. We'll cover encoder–decoder architectures, losses for
imbalance, and post-processing.

[thoughtfully] The bridge from classification is the fully convolutional network. Take any CNN
classifier, swap its dense layers for one-by-one convolutions, and upsample the feature maps back to
the input resolution. [with quiet emphasis] FCN-32s, 16s, and 8s just fuse skip connections more and
more finely, and the output is a tensor of height, width, and number of classes.

The workhorse is the U-Net — a symmetric encoder and decoder joined by skip connections. Those skips
carry fine spatial detail across the bottleneck, which is why U-Net trains well even on very small
medical datasets. Attention U-Net, TransUNet, and the self-configuring nnU-Net are its modern
descendants.

[curious] For richer context there's DeepLab. Atrous, or dilated, convolutions expand the receptive
field without throwing away resolution to pooling. Stack several of them in parallel at different
rates and you get ASPP, the heart of DeepLabv3+, which sits at the state of the art on Cityscapes and
Pascal VOC.

[with quiet emphasis] Your loss choice is where imbalance is won or lost. Plain cross-entropy is
sensitive to it. Dice loss optimizes overlap directly. Focal loss down-weights the easy pixels, and
Tversky lets you trade false positives against false negatives. In practice, combining cross-entropy
with Dice often wins.

And a little post-processing goes a long way: a dense CRF sharpens boundaries, morphological
operations clear small noise, test-time augmentation averages flips and rotations, and ensembling
backbones buys you another point or two of mean IoU.

[warmly, encouraging] Let's build a U-Net from scratch — open the labs.
```

---

Tuning: if long, trim the post-processing paragraph. "atrous" is the most likely mispronunciation —
the note forces "AY-truss".
