using Domain.Errors;

namespace Applicatiion.Interfaces.Services;

public interface IService<TRequest, TResponse, TId>
{
    Task<Result<string>> AddAsync(TRequest request);

    Task<Result<TResponse?>> GetByIdAsync(TId id);

    Task<Result<IEnumerable<TResponse>>> GetAllAsync();

    Task<Result<string>> UpdateAsync(TId id, TRequest request);

    Task<Result<string>> RemoveAsync(TId id);
}