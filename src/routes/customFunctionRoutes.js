
const express = require("express");
const router = express.Router();
const { readToken } = require('../config/encrypts')
const { hotscustomfunctionController } = require('../controller')
const { decodeTokenHT } = require('../config/encrypts')

// Get all custom functions
router.get('/list', decodeTokenHT, hotscustomfunctionController.getCustomFunctions);

// Get custom functions for a specific service
router.get('/service/:serviceId', decodeTokenHT, hotscustomfunctionController.getServiceCustomFunctions);

// Create a new custom function
router.post('/create', decodeTokenHT, hotscustomfunctionController.createCustomFunction);

// Update a custom function
router.put('/update/:id', decodeTokenHT, hotscustomfunctionController.updateCustomFunction);

// Delete a custom function (soft delete)
router.delete('/delete/:id', decodeTokenHT, hotscustomfunctionController.deleteCustomFunction);

// Assign custom function to service
router.post('/assign_service', decodeTokenHT, hotscustomfunctionController.assignFunctionToService);

// Execute a custom function
router.post('/execute/:functionId', decodeTokenHT, hotscustomfunctionController.executeCustomFunction);

// Upload and process Excel file
router.post('/upload_excel', decodeTokenHT, hotscustomfunctionController.uploadExcelFile);

// Get function execution logs for a ticket
router.get('/logs/:ticketId', decodeTokenHT, hotscustomfunctionController.getFunctionLogs);

// Get generated documents for a ticket
router.get('/documents/:ticketId', decodeTokenHT, hotscustomfunctionController.getGeneratedDocuments);

// Download a generated document
router.get('/download/:documentId', decodeTokenHT, hotscustomfunctionController.downloadDocument);

// Get all function templates
router.get('/templates', decodeTokenHT, hotscustomfunctionController.getFunctionTemplates);

// Create function template
router.post('/templates/create', decodeTokenHT, hotscustomfunctionController.createFunctionTemplate);

// Update function template
router.put('/templates/update/:id', decodeTokenHT, hotscustomfunctionController.updateFunctionTemplate);

// Delete function template
router.delete('/templates/delete/:id', decodeTokenHT, hotscustomfunctionController.deleteFunctionTemplate);

// Get function execution statistics
router.get('/stats', decodeTokenHT, hotscustomfunctionController.getFunctionStats);

// Test function configuration
router.post('/test/:functionId', decodeTokenHT, hotscustomfunctionController.testFunction);

module.exports = router;
