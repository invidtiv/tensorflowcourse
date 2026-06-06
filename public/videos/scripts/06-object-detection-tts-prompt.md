# Module 06 — Gemini TTS Prompt

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
* "IoU" → "I-O-U". "GIoU / DIoU / CIoU" → "G-I-O-U", "D-I-O-U", "C-I-O-U".
* "mAP" → "mean A-P". "NMS" → "N-M-S". "Soft-NMS" → "soft N-M-S".
* "FPN" → "F-P-N". "FCOS" → "F-cos". "CenterNet" → "center-net".
* "YOLO" → "YOH-loh". "YOLOv3/v5/v8" → "yolo-v-three / v-five / v-eight".
* "TFLite" → "T-F-lite". "ONNX" → "ON-nix". "COCO" → "COH-coh". "VOC" → "V-O-C".

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Six on object detection — finding and
classifying every object in an image at once, the metrics that grade it, and the architectures
from anchor-based YOLO to anchor-free detectors.

#### TRANSCRIPT
[warmly] Welcome to Module Six — object detection. Now we don't just classify an image, we find and
label every object inside it. We'll cover the metrics, anchor boxes, suppression, and the YOLO family.

[thoughtfully] Detection is classification plus localization, repeated for every object. The metric
that grades a box is intersection over union — the overlap between prediction and ground truth, from
zero to one. [with quiet emphasis] Its smarter cousins, G-I-O-U, D-I-O-U, and C-I-O-U, add penalties
for distance and aspect ratio, and as a loss they converge faster than plain L2 on boxes.

Most detectors start from anchor boxes — prior shapes tiled across the image at varied scales and
ratios. Each anchor predicts an offset, an objectness score, and a class. Running k-means on your
ground-truth boxes finds good priors, and stacking anchors across a feature pyramid handles multiple
scales. Newer anchor-free detectors like FCOS and CenterNet skip this step entirely.

[curious] Any detector produces a flood of overlapping boxes, so you clean them up with non-maximum
suppression. Sort by confidence, keep the top box, and drop anything that overlaps it too much.
Soft-NMS decays scores instead of deleting, and DIoU-NMS is a modern refinement — tune the threshold
per dataset.

The YOLO family made all of this real-time. It predicts on a grid in a single pass, with a head that
emits objectness, class, and box offsets together. Versions three through eight trade blows on speed
and accuracy, and you can export any of them to TFLite or ONNX for mobile and edge.

[with quiet emphasis] To grade the whole system, use mean average precision. Compute the area under
each class's precision–recall curve, then average across classes — at I-O-U zero-point-five for VOC,
or averaged across thresholds for COCO. Always report it next to per-class F1.

[warmly, encouraging] Let's train a YOLO detector — open the labs.
```

---

Tuning: the IoU-variants sentence is the densest; slow it down or split it if it rushes. Keep all
acronyms spelled per the pronunciation notes.
