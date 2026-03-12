using AutoMapper;
using Applicatiion.Interfaces.Services;
using Domain.Interfaces.Repositories;
using Domain.Errors;
using Serilog;

namespace Application.Services;

public class BaseService<TEntity, TRequest, TResponse, TId>
    : IService<TRequest, TResponse, TId>
    where TEntity : class
{
    protected readonly IRepository<TEntity, TId> _repository;
    protected readonly IMapper _mapper;

    public BaseService(IRepository<TEntity, TId> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<TId>> AddAsync(TRequest request)
    {
        var entity = _mapper.Map<TEntity>(request);
        await _repository.AddAsync(entity);

        var id = (TId)entity.GetType().GetProperty("Id")?.GetValue(entity)!;

        Log.Information("Создана сущность {EntityType} с ID: {Id}", typeof(TEntity).Name, id);

        return Result<TId>.Success(id);
    }

    public async Task<Result<TResponse?>> GetByIdAsync(TId id)
    {
        var entity = await _repository.GetByIdAsync(id);

        if (entity == null)
        {
            Log.Warning("Сущность {EntityType} с ID: {Id} не найдена", typeof(TEntity).Name, id);
            return Result<TResponse?>.Failure($"Запись с ID {id} не найдена");
        }

        var response = _mapper.Map<TResponse>(entity);

        Log.Information("Получена сущность {EntityType} с ID: {Id}", typeof(TEntity).Name, id);

        return Result<TResponse?>.Success(response);
    }

    public async Task<Result<IEnumerable<TResponse>>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();
        var response = _mapper.Map<IEnumerable<TResponse>>(entities);
        var count = response.Count();

        if (count == 0)
        {
            Log.Warning("Запрошен список {EntityType}, но база данных пуста", typeof(TEntity).Name);
        }
        else
        {
            Log.Information("Успешно получено {Count} записей типа {EntityType}", count, typeof(TEntity).Name);
        }

        return Result<IEnumerable<TResponse>>.Success(response);
    }

    public async Task<Result<string>> UpdateAsync(TId id, TRequest request)
    {
        var entity = await _repository.GetByIdAsync(id);

        if (entity == null)
        {
            Log.Warning("Сущность {EntityType} с ID: {Id} не найдена", typeof(TEntity).Name, id);
            return Result<string>.Failure($"Запись с ID {id} не найдена");
        }

        _mapper.Map(request, entity);
        await _repository.UpdateAsync(entity);

        Log.Information("Обновлена сущность {EntityType} с ID: {Id}", typeof(TEntity).Name, id);

        return Result<string>.Success("Ok");
    }

    public async Task<Result<string>> RemoveAsync(TId id)
    {
        var entity = await _repository.GetByIdAsync(id);

        if (entity == null)
        {
            Log.Warning("Сущность {EntityType} с ID: {Id} не найдена", typeof(TEntity).Name, id);
            return Result<string>.Failure($"Запись с ID {id} не найдена");
        }

        await _repository.RemoveAsync(entity);

        Log.Information("Удалена сущность {EntityType} с ID: {Id}", typeof(TEntity).Name, id);

        return Result<string>.Success("Ok");
    }
}