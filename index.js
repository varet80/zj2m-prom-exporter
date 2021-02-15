
const logger = require('../../lib/logger.js').module('Prometheus')

const promClient = require('prom-client');
const registry = promClient.Registry;
const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

// setup gauge
const gauge = new registry.Gauge({
  name: 'zj2m',
  help: 'zwavejs2mqtt gauges from metrics',
  labelNames: ['location', 'name', 'commandClass', 'property', 'propertyKey', 'label', 'type', 'endpoint', 'id'],
});
function PromClient (zwave) {
  this.zwave = zwave
  if (!(this instanceof PromClient)) {
    logger.info('This is the PromClient init')
    d = new PromClient(zwave)
    d.start()
  }
  logger.info('Next step of PromClient')
}

PromClient.prototype.start = async function () {
    logger.info('Event caller')
    if (this.zwave) {
        logger.info('this.zwave exists')
        this.zwave.on('valueChanged', onValueChanged.bind(this))
        this.zwave.on('nodeRemoved',  onNodeRemoved.bind(this))
    }
    // this is async but doesn't need to be awaited
    this.zwave.connect()
}


function onNodeRemoved (node) {
    return
}

function onValueChanged (valueId, node, changed) {
  logger.info(`Value is ${changed}`)
}

module.exports = PromClient
