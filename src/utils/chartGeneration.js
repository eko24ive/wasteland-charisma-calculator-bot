const ChartjsNode = require('chartjs-node');

const chartNode = new ChartjsNode(600, 500);

const chartGeneration = (config, cb) => {
  chartNode
    .drawChart(config)
    .then(() => chartNode.getImageBuffer('image/png'))
    .then((buffer) => {
      cb(buffer);
    })
    .then(() => {
      chartNode.destroy();
    });
};

module.exports = chartGeneration;
