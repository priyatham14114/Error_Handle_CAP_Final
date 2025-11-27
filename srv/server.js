const cds = require('@sap/cds');
const express = require('express');

cds.on('bootstrap', app => {
  // Increase payload size limits
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  app.use((req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const body = req.body;

      // Handling Source_payload  
      if (body.Source_payload && typeof body.Source_payload != 'string') {
        try {
          body.Source_payload = JSON.stringify(body.Source_payload);
        } catch (e) {
          console.error('Failed to stringify Source_payload', e);
          return res.status(400).send({
            error: {
              message: 'Invalid Source_payload format',
              target: 'Source_payload',
              code: '400'
            }
          });
        }
      }

      if (body.ReqHeaders && typeof body.ReqHeaders != 'string') {
        try {
          body.ReqHeaders = JSON.stringify(body.ReqHeaders);
        } catch (e) {
          console.error('Failed to stringify ReqHeaders', e);
          return res.status(400).send({
            error: {
              message: 'Invalid ReqHeaders format',
              target: 'ReqHeaders',
              code: '400'
            }
          });
        }
      }

      //  Handle ErrorPayloadFile (ErrorFilesSet)
      if (body.ErrorPayloadFile && typeof body.ErrorPayloadFile === 'string') {
        try {
          // Remove line breaks, decode base64
          const cleaned = body.ErrorPayloadFile.replace(/\r?\n|\r/g, '');
          body.ErrorPayloadFile = Buffer.from(cleaned, 'base64');
        } catch (e) {
          return res.status(400).send({ error: { message: 'Invalid base64 Content ' + e.message, code: '400' } });
        }
      }
    }
    next();
  });

});

module.exports = cds.server;
