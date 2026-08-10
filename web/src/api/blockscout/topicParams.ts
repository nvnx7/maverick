/**
 * Blockscout's getLogs mirrors Etherscan's API: each non-null topic is sent as
 * `topicN`, and every *pair* of present topics needs an explicit `topicN_M_opr`
 * combinator (usually "and") or the pair is silently ignored.
 */
export function buildTopicParams(
  topics: readonly (string | string[] | null | undefined)[],
): Record<string, string> {
  const present = topics
    .map((topic, index) => ({ topic, index }))
    .filter(
      (entry): entry is { topic: string; index: number } =>
        typeof entry.topic === "string",
    );

  const params: Record<string, string> = {};
  for (const { topic, index } of present) {
    params[`topic${index}`] = topic;
  }
  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      const a = present[i];
      const b = present[j];
      if (!a || !b) continue;
      params[`topic${a.index}_${b.index}_opr`] = "and";
    }
  }
  return params;
}
