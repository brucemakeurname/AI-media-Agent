import { test } from "node:test";
import assert from "node:assert/strict";
import { ScriptSchema } from "./script-schema.js";

function validScript(overrides: Record<string, unknown> = {}) {
  return {
    version: "1.0",
    metadata: {
      title: "Test article",
      source: { url: "https://example.com/a", domain: "example.com", image: null },
      channel: "tiktok",
      brand: {
        displayName: "Solo Flows",
        handle: "@soloflows",
        followers: "10K",
        initials: "SF",
        voiceReferenceAudio: "/abs/path/voice.wav",
      },
      mood: "news",
      targetDurationSec: 45,
    },
    voice: { provider: "voxcpm", voiceId: "solo-flows-default", speed: 1.0 },
    scenes: [
      {
        id: "hook",
        type: "hook",
        beats: [
          {
            voiceText: "Bạn nghĩ điều này là sự thật?",
            visualBrief: "headline fact: policy reversal",
            blueprintId: "broadcast-ticker-open",
            estimatedTimingSec: 3,
          },
          {
            voiceText: "Không hề — đây là một cú lừa.",
            visualBrief: "contradiction beat: reveals the twist",
            blueprintId: "glitch-effect-title",
            estimatedTimingSec: 3,
          },
        ],
        transitionId: "css-blur",
      },
      {
        id: "body-1",
        type: "body",
        beats: [
          {
            voiceText: "Đây là chi tiết chính của bài báo.",
            visualBrief: "key stat: 47% increase YoY",
            blueprintId: "hero-stat-reveal",
            estimatedTimingSec: 3,
          },
        ],
      },
      {
        id: "end",
        type: "end",
        beats: [
          {
            voiceText: "Đó là nhận định của chúng tôi.",
            visualBrief: "verdict beat",
            blueprintId: "clean-social-card",
            estimatedTimingSec: 3,
          },
          {
            voiceText: "Vậy bạn còn nghĩ điều đó là sự thật không?",
            visualBrief: "loop-back beat, echoes the hook",
            blueprintId: "titlecard-reveal",
            estimatedTimingSec: 3,
          },
        ],
      },
    ],
    ...overrides,
  };
}

test("accepts a valid script with hook/body/end beats", () => {
  assert.doesNotThrow(() => ScriptSchema.parse(validScript()));
});

test("rejects when scenes[0] is not type=hook", () => {
  const bad = validScript();
  bad.scenes[0].type = "body";
  bad.scenes[0].beats = [bad.scenes[0].beats[0]];
  assert.throws(() => ScriptSchema.parse(bad));
});

test("rejects when the last scene is not type=end", () => {
  const bad = validScript();
  bad.scenes[bad.scenes.length - 1].type = "body";
  assert.throws(() => ScriptSchema.parse(bad));
});

test("rejects a hook scene with only 1 beat", () => {
  const bad = validScript();
  bad.scenes[0].beats = [bad.scenes[0].beats[0]];
  assert.throws(() => ScriptSchema.parse(bad));
});

test("accepts an end scene with a single CTA beat", () => {
  const script = validScript();
  script.scenes[script.scenes.length - 1].beats = [
    {
      voiceText: "Theo dõi ngay để không bỏ lỡ.",
      visualBrief: "CTA beat",
      blueprintId: "cta-button-scene",
      estimatedTimingSec: 3,
    },
  ];
  assert.doesNotThrow(() => ScriptSchema.parse(script));
});

test("rejects a body scene with 2 beats", () => {
  const bad = validScript();
  bad.scenes[1].beats.push({
    voiceText: "extra beat",
    visualBrief: "should not be allowed",
    blueprintId: "clean-social-card",
    estimatedTimingSec: 3,
  });
  assert.throws(() => ScriptSchema.parse(bad));
});

test("rejects transitionId on a scene with only 1 beat", () => {
  const bad = validScript();
  bad.scenes[1].transitionId = "css-blur";
  assert.throws(() => ScriptSchema.parse(bad));
});

test("rejects metadata.targetDurationSec below 45", () => {
  const bad = validScript();
  bad.metadata.targetDurationSec = 30;
  assert.throws(() => ScriptSchema.parse(bad));
});

test("rejects a beat missing blueprintId", () => {
  const bad = validScript();
  delete (bad.scenes[1].beats[0] as Record<string, unknown>).blueprintId;
  assert.throws(() => ScriptSchema.parse(bad));
});
