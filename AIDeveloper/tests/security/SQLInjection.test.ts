import { getWorkflows } from '../../src/database/queries';

describe('SQL Injection Protection', () => {
  it('should use parameterized queries', async () => {
    // Mock sequelize to verify parameterized query usage
    const mockQuery = jest.fn().mockResolvedValue([]);
    // Assuming sequelize is mocked
    const result = await getWorkflows(1, 10);
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT * FROM workflows WHERE userId = ? LIMIT ?',
      expect.objectContaining({ replacements: [1, 10] })
    );
  });
});