const test = require('node:test');
const assert = require('node:assert/strict');
const { groupEvaluationDetails } = require('../dist/core.cjs');

function detail(overrides = {}) {
  return {
    id: 'evaluation-1', classification: 'violation', classificationLabel: 'Нарушение',
    severity: 'error', ruleId: 'rule.one', ruleTitle: 'Fill locked', capability: 'appearance.fill',
    nodeId: 'label', nodeName: 'Label', nodePath: 'Button / Text / Label', factPath: 'appearance.fill',
    reason: 'actual value differs from effective baseline', reasonLabel: 'Отличается от эталона',
    actual: [{ type: 'SOLID', tokenId: 'blue', opacity: 1 }],
    expected: [{ type: 'SOLID', tokenId: 'white', opacity: 0.94 }],
    actualLabel: 'Сейчас', expectedLabel: 'Должно быть', comparisonSymbol: '→',
    showComparison: true, scopeMismatch: false, ...overrides,
  };
}

test('identical baseline diffs share one card and retain every evaluation and RuleID without mutation', () => {
  const input = [detail(), detail({ id: 'evaluation-2', ruleId: 'rule.two', ruleTitle: 'Visual style locked', capability: 'visual-style@1' })];
  const before = JSON.stringify(input);
  input.forEach(Object.freeze);
  Object.freeze(input);
  const grouped = groupEvaluationDetails(input);
  assert.equal(grouped.length, 1);
  assert.deepEqual(grouped[0].evaluations.map(e => e.ruleId), ['rule.one', 'rule.two']);
  assert.equal(grouped[0].evaluations[1], input[1]);
  assert.equal(JSON.stringify(input), before);
});

test('group severity is the highest member severity, but every original severity stays available', () => {
  const grouped = groupEvaluationDetails([detail({ severity: 'info' }), detail({ severity: 'error' }), detail({ severity: 'warning' })]);
  assert.equal(grouped[0].severity, 'error');
  assert.deepEqual(grouped[0].evaluations.map(e => e.severity), ['info', 'error', 'warning']);
});

test('different nodes, properties, values, expectations, reasons and diagnostic context never collapse', () => {
  for (const change of [
    { nodeId: 'other' }, { nodePath: 'Button / Hint' }, { factPath: 'appearance.stroke' },
    { actual: [{ type: 'SOLID', tokenId: 'red', opacity: 1 }] }, { expected: [] },
    { reason: 'value is outside the allowed set' }, { actualLabel: 'Контекст' },
    { expectedLabel: 'Разрешено' }, { comparisonSymbol: '≠' }, { severity: 'unknown' },
  ]) assert.equal(groupEvaluationDetails([detail(), detail(change)]).length, 2, JSON.stringify(change));
});

test('unknown/missing values and every non-violation status remain separate', () => {
  for (const change of [
    { actual: undefined }, { expected: undefined }, { showComparison: false },
    { scopeMismatch: true }, { nodeId: '' }, { factPath: '' },
    ...['compliant', 'not-executed', 'not-applicable', 'not-evaluable', 'human-review'].map(classification => ({ classification })),
  ]) assert.equal(groupEvaluationDetails([detail(change), detail(change)]).length, 2, JSON.stringify(change));
});

test('object key order is immaterial; array order and token identity remain significant', () => {
  assert.equal(groupEvaluationDetails([detail(), detail({ actual: [{ opacity: 1, tokenId: 'blue', type: 'SOLID' }] })]).length, 1);
  assert.equal(groupEvaluationDetails([detail({ actual: [1, 2] }), detail({ actual: [2, 1] })]).length, 2);
  assert.equal(groupEvaluationDetails([detail(), detail({ actual: [{ type: 'SOLID', tokenId: 'other-blue', opacity: 1 }] })]).length, 2);
});

test('groups preserve first occurrence order and cannot lose evaluation coverage', () => {
  const input = [detail(), detail({ id: 'other-node', nodeId: 'other' }), detail({ id: 'second-rule', ruleId: 'rule.two' }), detail({ id: 'gap', classification: 'not-executed' })];
  const groups = groupEvaluationDetails(input);
  assert.deepEqual(groups.map(g => g.id), ['evaluation-1', 'other-node', 'gap']);
  assert.deepEqual(groups.map(g => g.evaluations.length), [2, 1, 1]);
  assert.equal(groups.reduce((n, g) => n + g.evaluations.length, 0), input.length);
});
