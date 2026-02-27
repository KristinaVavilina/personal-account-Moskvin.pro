namespace Domain.Interfaces;

public interface IRepository<TEntity, TId> where TEntity : class
{
    Task AddAsync(TEntity entity);

    Task<TEntity?> GetByIdAsync(TId id);

    Task<IEnumerable<TEntity>> GetAllAsync();

    Task UpdateAsync(TEntity entity);

    Task RemoveAsync(TEntity entity);
}