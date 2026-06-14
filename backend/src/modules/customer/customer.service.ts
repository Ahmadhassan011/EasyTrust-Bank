const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");

const SAFE_CUSTOMER_SELECT = {
  customer_id: true,
  first_name: true,
  last_name: true,
  cnic: true,
  email: true,
  phone: true,
  address: true,
  dob: true,
  kyc_status: true,
  created_at: true,
};

const createCustomer = async (data: any) => {
  const { password, ...rest } = data;
  const password_hash = await bcrypt.hash(password, 12);

  const customer = await prisma.customer.create({
    data: { ...rest, password_hash },
    select: SAFE_CUSTOMER_SELECT,
  });

  return customer;
};

const getAllCustomers = async () => {
  return await prisma.customer.findMany({ select: SAFE_CUSTOMER_SELECT });
};

const getCustomerById = async (id: number) => {
  return await prisma.customer.findUnique({
    where: { customer_id: id },
    select: SAFE_CUSTOMER_SELECT,
  });
};

const updateCustomer = async (id: number, data: any) => {
  return await prisma.customer.update({
    where: { customer_id: id },
    data,
    select: SAFE_CUSTOMER_SELECT,
  });
};

const deleteCustomer = async (id: number) => {
  return await prisma.customer.delete({
    where: { customer_id: id },
    select: SAFE_CUSTOMER_SELECT,
  });
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  SAFE_CUSTOMER_SELECT,
};
