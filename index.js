const promClient = require('prom-client');
const Registry = promClient.Registry;

const logger = reqlib('/lib/logger.js').module('Prometheus')

const DEFAULT_PROMETHEUS_METRICS_PATH = '/metrics';

function PromClient (zwave) {
  this.zwave = zwave
}

PromClient.prototype.start = async function () {

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