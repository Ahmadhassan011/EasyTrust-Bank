const coordinatorService = require("../coordinator/coordinator.service");

const initiateTransfer = async (data: {
  sender_account_id: number;
  receiver_bank_swift: string;
  receiver_account_number: string;
  amount: number;
  raast_network_id: number;
  description?: string;
}) => {
  return await coordinatorService.executeTwoPhaseCommit(data);
};

module.exports = {
  initiateTransfer
};
