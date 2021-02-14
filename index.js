const promClient = require('prom-client');
const Registry = promClient.Registry;

const logger = require('../../lib/logger.js').module('Prometheus')

const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

function PromClient (zwave) {
  if (!(this instanceof PromClient)) {
    logger.info('This is the PromClient init')
    logger.info(`Zwave length is ${zwave.length()}`)
    this.zwave = zwave
    d = new PromClient()
    d.start()
  }
  logger.info('Next step of PromClient')

}

PromClient.prototype.start = async function () {
    logger.info('Event caller')
    if (this.zwave) {
        this.zwave.on('valueChanged', onValueChanged.bind(this))
        this.zwave.on('nodeRemoved',  onNodeRemoved.bind(this))
    }
}


function onNodeRemoved (node) {
    return
}

function onValueChanged (valueId, node, changed) {
  logger.info(`Value is ${changed}`)
}

module.exports = PromClient
