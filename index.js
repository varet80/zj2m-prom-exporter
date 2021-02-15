const promClient = require('prom-client');

const logger = require('../../lib/logger.js').module('Prometheus')

// setup gauge
const gauge = new promClient.Gauge({
  name: 'zj2m',
  help: 'zwavejs2mqtt gauges from metrics',
  labelNames: ['nodeId', 'location', 'name', 'commandClass', 'property', 'propertyKey', 'label', 'type', 'endpoint', 'id'],
});
const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

function PromClient (zw) {
  this.zwave = zw
  if (!(this instanceof PromClient)) {
    logger.info('This is the PromClient init')
    d = new PromClient(zw)
    d.start()
  }
  logger.info('Next ste p of PromClient')

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
  let metricValue = 0; 
  switch (valueId.type) {
    case "boolean":
      if (valueId.value) {
        metricValue = 1
      }
      break
    case "number":
      metricValue = valueId.value
      break
    default:
      return
  }
  gauge.set({ 
    nodeId: valueId.nodeId,
    node: valueId.nodeName,
    location: valueId.nodeLocation,
    commandClass: valueId.commandClass,
    property: valueId.propertyName,
    propertyKey: valueId.propertyKey,
    label: valueId.label,
    type: valueId.type,
    endpoint: valueId.endpoint,
    id: valueId.id
  }, metricValue)
}

module.exports = PromClient