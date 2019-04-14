const { CanvasRenderService } = require('chartjs-node-canvas');

const width = 600;
const height = 600;

const chartGeneration = async (config, cb) => {
  const canvasRenderService = new CanvasRenderService(width, height);
  const image = await canvasRenderService.renderToBuffer(config);

  cb(image);
};

module.exports = chartGeneration;
