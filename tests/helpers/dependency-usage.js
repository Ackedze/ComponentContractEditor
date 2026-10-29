const core=require('../../dist/core.cjs');
const {scenario:sharedScenario,clone}=require('../../../Apollo/packages/component-contract-core/tests/helpers/dependency-usage.cjs');
const scenario=()=>sharedScenario(core);
module.exports={scenario,clone,core};
