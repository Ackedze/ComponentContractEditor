const test = require('node:test'), assert = require('node:assert/strict');
const core = require('../dist/core.cjs');
const api = { properties: { 'Enabled#12:3': false }, propertyTypes: { 'Enabled#12:3': 'BOOLEAN' } };
test('unique typed public alias resolves without normalizing observed keys or false values', () => {
  const before = JSON.stringify(api);
  assert.deepEqual(core.resolveComponentProperty('Enabled', api, ['BOOLEAN']), { name: 'Enabled#12:3', match: 'alias' });
  assert.deepEqual(core.resolveComponentProperty('Enabled#12:3', api, ['BOOLEAN']), { name: 'Enabled#12:3', match: 'exact' });
  assert.equal(JSON.stringify(api), before);
});
test('an explicit stale ID is never repaired by name', () => {
  assert.deepEqual(core.resolveComponentProperty('Enabled#old', api), { reason: 'property-missing' });
  assert.deepEqual(core.resolveComponentProperty('enabled', api), { reason: 'property-missing' });
});
test('alias collisions include inactive definitions and do not pick the compatible type', () => {
  for (const extra of [
    { properties: { 'Enabled#other': true } },
    { propertyTypes: { 'Enabled#other': 'TEXT' } },
    { definedProperties: ['Enabled#other'] },
    { propertyReferences: ['Enabled#other'] },
    { properties: { Enabled: false } },
  ]) {
    const data = { ...api, ...extra, properties: { ...api.properties, ...extra.properties }, propertyTypes: { ...api.propertyTypes, ...extra.propertyTypes } };
    assert.deepEqual(core.resolveComponentProperty('Enabled', data, ['BOOLEAN']), { reason: 'property-ambiguous' });
    assert.deepEqual(core.resolveComponentProperty('Enabled#12:3', data, ['BOOLEAN']), { name: 'Enabled#12:3', match: 'exact' });
  }
});
test('alias needs explicit type; known incompatible types fail even for an exact ID', () => {
  assert.deepEqual(core.resolveComponentProperty('Enabled', { properties: api.properties }), { reason: 'property-type-incompatible' });
  assert.deepEqual(core.resolveComponentProperty('Enabled', api, ['TEXT']), { reason: 'property-type-incompatible' });
  assert.deepEqual(core.resolveComponentProperty('Enabled#12:3', api, ['TEXT']), { reason: 'property-type-incompatible' });
  assert.deepEqual(core.resolveComponentProperty('Enabled#12:3', { properties: api.properties }), { name: 'Enabled#12:3', match: 'exact' });
});
