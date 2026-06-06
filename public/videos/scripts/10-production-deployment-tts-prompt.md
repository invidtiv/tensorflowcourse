# Module 10 — Gemini TTS Prompt

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
* "FP32" → "F-P thirty-two". "INT8" → "int-eight". "Float16" → "float sixteen".
* "QAT" → "Q-A-T". "TFLite" → "T-F-lite". "TFLiteConverter" → "T-F-lite converter".
* "NNAPI" → "N-N-A-P-I". "Hexagon" → "HEX-a-gon". "SavedModel" → "saved-model".
* "gRPC" → "G-R-P-C". "REST" → "rest". "TFX" → "T-F-X". "TFX" components → say plainly.
* "Kubeflow" → "KOOB-flow". "Vertex AI" → "vertex A-I". "PSI" → "P-S-I". "KS test" → "K-S test".

### SAMPLE CONTEXT
Cory is recording the closing module's narration — taking a trained model from a notebook to real
users: shrinking it with quantization, shipping it to mobile and servers, orchestrating it with
TFX, and watching for drift once it's live.

#### TRANSCRIPT
[warmly] Welcome to Module Ten — production deployment. This is the last mile: getting a trained model
out of the notebook and in front of real users. We'll cover quantization, TFLite, TensorFlow Serving,
TFX pipelines, and monitoring.

[thoughtfully] Start by making the model smaller and faster with quantization. Post-training dynamic
quantization shrinks the weights. Full integer quantization takes activations down to int-eight using a
small calibration set. Float-sixteen simply halves the size with no calibration. [with quiet emphasis]
And when accuracy matters most, quantization-aware training fine-tunes with fake quantization in the
loop — expect roughly two-to-four times faster inference and about four times smaller.

For phones and edge devices, that's TensorFlow Lite. Convert from a Keras model, run it through the
Interpreter on Android, iOS, or even microcontrollers, and lean on delegates — GPU, NNAPI, Hexagon — to
accelerate. Always verify accuracy on the target hardware, because some ops may be unsupported.

[curious] On the server side, TensorFlow Serving takes over. Export to the SavedModel format, lay it out
as model name then version number, and serve REST on port eighty-five-oh-one or gRPC on eighty-five-hundred —
gRPC being roughly twice as fast. A few warmup requests prevent cold-start latency spikes, and the
official Docker image makes deployment routine.

[with quiet emphasis] To make the whole thing reproducible, TFX strings it into a pipeline: ingest,
validate statistics and schema, train, evaluate, and push to serving — where schema drift blocks bad
data before it ever reaches production. Orchestrate it with Kubeflow, Airflow, or Vertex AI.

And the job isn't done at deploy. Watch for data drift as inputs shift and concept drift as the
input-to-output relationship changes. Run a KS test or PSI on your features regularly, roll out with
shadow and canary deploys, and log predictions against eventual ground truth so you can retrain.

[warmly, encouraging] Let's ship your model — open the labs. And congratulations: that's the course.
```

---

Tuning: this is the densest script and the natural finale — let the last line breathe. Trim the TFX
paragraph first if it overshoots ~135s.
