namespace Applicatiion.Interfaces.Services;

public interface IService<TRequest, TResponse, TId>
{
    Task AddAsync(TRequest request);

    Task<TResponse?> GetByIdAsync(TId id);

    Task<IEnumerable<TResponse>> GetAllAsync();

    Task UpdateAsync(TId id, TRequest request);

    Task RemoveAsync(TId id);
}