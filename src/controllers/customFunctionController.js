
const db = require('../config/database'); // Adjust path as needed
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Custom Function Controller
 * Base Path: /hots_settings/custom_functions/
 */

class CustomFunctionController {
  /**
   * GET /hots_settings/custom_functions/list
   * Get all custom functions
   */
  static async getCustomFunctions(req, res) {
    try {
      const query = `
        SELECT cf.*, COUNT(scf.id) as usage_count
        FROM m_custom_functions cf
        LEFT JOIN t_service_custom_functions scf ON cf.id = scf.function_id
        WHERE cf.is_deleted = 0
        GROUP BY cf.id
        ORDER BY cf.created_date DESC
      `;
      
      const [functions] = await db.execute(query);
      
      res.json({
        success: true,
        message: 'Custom functions retrieved successfully',
        data: functions
      });
    } catch (error) {
      console.error('Get custom functions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve custom functions',
        error: error.message
      });
    }
  }

  /**
   * GET /hots_settings/custom_functions/service/:serviceId
   * Get custom functions for a specific service
   */
  static async getServiceCustomFunctions(req, res) {
    try {
      const { serviceId } = req.params;
      
      const query = `
        SELECT scf.*, cf.name, cf.type, cf.handler, cf.config as function_config
        FROM t_service_custom_functions scf
        JOIN m_custom_functions cf ON scf.function_id = cf.id
        WHERE scf.service_id = ? AND scf.is_active = 1 AND cf.is_active = 1
        ORDER BY scf.execution_order ASC
      `;
      
      const [serviceFunctions] = await db.execute(query, [serviceId]);
      
      res.json({
        success: true,
        message: 'Service custom functions retrieved successfully',
        data: serviceFunctions
      });
    } catch (error) {
      console.error('Get service custom functions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve service custom functions',
        error: error.message
      });
    }
  }

  /**
   * POST /hots_settings/custom_functions/create
   * Create a new custom function
   */
  static async createCustomFunction(req, res) {
    try {
      const { name, type, handler, config, is_active = 1 } = req.body;
      const userId = req.user.user_id; // Assuming user info is in req.user
      
      const query = `
        INSERT INTO m_custom_functions (name, type, handler, config, is_active, created_by, created_date)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const [result] = await db.execute(query, [
        name, 
        type, 
        handler, 
        JSON.stringify(config),
        is_active,
        userId
      ]);
      
      // Fetch the created function
      const [newFunction] = await db.execute(
        'SELECT * FROM m_custom_functions WHERE id = ?',
        [result.insertId]
      );
      
      res.json({
        success: true,
        message: 'Custom function created successfully',
        data: newFunction[0]
      });
    } catch (error) {
      console.error('Create custom function error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create custom function',
        error: error.message
      });
    }
  }

  /**
   * PUT /hots_settings/custom_functions/update/:id
   * Update a custom function
   */
  static async updateCustomFunction(req, res) {
    try {
      const { id } = req.params;
      const { name, type, handler, config, is_active } = req.body;
      
      const query = `
        UPDATE m_custom_functions 
        SET name = ?, type = ?, handler = ?, config = ?, is_active = ?, updated_date = NOW()
        WHERE id = ?
      `;
      
      await db.execute(query, [
        name, 
        type, 
        handler, 
        JSON.stringify(config),
        is_active,
        id
      ]);
      
      res.json({
        success: true,
        message: 'Custom function updated successfully'
      });
    } catch (error) {
      console.error('Update custom function error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update custom function',
        error: error.message
      });
    }
  }

  /**
   * DELETE /h, ots_settings/custom_functions/delete/:id
   * Delete a custom function (soft delete)
   */
  static async deleteCustomFunction(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        UPDATE m_custom_functions 
        SET is_deleted = 1, finished_date = NOW()
        WHERE id = ?
      `;
      
      await db.execute(query, [id]);
      
      res.json({
        success: true,
        message: 'Custom function deleted successfully'
      });
    } catch (error) {
      console.error('Delete custom function error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete custom function',
        error: error.message
      });
    }
  }

  /**
   * POST /hots_settings/custom_functions/assign_service
   * Assign custom function to a service
   */
  static async assignFunctionToService(req, res) {
    try {
      const { service_id, function_id, trigger_event, execution_order, config } = req.body;
      const userId = req.user.user_id;
      
      const query = `
        INSERT INTO t_service_custom_functions 
        (service_id, function_id, trigger_event, execution_order, config, is_active, created_by, created_date)
        VALUES (?, ?, ?, ?, ?, 1, ?, NOW())
      `;
      
      await db.execute(query, [
        service_id,
        function_id,
        trigger_event,
        execution_order,
        JSON.stringify(config),
        userId
      ]);
      
      res.json({
        success: true,
        message: 'Function assigned to service successfully'
      });
    } catch (error) {
      console.error('Assign function to service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign function to service',
        error: error.message
      });
    }
  }

  /**
   * POST /hots_settings/custom_functions/execute/:functionId
   * Execute a custom function
   */
  static async executeCustomFunction(req, res) {
    try {
      const { functionId } = req.params;
      const { ticket_id, params = {} } = req.body;
      const userId = req.user.user_id;
      
      // Get function details
      const [functionDetails] = await db.execute(
        'SELECT * FROM m_custom_functions WHERE id = ? AND is_active = 1',
        [functionId]
      );
      
      if (functionDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Custom function not found'
        });
      }
      
      const func = functionDetails[0];
      let result = {};
      let status = 'success';
      let errorMessage = null;
      
      try {
        // Execute function based on type
        switch (func.type) {
          case 'document_generation':
            result = await this.executeDocumentGeneration(func, ticket_id, params);
            break;
          case 'excel_processing':
            result = await this.executeExcelProcessing(func, ticket_id, params);
            break;
          case 'email_notification':
            result = await this.executeEmailNotification(func, ticket_id, params);
            break;
          case 'api_integration':
            result = await this.executeApiIntegration(func, ticket_id, params);
            break;
          default:
            result = await this.executeCustomHandler(func, ticket_id, params);
        }
      } catch (execError) {
        status = 'failed';
        errorMessage = execError.message;
        result = { error: execError.message };
      }
      
      // Log execution
      await db.execute(`
        INSERT INTO t_custom_function_logs 
        (ticket_id, service_id, function_name, trigger_event, status, result_data, error_message, execution_time, created_by)
        VALUES (?, ?, ?, 'manual', ?, ?, ?, NOW(), ?)
      `, [
        ticket_id,
        0, // Service ID would be determined from ticket
        func.name,
        status,
        JSON.stringify(result),
        errorMessage,
        userId
      ]);
      
      res.json({
        success: status === 'success',
        message: status === 'success' ? 'Function executed successfully' : 'Function execution failed',
        data: result
      });
    } catch (error) {
      console.error('Execute custom function error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute custom function',
        error: error.message
      });
    }
  }

  /**
   * POST /hots_settings/custom_functions/upload_excel
   * Upload and process Excel file
   */
  static async uploadExcelFile(req, res) {
    try {
      const { ticket_id } = req.body;
      const userId = req.user.user_id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const file = req.file;
      const filePath = file.path;
      
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const processedData = {};
      
      // Process each sheet
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        processedData[sheetName] = jsonData;
      });
      
      // Generate summary
      const summary = {
        totalSheets: sheetNames.length,
        sheetNames: sheetNames,
        totalRows: Object.values(processedData).reduce((sum, sheet) => sum + sheet.length, 0),
        fileName: file.originalname,
        fileSize: file.size,
        processedDate: new Date().toISOString()
      };
      
      // Save processed data to database
      await db.execute(`
        INSERT INTO t_excel_processed_data 
        (ticket_id, file_name, file_path, processed_data, summary, uploaded_by, upload_date)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        ticket_id,
        file.originalname,
        filePath,
        JSON.stringify(processedData),
        JSON.stringify(summary),
        userId
      ]);
      
      res.json({
        success: true,
        message: 'Excel file processed successfully',
        data: {
          summary,
          processedData
        }
      });
    } catch (error) {
      console.error('Upload Excel file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process Excel file',
        error: error.message
      });
    }
  }

  /**
   * GET /hots_settings/custom_functions/logs/:ticketId
   * Get function execution logs for a ticket
   */
  static async getFunctionLogs(req, res) {
    try {
      const { ticketId } = req.params;
      
      const query = `
        SELECT * FROM t_custom_function_logs 
        WHERE ticket_id = ? 
        ORDER BY execution_time DESC
      `;
      
      const [logs] = await db.execute(query, [ticketId]);
      
      res.json({
        success: true,
        message: 'Function logs retrieved successfully',
        data: logs
      });
    } catch (error) {
      console.error('Get function logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve function logs',
        error: error.message
      });
    }
  }

  /**
   * GET /hots_settings/custom_functions/documents/:ticketId
   * Get generated documents for a ticket
   */
  static async getGeneratedDocuments(req, res) {
    try {
      const { ticketId } = req.params;
      
      const query = `
        SELECT * FROM t_generated_documents 
        WHERE ticket_id = ? 
        ORDER BY generated_date DESC
      `;
      
      const [documents] = await db.execute(query, [ticketId]);
      
      res.json({
        success: true,
        message: 'Generated documents retrieved successfully',
        data: documents
      });
    } catch (error) {
      console.error('Get generated documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve generated documents',
        error: error.message
      });
    }
  }

  /**
   * GET /hots_settings/custom_functions/download/:documentId
   * Download a generated document
   */
  static async downloadDocument(req, res) {
    try {
      const { documentId } = req.params;
      
      const [documents] = await db.execute(
        'SELECT * FROM t_generated_documents WHERE id = ?',
        [documentId]
      );
      
      if (documents.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      const document = documents[0];
      const filePath = path.join(__dirname, '..', document.file_path);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }
      
      res.download(filePath, document.file_name);
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download document',
        error: error.message
      });
    }
  }

  /**
   * GET /hots_settings/custom_functions/templates
   * Get all function templates
   */
  static async getFunctionTemplates(req, res) {
    try {
      const query = `
        SELECT * FROM m_function_templates 
        WHERE is_active = 1 
        ORDER BY template_name ASC
      `;
      
      const [templates] = await db.execute(query);
      
      res.json({
        success: true,
        message: 'Function templates retrieved successfully',
        data: templates
      });
    } catch (error) {
      console.error('Get function templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve function templates',
        error: error.message
      });
    }
  }

  // Helper methods for function execution
  static async executeDocumentGeneration(func, ticketId, params) {
    // Implementation for document generation
    const config = JSON.parse(func.config);
    
    // Get ticket data
    const [ticketData] = await db.execute(
      'SELECT * FROM t_ticket WHERE ticket_id = ?',
      [ticketId]
    );
    
    if (ticketData.length === 0) {
      throw new Error('Ticket not found');
    }
    
    // Generate document based on template
    const documentPath = await this.generateDocument(config.template, ticketData[0], params);
    
    // Save document record
    await db.execute(`
      INSERT INTO t_generated_documents 
      (ticket_id, document_type, file_path, file_name, generated_date, template_used)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `, [
      ticketId,
      config.documentType || 'letter',
      documentPath,
      path.basename(documentPath),
      config.template
    ]);
    
    return {
      success: true,
      documentPath,
      documentType: config.documentType || 'letter'
    };
  }

  static async executeExcelProcessing(func, ticketId, params) {
    // Implementation for Excel processing
    const config = JSON.parse(func.config);
    
    // Get Excel data from database
    const [excelData] = await db.execute(
      'SELECT * FROM t_excel_processed_data WHERE ticket_id = ? ORDER BY upload_date DESC LIMIT 1',
      [ticketId]
    );
    
    if (excelData.length === 0) {
      throw new Error('No Excel data found for this ticket');
    }
    
    const processedData = JSON.parse(excelData[0].processed_data);
    
    // Process data based on configuration
    const result = this.processExcelData(processedData, config);
    
    return {
      success: true,
      processedData: result,
      summary: excelData[0].summary
    };
  }

  static async executeEmailNotification(func, ticketId, params) {
    // Implementation for email notification
    const config = JSON.parse(func.config);
    
    // Get ticket and user data
    const [ticketData] = await db.execute(`
      SELECT t.*, u.email, u.firstname, u.lastname 
      FROM t_ticket t 
      JOIN users u ON t.created_by = u.user_id 
      WHERE t.ticket_id = ?
    `, [ticketId]);
    
    if (ticketData.length === 0) {
      throw new Error('Ticket not found');
    }
    
    // Send email (implementation depends on email service)
    const emailResult = await this.sendEmail(config, ticketData[0], params);
    
    return {
      success: true,
      emailSent: emailResult,
      recipients: config.recipients
    };
  }

  static async executeApiIntegration(func, ticketId, params) {
    // Implementation for API integration
    const config = JSON.parse(func.config);
    
    // Make API call
    const apiResult = await this.makeApiCall(config, ticketId, params);
    
    return {
      success: true,
      apiResponse: apiResult
    };
  }

  static async executeCustomHandler(func, ticketId, params) {
    // Implementation for custom handlers
    // This would call the specific handler function
    throw new Error('Custom handler execution not implemented');
  }

  // Additional helper methods
  static async generateDocument(template, ticketData, params) {
    // Implementation for document generation
    // Return path to generated document
    return '/path/to/generated/document.pdf';
  }

  static processExcelData(data, config) {
    // Implementation for Excel data processing
    return data;
  }

  static async sendEmail(config, ticketData, params) {
    // Implementation for email sending
    return true;
  }

  static async makeApiCall(config, ticketId, params) {
    // Implementation for API calls
    return {};
  }
}

module.exports = CustomFunctionController;
