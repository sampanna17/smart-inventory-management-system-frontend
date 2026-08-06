export interface CreateCustomerRequest {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
}
