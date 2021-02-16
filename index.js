const promCli = require('prom-client');
const logger = require('../../lib/logger.js').module('Prometheus')
const fastify = require('fastify')()

// Http Server settings
const httpPort = 9001
const httpAddr = '0.0.0.0'
const httpMetricPath = '/metrics'

/**
 * Registry and Gauge settings for Prometheus
 */
const PromCliRegistry = promCli.Registry
let customRegistry = new PromCliRegistry();
const gauge = new promCli.Gauge({
  registers: [customRegistry],
  name: 'zj2m',
  help: 'zwavejs2mqtt gauges from metrics',
  labelNames: ['nodeId', 'location', 'name', 'commandClass', 'property', 'propertyKey', 'label', 'type', 'endpoint', 'id'],
});


// Http Server to return metrics
function HttpServer (customRegistry) {
  // Declare a route
  fastify.get(httpMetricPath, async (request, reply) => {
    logger.info(`Metrics query from ${request.ip}`)
    return customRegistry.metrics()
  })
  
  // Run the server!
  const start = async () => {
    try {
      await fastify.listen(httpPort, httpAddr)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()
}

/**
 * Function to initiate the Client (plugin)
 **/
function PromClient (zwave) {
  this.zwave = zwave
  if (!(this instanceof PromClient)) {

    // start http server
    HttpServer(customRegistry)

    d = new PromClient(zwave)
    d.start()
 }

}

PromClient.prototype.start = async function () {
    logger.info('Event caller')
    if (this.zwave) {
        this.zwave.on('valueChanged', onValueChanged.bind(this))
        this.zwave.on('nodeRemoved',  onNodeRemoved.bind(this))
    }
    // this is async but doesn't need to be awaited
    //this.zwave.connect()
}

// Implements the Payload for gauge, and registers/upgrade gauge
function gaugePayload (payload) {
  // Ignore CCs not making sense to monitor
  switch (payload.commandClass) {
    case 112:
    case 114:
    case 134:
      return
  }

  let metricValue = 0;
  switch(typeof payload.value) {
  case "number":
    metricValue = payload.value
    break;
  case "boolean":
    if (payload.value) {
      metricValue = 1
    }
  default:
    return;
  }
  logger.info(`Adding value to metric ${payload.id}`)
  let gaugeLabels = {
    nodeId: payload.nodeId,
    name: payload.nodeName,
    location: payload.nodeLocation,
    commandClass: payload.commandClassName,
    property: payload.propertyName,
    propertyKey: payload.propertyKey,
    label: payload.label,
    type: payload.type,
    endpoint: payload.endpoint,
    id: payload.id
  }
  //set gauge
  gauge.set(gaugeLabels, metricValue)
  logger.debug(`Registered ${metricValue} under ${payload.id}`)
  return
}

// TODO: Placeholder for removal
function onNodeRemoved (node) {
    return
}


/**
 * Value changes calls for change
 **/
function onValueChanged (valueId, node, changed) {
  logger.debug(`Value ${valueId.value} is typeof ${typeof valueId.value}`)
  gaugePayload(valueId)
}

module.exports = PromClient
