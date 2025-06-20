
const dbHots = require('../config/database');

const approvalService = {
    // Create approval events from workflow steps
    createApprovalEvents: async (ticketId, workflowSteps) => {
        if (!workflowSteps || workflowSteps.length === 0) {
            return Promise.resolve();
        }

        const approvalPromises = workflowSteps.map(step => {
            return new Promise((resolve, reject) => {
                if (step.assigned_user_id) {
                    // Direct user assignment
                    const insertApprovalQuery = `
                        INSERT INTO t_approval_event (
                            approval_id, approver_id, approval_order, approval_status, step_id
                        ) VALUES (?, ?, ?, 0, ?)
                    `;
                    
                    dbHots.execute(insertApprovalQuery, [
                        ticketId, step.assigned_user_id, step.step_order, step.step_id
                    ], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                } else if (step.assigned_role_id) {
                    // Role-based assignment
                    const getUsersQuery = `SELECT user_id FROM user WHERE user_role = ?`;
                    
                    dbHots.execute(getUsersQuery, [step.assigned_role_id], (err, users) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (users.length === 0) {
                            resolve(null);
                            return;
                        }

                        const roleApprovalPromises = users.map(user => {
                            return new Promise((roleResolve, roleReject) => {
                                const insertApprovalQuery = `
                                    INSERT INTO t_approval_event (
                                        approval_id, approver_id, approval_order, approval_status, step_id
                                    ) VALUES (?, ?, ?, 0, ?)
                                `;
                                
                                dbHots.execute(insertApprovalQuery, [
                                    ticketId, user.user_id, step.step_order, step.step_id
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
                    // Team-based assignment
                    const getTeamMembersQuery = `
                        SELECT tm.user_id 
                        FROM m_team_member tm 
                        WHERE tm.team_id = ? AND tm.is_active = 1
                    `;
                    
                    dbHots.execute(getTeamMembersQuery, [step.assigned_team_id], (err, members) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (members.length === 0) {
                            resolve(null);
                            return;
                        }

                        const teamApprovalPromises = members.map(member => {
                            return new Promise((teamResolve, teamReject) => {
                                const insertApprovalQuery = `
                                    INSERT INTO t_approval_event (
                                        approval_id, approver_id, approval_order, approval_status, step_id
                                    ) VALUES (?, ?, ?, 0, ?)
                                `;
                                
                                dbHots.execute(insertApprovalQuery, [
                                    ticketId, member.user_id, step.step_order, step.step_id
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

        return Promise.all(approvalPromises);
    },

    // Update approval status
    updateApprovalStatus: async (ticketId, userId, approvalOrder, status, comment) => {
        return new Promise((resolve, reject) => {
            const updateApprovalQuery = `
                UPDATE t_approval_event 
                SET approval_status = ?, approve_date = NOW(), rejection_remark = ?
                WHERE approval_id =  AND approver_id = ? AND approval_order = ?
            `;

            dbHots.execute(updateApprovalQuery, [status, comment || '', ticketId, userId, approvalOrder], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    },

    // Check if all approvals are completed
    checkAllApprovalsCompleted: async (ticketId) => {
        return new Promise((resolve, reject) => {
            const checkApprovalQuery = `
                SELECT COUNT(*) as pending_count
                FROM t_approval_event
                WHERE approval_id = ? AND approval_status = 0
            `;

            dbHots.execute(checkApprovalQuery, [ticketId], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result[0].pending_count === 0);
            });
        });
    },

    // Update ticket status
    updateTicketStatus: async (ticketId, statusId) => {
        return new Promise((resolve, reject) => {
            const updateTicketQuery = `
                UPDATE t_ticket 
                SET status_id = ?, last_update = NOW()
                WHERE ticket_id = ?
            `;

            dbHots.execute(updateTicketQuery, [statusId, ticketId], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }
};

module.exports = approvalService;
