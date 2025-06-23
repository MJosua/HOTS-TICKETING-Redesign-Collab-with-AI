const dbHots = require('../config/database');
const fs = require('fs');
const path = require('path');

const customFunctionController = {
    // Get function logs for a ticket
    getFunctionLogs: (req, res) => {
        const ticketId = req.params.ticket_id;
        
        if (!ticketId) {
            return res.status(400).send({
                success: false,
                message: "ticket_id is required"
            });
        }

        const query = `
            SELECT 
                id,
                ticket_id,
                service_id,
                function_name,
                trigger_event,
                status,
                result_data,
                error_message,
                execution_time,
                created_by
            FROM t_custom_function_logs 
            WHERE ticket_id = ? 
            ORDER BY execution_time DESC
        `;

        dbHots.execute(query, [ticketId], (err, results) => {
            if (err) {
                console.error('Error fetching function logs:', err);
                return res.status(500).send({
                    success: false,
                    message: err.message || 'Failed to fetch function logs'
                });
            }

            console.log(`Found ${results.length} function logs for ticket ${ticketId}`);
            
            return res.status(200).send({
                success: true,
                message: "Function logs fetched successfully",
                data: results
            });
        });
    },

    // Get generated documents for a ticket
    getGeneratedDocuments: (req, res) => {
        const ticketId = req.params.ticket_id;
        
        if (!ticketId) {
            return res.status(400).send({
                success: false,
                message: "ticket_id is required"
            });
        }

        const query = `
            SELECT 
                id,
                ticket_id,
                document_type,
                file_path,
                file_name,
                generated_date,
                template_used
            FROM t_generated_documents 
            WHERE ticket_id = ? 
            ORDER BY generated_date DESC
        `;

        dbHots.execute(query, [ticketId], (err, results) => {
            if (err) {
                console.error('Error fetching generated documents:', err);
                return res.status(500).send({
                    success: false,
                    message: err.message || 'Failed to fetch generated documents'
                });
            }

            console.log(`Found ${results.length} generated documents for ticket ${ticketId}`);
            
            return res.status(200).send({
                success: true,
                message: "Generated documents fetched successfully",
                data: results
            });
        });
    },

    // Download generated document
    downloadDocument: (req, res) => {
        const documentPath = req.params.document_path;
        
        if (!documentPath) {
            return res.status(400).send({
                success: false,
                message: "document_path is required"
            });
        }

        const fullPath = path.join(__dirname, '../../uploads', documentPath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send({
                success: false,
                message: "Document not found"
            });
        }

        // Send file
        res.download(fullPath, (err) => {
            if (err) {
                console.error('Error downloading document:', err);
                return res.status(500).send({
                    success: false,
                    message: "Error downloading document"
                });
            }
        });
    },

    // Download by document ID
    downloadById: (req, res) => {
        const documentId = req.params.document_id;
        
        if (!documentId) {
            return res.status(400).send({
                success: false,
                message: "document_id is required"
            });
        }

        const query = `
            SELECT file_path, file_name 
            FROM t_generated_documents 
            WHERE id = ?
        `;

        dbHots.execute(query, [documentId], (err, results) => {
            if (err) {
                console.error('Error fetching document info:', err);
                return res.status(500).send({
                    success: false,
                    message: "Error fetching document information"
                });
            }

            if (!results.length) {
                return res.status(404).send({
                    success: false,
                    message: "Document not found"
                });
            }

            const document = results[0];
            const fullPath = path.join(__dirname, '../../uploads', document.file_path);
            
            // Check if file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).send({
                    success: false,
                    message: "Document file not found"
                });
            }

            // Send file
            res.download(fullPath, document.file_name, (err) => {
                if (err) {
                    console.error('Error downloading document:', err);
                    return res.status(500).send({
                        success: false,
                        message: "Error downloading document"
                    });
                }
            });
        });
    }
};

module.exports = customFunctionController;
