# Module 08 — Gemini TTS Prompt

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
* "BPE" → "B-P-E". "WordPiece", "SentencePiece" → say plainly.
* "Word2Vec" → "word-to-vec". "GloVe" → "glove". "CBOW" → "C-bow". "Skip-gram" → "skip-gram".
* "RNN" → "R-N-N". "LSTM" → "L-S-T-M". "GRU" → "G-R-U".
* "Query · Key · Value" → "query, key, value". "√d_k" → "square root of d-k".
* "NER" → "N-E-R". "BERT" → "bert". "GPT" → "G-P-T". "T5" → "T-five".

### SAMPLE CONTEXT
Cory is recording the opening narration for Module Eight on natural language processing — turning
text into tensors, the embeddings that hold meaning, recurrent networks, and the attention
mechanism that powers Transformers.

#### TRANSCRIPT
[warmly] Welcome to Module Eight — natural language processing. The journey here is from raw text to
tensors a network can learn from. We'll cover tokenization, embeddings, recurrent networks, and
attention.

[thoughtfully] First you have to turn text into numbers. Word-level tokens are simple but explode your
vocabulary. Character-level keeps the vocabulary tiny but the sequences long. [with quiet emphasis]
Subword schemes — BPE, WordPiece, SentencePiece — are the sweet spot, and modern language models live
on roughly thirty to two-hundred thousand of them.

But an integer ID carries no meaning, so we embed it. One-hot vectors are sparse and blind. Word2Vec
learns from local co-occurrence with Skip-gram and CBOW; GloVe factorizes a global count matrix. The
famous result — king minus man plus woman lands near queen — shows the geometry actually captures
meaning, and pretrained embeddings give your downstream tasks a head start.

[curious] To handle order, recurrent networks read a sequence one step at a time. A SimpleRNN forgets,
its gradient vanishing over long spans. The LSTM adds a gated cell that protects long-term state; the
GRU does nearly as well with fewer parameters. Wrap either to read bidirectionally, and remember to
mask your padding.

[with quiet emphasis] Then comes the idea that changed everything: attention. Compare a query against
keys to get similarity scores, softmax them into weights, and take a weighted sum of the values — a
context vector that decides where to look. Scale by the square root of d-k for stability, and run
several heads in parallel to capture different relationships at once.

Put it to work on real tasks — sentiment as sequence-to-class, named entity recognition at the token
level, autoregressive text generation, and encoder–decoder translation. And in practice today, you'd
start from BERT, GPT, or T5 weights.

[warmly, encouraging] Let's build an attention model from scratch — open the labs.
```

---

Tuning: the embeddings paragraph can shrink if long. Keep "Word2Vec" as "word-to-vec" so it isn't read
as a digit.
