const prisma = require("../../config/prisma");

const createCustomer = async (data: any) => {
  return await prisma.customer.create({
    data,
  });
};

const getAllCustomers = async () => {
  return await prisma.customer.findMany();
};

const getCustomerById = async (id: number) => {
  return await prisma.customer.findUnique({
    where: { customer_id: id },
  });
};

const updateCustomer = async (id: number, data: any) => {
  return await prisma.customer.update({
    where: { customer_id: id },
    data,
  });
};

const deleteCustomer = async (id: number) => {
  return await prisma.customer.delete({
    where: { customer_id: id },
  });
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};