const express = require('express');
const router = express.Router();
const customFunctionController = require('../controllers/customFunctionController');

// Define routes for custom function management
router.get('/list', customFunctionController.getAllCustomFunctions);
router.get('/:id', customFunctionController.getCustomFunction);
router.post('/create', customFunctionController.createCustomFunction);
router.put('/update/:id', customFunctionController.updateCustomFunction);
router.delete('/delete/:id', customFunctionController.deleteCustomFunction);

// Service Assignment Routes
router.get('/service/:service_id', customFunctionController.getServiceCustomFunctions);
router.post('/assign_service', customFunctionController.assignFunctionToService);
router.put('/update_service_assignment/:id', customFunctionController.updateServiceFunctionAssignment);
router.delete('/remove_service_assignment/:id', customFunctionController.deleteServiceFunctionAssignment);

// Template Routes
router.get('/templates', customFunctionController.getAllFunctionTemplates);
router.get('/templates/:id', customFunctionController.getFunctionTemplate);
router.post('/templates/create', customFunctionController.createFunctionTemplate);
router.put('/templates/update/:id', customFunctionController.updateFunctionTemplate);
router.delete('/templates/delete/:id', customFunctionController.deleteFunctionTemplate);

// Execute Route
router.post('/execute/:function_id', customFunctionController.executeCustomFunction);

// Upload Excel Route
router.post('/upload_excel', customFunctionController.uploadExcelFile);

// Get function logs for a ticket
router.get('/logs/:ticket_id', customFunctionController.getFunctionLogs);

// Get generated documents for a ticket
router.get('/documents/:ticket_id', customFunctionController.getGeneratedDocuments);

// Download generated document by path
router.get('/download/document/:document_path', customFunctionController.downloadDocument);

// Download generated document by ID
router.get('/download/:document_id', customFunctionController.downloadById);

module.exports = router;
