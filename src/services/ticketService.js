
const dbHots = require('../config/database');
const customFunctionMapper = require('../utils/customFunctionMapper');

const ticketService = {
    // Get tickets with pagination and filtering
    getTicketsWithPagination: async (baseQuery, countQuery, params, limit, offset) => {
        return new Promise((resolve, reject) => {
            // Get total count first
            dbHots.execute(countQuery, params.slice(0, -2), (err, countResult) => {
                if (err) {
                    reject(err);
                    return;
                }

                const totalData = countResult[0].total;
                const totalPage = Math.ceil(totalData / limit);

                // Get paginated data
                dbHots.execute(baseQuery, params, (err2, results) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }

                    resolve({
                        totalData,
                        totalPage,
                        data: results
                    });
                });
            });
        });
    },

    // Get service and workflow details
    getServiceWithWorkflow: async (serviceId) => {
        return new Promise((resolve, reject) => {
            const serviceQuery = `
                SELECT s.*, wg.workflow_group_id
                FROM m_service s
                LEFT JOIN m_workflow_groups wg ON wg.workflow_group_id = s.m_workflow_groups
                WHERE s.service_id = ?
            `;

            dbHots.execute(serviceQuery, [serviceId], (err, serviceResult) => {
                if (err || !serviceResult.length) {
                    reject(err || new Error('Service not found'));
                    return;
                }

                const service = serviceResult[0];

                const workflowQuery = `
                    SELECT ws.*, u.firstname, u.lastname, t.team_name
                    FROM m_workflow_step ws
                    LEFT JOIN user u ON u.user_id = ws.assigned_user_id
                    LEFT JOIN m_team t ON t.team_id = ws.assigned_team_id
                    WHERE ws.workflow_group_id = ?
                    ORDER BY ws.step_order
                `;

                dbHots.execute(workflowQuery, [service.workflow_group_id], (err2, workflowSteps) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }

                    resolve({
                        service,
                        workflowSteps
                    });
                });
            });
        });
    },

    // Create ticket and ticket detail
    createTicketWithDetails: async (serviceId, userId, assignedTeam, assignedTo, reason, formData) => {
        return new Promise((resolve, reject) => {
            const insertTicketQuery = `
                INSERT INTO t_ticket (
                    service_id, status_id, created_by, assigned_team, assigned_to,
                    creation_date, last_update, reason
                ) VALUES (?, 1, ?, ?, ?, NOW(), NOW(), ?)
            `;

            dbHots.execute(insertTicketQuery, [
                serviceId, userId, assignedTeam, assignedTo, reason
            ], (err, ticketResult) => {
                if (err) {
                    reject(err);
                    return;
                }

                const ticketId = ticketResult.insertId;

                // Create ticket details
                const detailColumns = [];
                const detailValues = [ticketId];
                const detailPlaceholders = ['?'];

                for (let i = 1; i <= 16; i++) {
                    const cstmCol = `cstm_col${i}`;
                    const lblCol = `lbl_col${i}`;
                    
                    detailColumns.push(cstmCol, lblCol);
                    detailValues.push(formData[cstmCol] || '', formData[lblCol] || '');
                    detailPlaceholders.push('?', '?');
                }

                const insertDetailQuery = `
                    INSERT INTO t_ticket_detail (
                        ticket_id, ${detailColumns.join(', ')}
                    ) VALUES (${detailPlaceholders.join(', ')})
                `;

                dbHots.execute(insertDetailQuery, detailValues, (err2) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }

                    resolve(ticketId);
                });
            });
        });
    },

    // Handle file uploads for ticket
    handleTicketFileUploads: async (ticketId, uploadIds) => {
        if (!uploadIds || uploadIds.length === 0) return;

        return new Promise((resolve, reject) => {
            const updateFilesQuery = `
                UPDATE t_temp_upload 
                SET is_used = TRUE, ticket_id = ?
                WHERE upload_id IN (${uploadIds.map(() => '?').join(',')})
            `;
            
            dbHots.execute(updateFilesQuery, [ticketId, ...uploadIds], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    },

    // Execute custom functions for ticket
    executeCustomFunctions: async (serviceId, ticketId) => {
        return new Promise((resolve, reject) => {
            const customFunctionQuery = `
                SELECT cf.*, csa.trigger_event, csa.trigger_status, csa.execution_order
                FROM m_custom_function cf
                INNER JOIN m_custom_function_service_assignment csa ON cf.function_id = csa.function_id
                WHERE csa.service_id = ? AND csa.trigger_event = 'on_created' AND csa.is_active = 1
                ORDER BY csa.execution_order
            `;

            dbHots.execute(customFunctionQuery, [serviceId], (err, customFunctions) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!customFunctions || customFunctions.length === 0) {
                    resolve();
                    return;
                }

                // Get complete ticket data for function execution
                const getTicketDataQuery = `
                    SELECT 
                        t.ticket_id, t.service_id, s.service_name, t.created_by,
                        CONCAT(u.firstname, ' ', u.lastname) as created_by_name,
                        tm.team_name, d.dept_name,
                        td.*
                    FROM t_ticket t
                    LEFT JOIN m_service s ON s.service_id = t.service_id
                    LEFT JOIN user u ON u.user_id = t.created_by
                    LEFT JOIN m_team tm ON tm.team_id = t.assigned_team
                    LEFT JOIN m_department d ON d.dept_id = u.dept_id
                    LEFT JOIN t_ticket_detail td ON td.ticket_id = t.ticket_id
                    WHERE t.ticket_id = ?
                `;

                dbHots.execute(getTicketDataQuery, [ticketId], async (err2, ticketData) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }

                    if (!ticketData || ticketData.length === 0) {
                        resolve();
                        return;
                    }

                    const ticket = ticketData[0];
                    
                    try {
                        // Execute each custom function
                        for (const customFunction of customFunctions) {
                            const functionData = JSON.parse(customFunction.function_data);
                            functionData.function_id = customFunction.function_id;
                            
                            // Map ticket data to template variables
                            const variables = customFunctionMapper.mapTicketDataToVariables(ticket, ticket);
                            
                            // Execute the custom function
                            await customFunctionMapper.executeCustomFunction(
                                dbHots, 
                                ticketId, 
                                functionData, 
                                variables
                            );
                        }
                        resolve();
                    } catch (funcError) {
                        reject(funcError);
                    }
                });
            });
        });
    }
};

module.exports = ticketService;
