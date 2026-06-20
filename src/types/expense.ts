export interface Expense {
  id: string;
  employee_name: string;
  category: 'Travel' | 'Accommodation' | 'Meals' | 'Equipment' | 'Training' | 'Miscellaneous';
  amount: number;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  department: 'Engineering' | 'Sales' | 'Marketing' | 'HR' | 'Finance' | 'Operations';
  notes: string;
  receipt_url?: string;
}
