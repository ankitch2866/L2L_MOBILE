// Unit tests for Customer Service
import customerService from '../customerService';
import api from '../../config/api';

// Mock the API
jest.mock('../../config/api');

describe('CustomerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        { project_id: 1, project_name: 'Project 1' },
        { project_id: 2, project_name: 'Project 2' }
      ];

      api.get.mockResolvedValue({
        data: { success: true, data: mockProjects }
      });

      const result = await customerService.getProjects();
      
      expect(api.get).toHaveBeenCalledWith('/api/master/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should handle API errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(customerService.getProjects()).rejects.toThrow('Network error');
    });
  });

  describe('getCustomersByProject', () => {
    it('should fetch customers for a project', async () => {
      const projectId = '1';
      const mockCustomers = [
        { customer_id: 1, name: 'Customer 1' },
        { customer_id: 2, name: 'Customer 2' }
      ];

      api.get.mockResolvedValue({
        data: { success: true, data: mockCustomers }
      });

      const result = await customerService.getCustomersByProject(projectId);
      
      expect(api.get).toHaveBeenCalledWith(`/api/master/customers/project/${projectId}`);
      expect(result).toEqual(mockCustomers);
    });
  });

  describe('getCustomerDetails', () => {
    it('should fetch comprehensive customer details', async () => {
      const customerId = 'CUST001';
      const mockSearchResult = {
        data: { 
          success: true, 
          data: [{ customer_id: 1, manual_application_id: 'CUST001' }] 
        }
      };
      const mockDetailsResult = {
        data: { 
          success: true, 
          data: { customer_id: 1, name: 'Test Customer' } 
        }
      };

      api.get
        .mockResolvedValueOnce(mockSearchResult)
        .mockResolvedValueOnce(mockDetailsResult);

      const result = await customerService.getCustomerDetails(customerId);
      
      expect(result).toHaveProperty('customer_id', 1);
      expect(result).toHaveProperty('name', 'Test Customer');
    });

    it('should throw error when customer not found', async () => {
      api.get.mockResolvedValue({
        data: { success: true, data: [] }
      });

      await expect(customerService.getCustomerDetails('INVALID'))
        .rejects.toThrow('Customer not found');
    });
  });

  // Add more tests for other methods...
});
