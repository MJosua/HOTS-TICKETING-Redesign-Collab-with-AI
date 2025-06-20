const dbHots = require('../config/database'); // Adjust path as needed
const customFunctionMapper = require('../utils/customFunctionMapper');
const yellowTerminal = '\x1b[33m'; // Yellow color for terminal
const magenta = '\x1b[35m'; // Magenta color for terminal

const ticketController = {
    // Get My Tickets (user's own tickets)
    getMyTickets: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let offset = (page - 1) * limit;

        // Count total tickets for pagination
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM t_ticket t
            WHERE t.created_by = ?
        `;

        dbHots.execute(countQuery, [user_id], (err, countResult) => {
            if (err) {
                console.log(timestamp, "GET MY TICKETS COUNT ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            let totalData = countResult[0].total;
            let totalPage = Math.ceil(totalData / limit);

            // Get tickets with details
            let queryGetMyTickets = `
                SELECT 
                    t.ticket_id,
                    t.creation_date,
                    t.service_id,
                    s.service_name,
                    t.status_id,
                    ts.status_name as status,
                    ts.color_hex as color,
                    t.assigned_to,
                    t.assigned_team,
                    tm.team_name,
                    t.last_update,
                    t.reason,
                    t.fulfilment_comment,
                    CASE 
                        WHEN EXISTS(SELECT 1 FROM t_approval_event ae WHERE ae.approval_id = t.ticket_id AND ae.approval_status = 0) THEN 0
                        WHEN EXISTS(SELECT 1 FROM t_approval_event ae WHERE ae.approval_id = t.ticket_id AND ae.approval_status = 2) THEN 2
                        ELSE 1
                    END as approval_status,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'approver_id', ae.approver_id,
                                'approver_name', CONCAT(u.firstname, ' ', u.lastname),
                                'approval_order', ae.approval_order,
                                'approval_status', ae.approval_status
                            )
                        )
                        FROM t_approval_event ae
                        LEFT JOIN user u ON u.user_id = ae.approver_id
                        WHERE ae.approval_id = t.ticket_id
                        ORDER BY ae.approval_order
                    ) as list_approval,
                    (
                        SELECT tm2.user_id
                        FROM m_team_member tm2
                        WHERE tm2.team_id = t.assigned_team AND tm2.team_leader = 1
                        LIMIT 1
                    ) as team_leader_id
                FROM t_ticket t
                LEFT JOIN m_service s ON s.service_id = t.service_id
                LEFT JOIN m_ticket_status ts ON ts.status_id = t.status_id
                LEFT JOIN m_team tm ON tm.team_id = t.assigned_team
                WHERE t.created_by = ?
                ORDER BY t.creation_date DESC
                LIMIT ? OFFSET ?
            `;

            dbHots.execute(queryGetMyTickets, [user_id, limit, offset], (err2, results2) => {
                if (err2) {
                    console.log(timestamp, "GET MY TICKETS ERROR: ", err2);
                    return res.status(502).send({
                        success: false,
                        message: err2
                    });
                }

                console.log(timestamp, "GET MY TICKETS SUCCESS");
                return res.status(200).send({
                    success: true,
                    message: "GET MY TICKETS SUCCESS",
                    totalData: totalData,
                    totalPage: totalPage,
                    data: results2
                });
            });
        });
    },

    // Get All Tickets (for admin/manager view)
    getAllTickets: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let offset = (page - 1) * limit;

        // Count total tickets
        let countQuery = `SELECT COUNT(*) as total FROM t_ticket`;

        dbHots.execute(countQuery, (err, countResult) => {
            if (err) {
                console.log(timestamp, "GET ALL TICKETS COUNT ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            let totalData = countResult[0].total;
            let totalPage = Math.ceil(totalData / limit);

            let queryGetAllTickets = `
                SELECT 
                    t.ticket_id,
                    t.creation_date,
                    t.service_id,
                    s.service_name,
                    t.status_id,
                    ts.status_name as status,
                    ts.color_hex as color,
                    t.assigned_to,
                    t.assigned_team,
                    tm.team_name,
                    t.last_update,
                    t.reason,
                    t.fulfilment_comment,
                    CONCAT(u.firstname, ' ', u.lastname) as created_by_name,
                    CASE 
                        WHEN EXISTS(SELECT 1 FROM t_approval_event ae WHERE ae.approval_id = t.ticket_id AND ae.approval_status = 0) THEN 0
                        WHEN EXISTS(SELECT 1 FROM t_approval_event ae WHERE ae.approval_id = t.ticket_id AND ae.approval_status = 2) THEN 2
                        ELSE 1
                    END as approval_status,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'approver_id', ae.approver_id,
                                'approver_name', CONCAT(u2.firstname, ' ', u2.lastname),
                                'approval_order', ae.approval_order,
                                'approval_status', ae.approval_status
                            )
                        )
                        FROM t_approval_event ae
                        LEFT JOIN user u2 ON u2.user_id = ae.approver_id
                        WHERE ae.approval_id = t.ticket_id
                        ORDER BY ae.approval_order
                    ) as list_approval,
                    (
                        SELECT tm2.user_id
                        FROM m_team_member tm2
                        WHERE tm2.team_id = t.assigned_team AND tm2.team_leader = 1
                        LIMIT 1
                    ) as team_leader_id
                FROM t_ticket t
                LEFT JOIN m_service s ON s.service_id = t.service_id
                LEFT JOIN m_ticket_status ts ON ts.status_id = t.status_id
                LEFT JOIN m_team tm ON tm.team_id = t.assigned_team
                LEFT JOIN user u ON u.user_id = t.created_by
                ORDER BY t.creation_date DESC
                LIMIT ? OFFSET ?
            `;

            dbHots.execute(queryGetAllTickets, [limit, offset], (err2, results2) => {
                if (err2) {
                    console.log(timestamp, "GET ALL TICKETS ERROR: ", err2);
                    return res.status(502).send({
                        success: false,
                        message: err2
                    });
                }

                console.log(timestamp, "GET ALL TICKETS SUCCESS");
                return res.status(200).send({
                    success: true,
                    message: "GET ALL TICKETS SUCCESS",
                    totalData: totalData,
                    totalPage: totalPage,
                    data: results2
                });
            });
        });
    },

    // Get Task List (tickets assigned to user)
    getTaskList: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let offset = (page - 1) * limit;

        // Count total tasks
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM t_ticket t
            WHERE t.assigned_to = ? OR t.assigned_team IN (
                SELECT tm.team_id FROM m_team_member tm WHERE tm.user_id = ?
            )
        `;

        dbHots.execute(countQuery, [user_id, user_id], (err, countResult) => {
            if (err) {
                console.log(timestamp, "GET TASK LIST COUNT ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            let totalData = countResult[0].total;
            let totalPage = Math.ceil(totalData / limit);

            let queryGetTaskList = `
                SELECT 
                    t.ticket_id,
                    t.creation_date,
                    t.service_id,
                    s.service_name,
                    t.status_id,
                    ts.status_name as status,
                    ts.color_hex as color,
                    t.assigned_to,
                    t.assigned_team,
                    tm.team_name,
                    t.last_update,
                    t.reason,
                    t.fulfilment_comment,
                    CONCAT(u.firstname, ' ', u.lastname) as created_by_name,
                    CASE 
                        WHEN EXISTS(SELECT 1 FROM t_approval_event ae WHERE ae.approval_id = t.ticket_id AND ae.approval_status = 0) THEN 0
                        WHEN EXISTS(SELECT 1 FROM t_approval_event ae WHERE ae.approval_id = t.ticket_id AND ae.approval_status = 2) THEN 2
                        ELSE 1
                    END as approval_status,
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'approver_id', ae.approver_id,
                                'approver_name', CONCAT(u2.firstname, ' ', u2.lastname),
                                'approval_order', ae.approval_order,
                                'approval_status', ae.approval_status
                            )
                        )
                        FROM t_approval_event ae
                        LEFT JOIN user u2 ON u2.user_id = ae.approver_id
                        WHERE ae.approval_id = t.ticket_id
                        ORDER BY ae.approval_order
                    ) as list_approval,
                    (
                        SELECT tm2.user_id
                        FROM m_team_member tm2
                        WHERE tm2.team_id = t.assigned_team AND tm2.team_leader = 1
                        LIMIT 1
                    ) as team_leader_id
                FROM t_ticket t
                LEFT JOIN m_service s ON s.service_id = t.service_id
                LEFT JOIN m_ticket_status ts ON ts.status_id = t.status_id
                LEFT JOIN m_team tm ON tm.team_id = t.assigned_team
                LEFT JOIN user u ON u.user_id = t.created_by
                WHERE t.assigned_to = ? OR t.assigned_team IN (
                    SELECT tm3.team_id FROM m_team_member tm3 WHERE tm3.user_id = ?
                )
                ORDER BY t.creation_date DESC
                LIMIT ? OFFSET ?
            `;

            dbHots.execute(queryGetTaskList, [user_id, user_id, limit, offset], (err2, results2) => {
                if (err2) {
                    console.log(timestamp, "GET TASK LIST ERROR: ", err2);
                    return res.status(502).send({
                        success: false,
                        message: err2
                    });
                }

                console.log(timestamp, "GET TASK LIST SUCCESS");
                return res.status(200).send({
                    success: true,
                    message: "GET TASK LIST SUCCESS",
                    totalData: totalData,
                    totalPage: totalPage,
                    data: results2
                });
            });
        });
    },

    // Get Task Count
    getTaskCount: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;

        let countQuery = `
            SELECT COUNT(*) as total_tasks
            FROM t_ticket t
            WHERE (t.assigned_to = ? OR t.assigned_team IN (
                SELECT tm.team_id FROM m_team_member tm WHERE tm.user_id = ?
            )) AND t.status_id NOT IN (5, 6)
        `;

        dbHots.execute(countQuery, [user_id, user_id], (err, result) => {
            if (err) {
                console.log(timestamp, "GET TASK COUNT ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            console.log(timestamp, "GET TASK COUNT SUCCESS");
            return res.status(200).send({
                success: true,
                message: "GET TASK COUNT SUCCESS",
                count: result[0].total_tasks
            });
        });
    },

    // Upload Files
    uploadFiles: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No files uploaded"
            });
        }

        // Track uploaded files in temp table
        let insertPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                let insertQuery = `
                    INSERT INTO t_temp_upload (uploaded_by, file_path, filename, upload_date, is_used)
                    VALUES (?, ?, ?, NOW(), FALSE)
                `;
                
                dbHots.execute(insertQuery, [user_id, file.path, file.originalname], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            upload_id: result.insertId,
                            filename: file.originalname,
                            path: file.path,
                            size: file.size
                        });
                    }
                });
            });
        });

        Promise.all(insertPromises)
            .then(uploadedFiles => {
                console.log(timestamp, "FILES UPLOADED SUCCESSFULLY");
                return res.status(200).send({
                    success: true,
                    message: "FILES UPLOADED SUCCESSFULLY",
                    files: uploadedFiles
                });
            })
            .catch(err => {
                console.log(timestamp, "UPLOAD FILES ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            });
    },

    // Create New Ticket - Updated with custom function execution
    createTicket: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;
        let service_id = req.params.service_id;
        let { reason, upload_ids, ...formData } = req.body;

        if (!service_id || !reason) {
            return res.status(400).send({
                success: false,
                message: "service_id and reason are required"
            });
        }

        // Get service details and workflow
        let serviceQuery = `
            SELECT s.*, wg.workflow_group_id
            FROM m_service s
            LEFT JOIN m_workflow_groups wg ON wg.workflow_group_id = s.m_workflow_groups
            WHERE s.service_id = ?
        `;

        dbHots.execute(serviceQuery, [service_id], (err, serviceResult) => {
            if (err || !serviceResult.length) {
                console.log(timestamp, "GET SERVICE ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: "Service not found"
                });
            }

            let service = serviceResult[0];

            // Get workflow steps if workflow exists
            let workflowQuery = `
                SELECT ws.*, u.firstname, u.lastname, t.team_name
                FROM m_workflow_step ws
                LEFT JOIN user u ON u.user_id = ws.assigned_user_id
                LEFT JOIN m_team t ON t.team_id = ws.assigned_team_id
                WHERE ws.workflow_group_id = ?
                ORDER BY ws.step_order
            `;

            dbHots.execute(workflowQuery, [service.workflow_group_id], (err2, workflowSteps) => {
                if (err2) {
                    console.log(timestamp, "GET WORKFLOW ERROR: ", err2);
                    return res.status(502).send({
                        success: false,
                        message: err2
                    });
                }

                // Create main ticket
                let insertTicketQuery = `
                    INSERT INTO t_ticket (
                        service_id, status_id, created_by, assigned_team, assigned_to,
                        creation_date, last_update, reason
                    ) VALUES (?, 1, ?, ?, ?, NOW(), NOW(), ?)
                `;

                let firstStep = workflowSteps.length > 0 ? workflowSteps[0] : null;
                let assigned_team = firstStep ? firstStep.assigned_team_id : null;
                let assigned_to = firstStep ? firstStep.assigned_user_id : null;

                dbHots.execute(insertTicketQuery, [
                    service_id, user_id, assigned_team, assigned_to, reason
                ], (err3, ticketResult) => {
                    if (err3) {
                        console.log(timestamp, "CREATE TICKET ERROR: ", err3);
                        return res.status(502).send({
                            success: false,
                            message: err3
                        });
                    }

                    let ticket_id = ticketResult.insertId;

                    // Create ticket details from form data
                    let detailColumns = [];
                    let detailValues = [ticket_id];
                    let detailPlaceholders = ['?'];

                    for (let i = 1; i <= 16; i++) {
                        let cstmCol = `cstm_col${i}`;
                        let lblCol = `lbl_col${i}`;
                        
                        detailColumns.push(cstmCol, lblCol);
                        detailValues.push(formData[cstmCol] || '', formData[lblCol] || '');
                        detailPlaceholders.push('?', '?');
                    }

                    let insertDetailQuery = `
                        INSERT INTO t_ticket_detail (
                            ticket_id, ${detailColumns.join(', ')}
                        ) VALUES (${detailPlaceholders.join(', ')})
                    `;

                    dbHots.execute(insertDetailQuery, detailValues, (err4) => {
                        if (err4) {
                            console.log(timestamp, "CREATE TICKET DETAIL ERROR: ", err4);
                            return res.status(502).send({
                                success: false,
                                message: err4
                            });
                        }

                        // Mark uploaded files as used
                        if (upload_ids && upload_ids.length > 0) {
                            let updateFilesQuery = `
                                UPDATE t_temp_upload 
                                SET is_used = TRUE, ticket_id = ?
                                WHERE upload_id IN (${upload_ids.map(() => '?').join(',')})
                            `;
                            
                            dbHots.execute(updateFilesQuery, [ticket_id, ...upload_ids], (err5) => {
                                if (err5) {
                                    console.log(timestamp, "UPDATE FILES ERROR: ", err5);
                                }
                            });
                        }

                        // Execute custom functions with 'on_created' trigger
                        let customFunctionQuery = `
                            SELECT cf.*, csa.trigger_event, csa.trigger_status, csa.execution_order
                            FROM m_custom_function cf
                            INNER JOIN m_custom_function_service_assignment csa ON cf.function_id = csa.function_id
                            WHERE csa.service_id = ? AND csa.trigger_event = 'on_created' AND csa.is_active = 1
                            ORDER BY csa.execution_order
                        `;

                        dbHots.execute(customFunctionQuery, [service_id], (err6, customFunctions) => {
                            if (err6) {
                                console.log(timestamp, "GET CUSTOM FUNCTIONS ERROR: ", err6);
                            } else if (customFunctions && customFunctions.length > 0) {
                                // Get complete ticket data for function execution
                                let getTicketDataQuery = `
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

                                dbHots.execute(getTicketDataQuery, [ticket_id], (err7, ticketData) => {
                                    if (err7) {
                                        console.log(timestamp, "GET TICKET DATA ERROR: ", err7);
                                    } else if (ticketData && ticketData.length > 0) {
                                        const ticket = ticketData[0];
                                        
                                        // Execute each custom function
                                        customFunctions.forEach(async (customFunction) => {
                                            try {
                                                const functionData = JSON.parse(customFunction.function_data);
                                                functionData.function_id = customFunction.function_id;
                                                
                                                // Map ticket data to template variables
                                                const variables = customFunctionMapper.mapTicketDataToVariables(ticket, ticket);
                                                
                                                // Execute the custom function
                                                await customFunctionMapper.executeCustomFunction(
                                                    dbHots, 
                                                    ticket_id, 
                                                    functionData, 
                                                    variables
                                                );
                                                
                                                console.log(timestamp, `Custom function ${customFunction.function_id} executed for ticket ${ticket_id}`);
                                            } catch (funcError) {
                                                console.log(timestamp, `Custom function execution error for function ${customFunction.function_id}:`, funcError);
                                            }
                                        });
                                    }
                                });
                            }
                        });

                        // Create approval events from workflow
                        if (workflowSteps.length > 0) {
                            let approvalPromises = workflowSteps.map(step => {
                                return new Promise((resolve, reject) => {
                                    // Get approver based on step type
                                    let getApproverQuery = '';
                                    let approverParams = [];

                                    if (step.assigned_user_id) {
                                        // Direct user assignment
                                        let insertApprovalQuery = `
                                            INSERT INTO t_approval_event (
                                                approval_id, approver_id, approval_order, approval_status, step_id
                                            ) VALUES (?, ?, ?, 0, ?)
                                        `;
                                        
                                        dbHots.execute(insertApprovalQuery, [
                                            ticket_id, step.assigned_user_id, step.step_order, step.step_id
                                        ], (err, result) => {
                                            if (err) reject(err);
                                            else resolve(result);
                                        });
                                    } else if (step.assigned_role_id) {
                                        // Role-based assignment - get users with this role
                                        getApproverQuery = `
                                            SELECT user_id FROM user WHERE user_role = ?
                                        `;
                                        approverParams = [step.assigned_role_id];

                                        dbHots.execute(getApproverQuery, approverParams, (err, users) => {
                                            if (err) {
                                                reject(err);
                                                return;
                                            }

                                            if (users.length === 0) {
                                                resolve(null);
                                                return;
                                            }

                                            // Create approval for each user with this role
                                            let roleApprovalPromises = users.map(user => {
                                                return new Promise((roleResolve, roleReject) => {
                                                    let insertApprovalQuery = `
                                                        INSERT INTO t_approval_event (
                                                            approval_id, approver_id, approval_order, approval_status, step_id
                                                        ) VALUES (?, ?, ?, 0, ?)
                                                    `;
                                                    
                                                    dbHots.execute(insertApprovalQuery, [
                                                        ticket_id, user.user_id, step.step_order, step.step_id
                                                    ], (err, result) => {
                                                        if (err) roleReject(err);
                                                        else roleResolve(result);
                                                    });
                                                });
                                            });

                                            Promise.all(roleApprovalPromises)
                                                .then(() => resolve())
                                                .catch(reject);
                                        });
                                    } else if (step.assigned_team_id) {
                                        // Team-based assignment - get team members
                                        getApproverQuery = `
                                            SELECT tm.user_id 
                                            FROM m_team_member tm 
                                            WHERE tm.team_id = ? AND tm.is_active = 1
                                        `;
                                        approverParams = [step.assigned_team_id];

                                        dbHots.execute(getApproverQuery, approverParams, (err, members) => {
                                            if (err) {
                                                reject(err);
                                                return;
                                            }

                                            if (members.length === 0) {
                                                resolve(null);
                                                return;
                                            }

                                            // Create approval for each team member
                                            let teamApprovalPromises = members.map(member => {
                                                return new Promise((teamResolve, teamReject) => {
                                                    let insertApprovalQuery = `
                                                        INSERT INTO t_approval_event (
                                                            approval_id, approver_id, approval_order, approval_status, step_id
                                                        ) VALUES (?, ?, ?, 0, ?)
                                                    `;
                                                    
                                                    dbHots.execute(insertApprovalQuery, [
                                                        ticket_id, member.user_id, step.step_order, step.step_id
                                                    ], (err, result) => {
                                                        if (err) teamReject(err);
                                                        else teamResolve(result);
                                                    });
                                                });
                                            });

                                            Promise.all(teamApprovalPromises)
                                                .then(() => resolve())
                                                .catch(reject);
                                        });
                                    } else {
                                        resolve(null);
                                    }
                                });
                            });

                            Promise.all(approvalPromises)
                                .then(() => {
                                    console.log(timestamp, "CREATE TICKET SUCCESS");
                                    return res.status(200).send({
                                        success: true,
                                        message: "TICKET CREATED SUCCESSFULLY",
                                        ticket_id: ticket_id
                                    });
                                })
                                .catch(err5 => {
                                    console.log(timestamp, "CREATE APPROVAL ERROR: ", err5);
                                    return res.status(502).send({
                                        success: false,
                                        message: err5
                                    });
                                });
                        } else {
                            console.log(timestamp, "CREATE TICKET SUCCESS (NO WORKFLOW)");
                            return res.status(200).send({
                                success: true,
                                message: "TICKET CREATED SUCCESSFULLY",
                                ticket_id: ticket_id
                            });
                        }
                    });
                });
            });
        });
    },

    // Get Ticket Detail
    getTicketDetail: (req, res) => {
        let date = new Date();
        let timestamp = magenta + date.toLocaleDateString() + ' ' + date.toLocaleTimeString('id') + ' : ' + ' ';

        let ticket_id = req.params.ticket_id;

        if (!ticket_id) {
            return res.status(400).send({
                success: false,
                message: "ticket_id must be provided"
            });
        }

        let queryGetTicketDetail = `
            SELECT 
                t.ticket_id,
                t.creation_date,
                t.service_id,
                s.service_name,
                t.status_id,
                ts.status_name as status,
                ts.color_hex as color,
                t.assigned_to,
                t.assigned_team,
                tm.team_name,
                t.last_update,
                t.reason,
                t.fulfilment_comment,
                CONCAT(u.firstname, ' ', u.lastname) as created_by_name,
                td.cstm_col1, td.lbl_col1,
                td.cstm_col2, td.lbl_col2,
                td.cstm_col3, td.lbl_col3,
                td.cstm_col4, td.lbl_col4,
                td.cstm_col5, td.lbl_col5,
                td.cstm_col6, td.lbl_col6,
                td.cstm_col7, td.lbl_col7,
                td.cstm_col8, td.lbl_col8,
                td.cstm_col9, td.lbl_col9,
                td.cstm_col10, td.lbl_col10,
                td.cstm_col11, td.lbl_col11,
                td.cstm_col12, td.lbl_col12,
                td.cstm_col13, td.lbl_col13,
                td.cstm_col14, td.lbl_col14,
                td.cstm_col15, td.lbl_col15,
                td.cstm_col16, td.lbl_col16,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'upload_id', tu.upload_id,
                            'filename', tu.filename,
                            'file_path', tu.file_path
                        )
                    )
                    FROM t_temp_upload tu 
                    WHERE tu.ticket_id = t.ticket_id AND tu.is_used = TRUE
                ) as list_attachment,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'approver_id', ae.approver_id,
                            'approver_name', CONCAT(u2.firstname, ' ', u2.lastname),
                            'approval_order', ae.approval_order,
                            'approval_status', ae.approval_status,
                            'approve_date', DATE_FORMAT(ae.approve_date, '%Y-%m-%d'),
                            'rejection_remark', ae.rejection_remark
                        )
                    )
                    FROM t_approval_event ae
                    LEFT JOIN user u2 ON u2.user_id = ae.approver_id
                    WHERE ae.approval_id = t.ticket_id
                    ORDER BY ae.approval_order
                ) as list_approval,
                (
                    SELECT tm2.user_id
                    FROM m_team_member tm2
                    WHERE tm2.team_id = t.assigned_team AND tm2.team_leader = 1
                    LIMIT 1
                ) as team_leader_id
            FROM t_ticket t
            LEFT JOIN m_service s ON s.service_id = t.service_id
            LEFT JOIN m_ticket_status ts ON ts.status_id = t.status_id
            LEFT JOIN m_team tm ON tm.team_id = t.assigned_team
            LEFT JOIN user u ON u.user_id = t.created_by
            LEFT JOIN t_ticket_detail td ON td.ticket_id = t.ticket_id
            WHERE t.ticket_id = ?
        `;

        dbHots.execute(queryGetTicketDetail, [ticket_id], (err, results) => {
            if (err) {
                console.log(timestamp, "GET TICKET DETAIL ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            if (!results.length) {
                return res.status(404).send({
                    success: false,
                    message: 'Ticket not found!'
                });
            }

            console.log(timestamp, "GET TICKET DETAIL SUCCESS");
            return res.status(200).send({
                success: true,
                message: "GET TICKET DETAIL SUCCESS",
                data: results[0]
            });
        });
    },

    // Get Ticket Attachments
    getTicketAttachments: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let ticket_id = req.params.ticket_id;

        if (!ticket_id) {
            return res.status(400).send({
                success: false,
                message: "ticket_id must be provided"
            });
        }

        let queryGetAttachments = `
            SELECT upload_id, filename, file_path, upload_date
            FROM t_temp_upload
            WHERE ticket_id = ? AND is_used = TRUE
            ORDER BY upload_date DESC
        `;

        dbHots.execute(queryGetAttachments, [ticket_id], (err, results) => {
            if (err) {
                console.log(timestamp, "GET TICKET ATTACHMENTS ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            console.log(timestamp, "GET TICKET ATTACHMENTS SUCCESS");
            return res.status(200).send({
                success: true,
                message: "GET TICKET ATTACHMENTS SUCCESS",
                data: results
            });
        });
    },

    // Approve Ticket
    approveTicket: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;
        let ticket_id = req.params.ticket_id;
        let { approval_order, comment } = req.body;

        if (!ticket_id || approval_order === undefined) {
            return res.status(400).send({
                success: false,
                message: "ticket_id and approval_order are required"
            });
        }

        // Update approval event
        let updateApprovalQuery = `
            UPDATE t_approval_event 
            SET approval_status = 1, approve_date = NOW(), rejection_remark = ?
            WHERE approval_id = ? AND approver_id = ? AND approval_order = ?
        `;

        dbHots.execute(updateApprovalQuery, [comment || '', ticket_id, user_id, approval_order], (err, result) => {
            if (err) {
                console.log(timestamp, "APPROVE TICKET ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            // Check if all approvals are completed
            let checkApprovalQuery = `
                SELECT COUNT(*) as pending_count
                FROM t_approval_event
                WHERE approval_id = ? AND approval_status = 0
            `;

            dbHots.execute(checkApprovalQuery, [ticket_id], (err2, checkResult) => {
                if (err2) {
                    console.log(timestamp, "CHECK APPROVAL ERROR: ", err2);
                    return res.status(502).send({
                        success: false,
                        message: err2
                    });
                }

                // If no pending approvals, update ticket status to approved
                if (checkResult[0].pending_count === 0) {
                    let updateTicketQuery = `
                        UPDATE t_ticket 
                        SET status_id = 3, last_update = NOW()
                        WHERE ticket_id = ?
                    `;

                    dbHots.execute(updateTicketQuery, [ticket_id], (err3) => {
                        if (err3) {
                            console.log(timestamp, "UPDATE TICKET STATUS ERROR: ", err3);
                        }
                    });
                }

                console.log(timestamp, "APPROVE TICKET SUCCESS");
                return res.status(200).send({
                    success: true,
                    message: "TICKET APPROVED SUCCESSFULLY"
                });
            });
        });
    },

    // Reject Ticket
    rejectTicket: (req, res) => {
        let date = new Date();
        let timestamp = yellowTerminal + date.toLocaleDateString('id') + ' ' + date.toLocaleTimeString('id') + ' : ';
        
        let user_id = req.dataToken.user_id;
        let ticket_id = req.params.ticket_id;
        let { approval_order, rejection_remark } = req.body;

        if (!ticket_id || approval_order === undefined || !rejection_remark) {
            return res.status(400).send({
                success: false,
                message: "ticket_id, approval_order, and rejection_remark are required"
            });
        }

        // Update approval event to rejected
        let updateApprovalQuery = `
            UPDATE t_approval_event 
            SET approval_status = 2, approve_date = NOW(), rejection_remark = ?
            WHERE approval_id = ? AND approver_id = ? AND approval_order = ?
        `;

        dbHots.execute(updateApprovalQuery, [rejection_remark, ticket_id, user_id, approval_order], (err, result) => {
            if (err) {
                console.log(timestamp, "REJECT TICKET ERROR: ", err);
                return res.status(502).send({
                    success: false,
                    message: err
                });
            }

            // Update ticket status to rejected
            let updateTicketQuery = `
                UPDATE t_ticket 
                SET status_id = 4, last_update = NOW()
                WHERE ticket_id = ?
            `;

            dbHots.execute(updateTicketQuery, [ticket_id], (err2) => {
                if (err2) {
                    console.log(timestamp, "UPDATE TICKET STATUS ERROR: ", err2);
                    return res.status(502).send({
                        success: false,
                        message: err2
                    });
                }

                console.log(timestamp, "REJECT TICKET SUCCESS");
                return res.status(200).send({
                    success: true,
                    message: "TICKET REJECTED SUCCESSFULLY"
                });
            });
        });
    }
};

module.exports = ticketController;
