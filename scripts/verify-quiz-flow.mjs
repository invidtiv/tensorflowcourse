#!/usr/bin/env node
/**
 * scripts/verify-quiz-flow.mjs
 *
 * End-to-end verification for the Quiz UI without spinning up Next.js or a
 * headless browser. It:
 *
 *   1. Loads every content/modules/* /quiz.json file.
 *   2. Strictly validates each question's schema (id, type, difficulty,
 *      topic, question, options[>=2], explanation, exactly one correct).
 *   3. Reimplements the Quiz state machine in plain JS (matching
 *      src/stores/quizStore.ts action-for-action) and runs THREE simulated
 *      attempts per module:
 *         a. all-correct        -> must pass
 *         b. all-wrong          -> must fail
 *         c. mixed (alternating) -> must score exactly ceil(n/2)
 *   4. Asserts every invariant you'd check by hand in the real UI:
 *         - answers map size equals question count at the end
 *         - showResult flips true only after the final nextQuestion()
 *         - submit without a selection is a no-op
 *         - scoring uses quiz.json's passingScore (not hardcoded 70)
 *         - each `correct` count matches the expected run
 *
 * Exit codes:
 *   0 -> everything passed
 *   1 -> one or more assertions failed (details printed to stderr)
 *
 * Usage:
 *   node scripts/verify-quiz-flow.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "modules");

// ---------------------------------------------------------------------------
// Minimal assertion helpers
// ---------------------------------------------------------------------------
let failures = 0;
const checks = [];

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  if (!ok) {
    failures++;
    process.stderr.write(`  ✗ ${name}${detail ? ` — ${detail}` : ""}\n`);
  }
}

function assertEq(name, actual, expected) {
  const ok =
    actual === expected ||
    JSON.stringify(actual) === JSON.stringify(expected);
  record(name, ok, ok ? "" : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  return ok;
}

function assertTrue(name, cond, detail = "") {
  record(name, !!cond, detail);
  return !!cond;
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------
const VALID_TYPES = new Set(["multiple-choice", "code-comprehension", "true-false"]);
const VALID_DIFFS = new Set(["easy", "medium", "hard"]);

function validateQuiz(moduleId, quiz) {
  const prefix = `[${moduleId}]`;
  assertTrue(`${prefix} quiz.json has numeric passingScore`, typeof quiz.passingScore === "number");
  assertTrue(`${prefix} quiz.json has questions array`, Array.isArray(quiz.questions) && quiz.questions.length > 0);

  const ids = new Set();
  quiz.questions.forEach((q, i) => {
    const p = `${prefix} q${i + 1}`;
    assertTrue(`${p} has string id`, typeof q.id === "string" && q.id.length > 0);
    if (ids.has(q.id)) {
      record(`${p} unique id`, false, `duplicate id ${q.id}`);
    } else {
      ids.add(q.id);
    }
    assertTrue(`${p} has valid type`, VALID_TYPES.has(q.type));
    assertTrue(`${p} has valid difficulty`, VALID_DIFFS.has(q.difficulty));
    assertTrue(`${p} has string topic`, typeof q.topic === "string" && q.topic.length > 0);
    assertTrue(`${p} has question text`, typeof q.question === "string" && q.question.length > 0);
    assertTrue(`${p} has explanation`, typeof q.explanation === "string" && q.explanation.length > 0);
    assertTrue(`${p} has >=2 options`, Array.isArray(q.options) && q.options.length >= 2);
    if (Array.isArray(q.options)) {
      const correctCount = q.options.filter((o) => o.correct === true).length;
      assertEq(`${p} has exactly one correct option`, correctCount, 1);
      q.options.forEach((o, oi) => {
        assertTrue(`${p}.o${oi} has text`, typeof o.text === "string" && o.text.length > 0);
        assertTrue(`${p}.o${oi} has boolean correct`, typeof o.correct === "boolean");
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Port of the zustand Quiz state machine (src/stores/quizStore.ts)
// ---------------------------------------------------------------------------
function createQuizMachine() {
  const state = {
    currentModuleId: null,
    questions: [],
    passingScore: 80,
    currentIndex: 0,
    answers: {},
    showResult: false,
    showExplanation: false,
    selectedOption: null,
    isCorrect: null,
  };

  return {
    state,
    startQuiz(moduleId, questions, passingScore = 80) {
      state.currentModuleId = moduleId;
      state.questions = questions;
      state.passingScore = passingScore;
      state.currentIndex = 0;
      state.answers = {};
      state.showResult = false;
      state.showExplanation = false;
      state.selectedOption = null;
      state.isCorrect = null;
    },
    selectOption(i) {
      state.selectedOption = i;
    },
    submitAnswer() {
      if (state.selectedOption === null) return; // no-op, matches store
      const q = state.questions[state.currentIndex];
      const ok = q.options[state.selectedOption]?.correct === true;
      state.answers = { ...state.answers, [q.id]: state.selectedOption };
      state.showExplanation = true;
      state.isCorrect = ok;
    },
    nextQuestion() {
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        state.showExplanation = false;
        state.selectedOption = null;
        state.isCorrect = null;
      } else {
        state.showResult = true;
      }
    },
    finishQuiz() {
      let correct = 0;
      for (const q of state.questions) {
        const a = state.answers[q.id];
        if (a !== undefined && q.options[a]?.correct) correct++;
      }
      const total = state.questions.length;
      const percent = total > 0 ? (correct / total) * 100 : 0;
      return {
        moduleId: state.currentModuleId || "",
        answers: state.answers,
        score: correct,
        total,
        passed: percent >= state.passingScore,
        completedAt: new Date().toISOString(),
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Attempt simulators. Each picks an option index per question and walks the
// full state machine the same way the React UI does (select -> submit ->
// next, repeated until showResult flips true).
// ---------------------------------------------------------------------------
function pickAllCorrect(q) {
  return q.options.findIndex((o) => o.correct === true);
}
function pickAllWrong(q) {
  return q.options.findIndex((o) => o.correct === false);
}
function pickAlternating(q, i) {
  // Every other question correct, starting from the first.
  return i % 2 === 0 ? pickAllCorrect(q) : pickAllWrong(q);
}

function runAttempt(moduleId, quiz, picker, label) {
  const m = createQuizMachine();
  m.startQuiz(moduleId, quiz.questions, quiz.passingScore);

  // Guard: submit without selection should be a no-op.
  const before = JSON.stringify(m.state);
  m.submitAnswer();
  assertEq(`[${moduleId}/${label}] submit with no selection is a no-op`, JSON.stringify(m.state), before);

  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    const choice = picker(q, i);
    assertTrue(
      `[${moduleId}/${label}] q${i + 1} picker found a valid option`,
      choice >= 0 && choice < q.options.length
    );

    // Before submit: showExplanation must be false.
    assertEq(`[${moduleId}/${label}] q${i + 1} pre-submit showExplanation`, m.state.showExplanation, false);
    m.selectOption(choice);
    assertEq(`[${moduleId}/${label}] q${i + 1} selectedOption`, m.state.selectedOption, choice);
    m.submitAnswer();
    assertEq(`[${moduleId}/${label}] q${i + 1} post-submit showExplanation`, m.state.showExplanation, true);
    assertEq(
      `[${moduleId}/${label}] q${i + 1} isCorrect matches option.correct`,
      m.state.isCorrect,
      q.options[choice].correct
    );
    assertEq(
      `[${moduleId}/${label}] q${i + 1} recorded in answers map`,
      m.state.answers[q.id],
      choice
    );
    m.nextQuestion();
  }

  // After final next, showResult must be true.
  assertEq(`[${moduleId}/${label}] showResult after last question`, m.state.showResult, true);
  assertEq(
    `[${moduleId}/${label}] answers map size`,
    Object.keys(m.state.answers).length,
    quiz.questions.length
  );

  return m.finishQuiz();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`content dir not found: ${CONTENT_DIR}`);
    process.exit(2);
  }

  const moduleIds = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  console.log(`Verifying quiz flow across ${moduleIds.length} modules…\n`);

  const summary = [];
  for (const moduleId of moduleIds) {
    const quizPath = path.join(CONTENT_DIR, moduleId, "quiz.json");
    if (!fs.existsSync(quizPath)) {
      record(`[${moduleId}] quiz.json exists`, false);
      continue;
    }
    let quiz;
    try {
      quiz = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
    } catch (e) {
      record(`[${moduleId}] quiz.json parses`, false, e.message);
      continue;
    }

    validateQuiz(moduleId, quiz);

    const n = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    if (n === 0) continue;
    const expectedMixedCorrect = Math.ceil(n / 2);

    const allCorrect = runAttempt(moduleId, quiz, pickAllCorrect, "all-correct");
    assertEq(`[${moduleId}/all-correct] score equals question count`, allCorrect.score, n);
    assertEq(`[${moduleId}/all-correct] passed`, allCorrect.passed, true);

    const allWrong = runAttempt(moduleId, quiz, pickAllWrong, "all-wrong");
    assertEq(`[${moduleId}/all-wrong] score is zero`, allWrong.score, 0);
    assertEq(`[${moduleId}/all-wrong] not passed`, allWrong.passed, false);

    const mixed = runAttempt(moduleId, quiz, pickAlternating, "mixed");
    assertEq(`[${moduleId}/mixed] score equals ceil(n/2)`, mixed.score, expectedMixedCorrect);
    const mixedPercent = (expectedMixedCorrect / n) * 100;
    assertEq(
      `[${moduleId}/mixed] passed matches percent>=passingScore`,
      mixed.passed,
      mixedPercent >= quiz.passingScore
    );

    summary.push({
      moduleId,
      questions: n,
      passingScore: quiz.passingScore,
      allCorrect: allCorrect.score,
      allWrong: allWrong.score,
      mixed: mixed.score,
      mixedPct: `${Math.round(mixedPercent)}%`,
      mixedPassed: mixed.passed,
    });
  }

  // Pretty-print summary
  console.log("Module                            Qs  Pass%  AllCor  AllWr  Mixed  MixedPct  MixedPassed");
  console.log("--------------------------------  --  -----  ------  -----  -----  --------  -----------");
  for (const r of summary) {
    console.log(
      `${r.moduleId.padEnd(32)}  ${String(r.questions).padStart(2)}  ${String(r.passingScore).padStart(5)}  ${String(r.allCorrect).padStart(6)}  ${String(r.allWrong).padStart(5)}  ${String(r.mixed).padStart(5)}  ${r.mixedPct.padStart(8)}  ${String(r.mixedPassed).padStart(11)}`
    );
  }

  const total = checks.length;
  const passed = total - failures;
  console.log(`\n${passed}/${total} checks passed.`);
  if (failures > 0) {
    console.error(`\n${failures} FAILED. See stderr above.`);
    process.exit(1);
  } else {
    console.log("All quiz-flow invariants verified ✓");
  }
}

main();
