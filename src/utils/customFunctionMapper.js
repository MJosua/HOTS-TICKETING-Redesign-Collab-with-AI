
const customFunctionMapper = {
    // Map ticket data to template variables for Sample Request Form
    mapTicketDataToVariables: (ticketData, ticketDetail) => {
        const variables = {
            ticket_id: ticketData.ticket_id,
            requester_name: ticketData.created_by_name || 'N/A',
            requester_department: ticketData.dept_name || ticketData.team_name || 'N/A',
            service_name: ticketData.service_name || 'N/A',
            year: new Date().getFullYear().toString(),
            date: new Date().toISOString().split('T')[0]
        };

        // Map custom form fields to specific variables based on labels
        if (ticketDetail) {
            for (let i = 1; i <= 16; i++) {
                const label = ticketDetail[`lbl_col${i}`];
                const value = ticketDetail[`cstm_col${i}`];
                
                if (label && value) {
                    const normalizedLabel = label.toLowerCase().trim();
                    
                    // Map based on common field labels
                    if (normalizedLabel.includes('purpose') || normalizedLabel.includes('reason')) {
                        variables.request_purpose = value;
                    } else if (normalizedLabel.includes('delivery') || normalizedLabel.includes('schedule')) {
                        variables.delivery_schedule = value;
                    } else if (normalizedLabel.includes('manager') && normalizedLabel.includes('approval')) {
                        variables.approval_manager = value;
                    } else if (normalizedLabel.includes('business') && normalizedLabel.includes('analyst')) {
                        variables.business_analyst = value;
                    } else if (normalizedLabel.includes('product') && normalizedLabel.includes('manager')) {
                        variables.product_manager = value;
                    } else if (normalizedLabel.includes('accounting') && normalizedLabel.includes('manager')) {
                        variables.accounting_manager = value;
                    } else if (normalizedLabel.includes('item') || normalizedLabel.includes('list')) {
                        variables.item_list = value;
                    }
                }
            }
        }

        // Set default values for missing variables
        variables.request_purpose = variables.request_purpose || 'Sample Request';
        variables.delivery_schedule = variables.delivery_schedule || 'ASAP';
        variables.approval_manager = variables.approval_manager || 'Manager';
        variables.business_analyst = variables.business_analyst || 'Business Analyst';
        variables.product_manager = variables.product_manager || 'Product Manager';
        variables.accounting_manager = variables.accounting_manager || 'Accounting Manager';
        variables.item_list = variables.item_list || 'Sample Items';

        return variables;
    },

    // Execute custom function for a ticket
    executeCustomFunction: async (dbHots, ticketId, functionData, variables) => {
        return new Promise((resolve, reject) => {
            const insertQuery = `
                INSERT INTO t_custom_function_execution (
                    function_id, ticket_id, execution_status, execution_date, 
                    input_data, output_data
                ) VALUES (?, ?, 'pending', NOW(), ?, NULL)
            `;

            const inputData = JSON.stringify({
                variables: variables,
                template_id: functionData.template_id,
                document_type: functionData.document_type,
                output_format: functionData.output_format,
                template_content: functionData.template_content,
                file_name_pattern: functionData.file_name_pattern
            });

            dbHots.execute(insertQuery, [
                functionData.function_id, 
                ticketId, 
                inputData
            ], (err, result) => {
                if (err) {
                    console.error('Error executing custom function:', err);
                    reject(err);
                } else {
                    console.log(`Custom function ${functionData.function_id} executed for ticket ${ticketId}`);
                    resolve(result);
                }
            });
        });
    }
};

module.exports = customFunctionMapper;
