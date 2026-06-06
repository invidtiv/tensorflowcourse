# Module 09 — Gemini TTS Prompt

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
* "1D CNN" → "one-D C-N-N". "LSTM" → "L-S-T-M". "Bi-LSTM" → "by-L-S-T-M".
* "SARIMA" → "sa-REE-muh". "seq2seq" → "seq-to-seq". "DeepAR" → "deep-A-R".
* "TFT" → "T-F-T". "VAE" → "V-A-E". "SARIMA" baseline → spoken plainly.

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Nine on time-series forecasting — respecting
the arrow of time in preprocessing and splitting, framing a series as supervised learning,
choosing a model, forecasting multiple steps, and flagging anomalies.

#### TRANSCRIPT
[warmly] Welcome to Module Nine — time-series forecasting. Sequential data has rules of its own, and
breaking them quietly ruins models. We'll cover preprocessing, windowing, model choices, multi-step
forecasting, and anomaly detection.

[thoughtfully] Always plot the series first — look for trend, seasonality, and sudden level shifts.
Differencing removes a trend; seasonal decomposition splits the signal into trend, seasonal, and
residual parts; rolling mean and standard deviation let you eyeball stationarity. [with quiet emphasis]
And never scale using statistics from the full series — that leaks the future into your training set.

To learn from it, you reframe the series as supervised samples. Slide a window of length L across the
data: the past L steps are your inputs, the next step or next few are the target. Choose expanding or
rolling windows, split by time rather than shuffling, and size the window to a meaningful look-back.

[curious] Now pick a model. A one-D CNN is fast and catches local patterns. An LSTM remembers longer
context but costs you speed, and a bidirectional LSTM sees the whole window. Attention and Transformers
scale to long sequences, and a sequence-to-sequence encoder–decoder handles multi-step output — but a
simple naive or SARIMA baseline still has to be beaten.

[with quiet emphasis] Forecasting several steps ahead has three flavors. Direct trains one model per
horizon. Recursive feeds predictions back as inputs, so errors compound. Seq2seq emits the whole
horizon in one pass, and probabilistic models like DeepAR and the Temporal Fusion Transformer also give
you calibrated uncertainty.

Finally, anomaly detection. Train a model — often an LSTM autoencoder — to reconstruct normal windows.
When reconstruction error spikes, you've found an anomaly; threshold it by a validation-set quantile,
and let VAE variants give you calibrated scores.

[warmly, encouraging] Let's build some forecasters — open the labs.
```

---

Tuning: "SARIMA" is the likely mispronunciation — the note pins it. Trim the multi-step paragraph if it
runs past ~135s.
