using AutoMapper;
using Applicatiion.Interfaces.Services;
using Domain.Interfaces.Repositories;
using Domain.Errors;

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

    public async Task<Result<string>> AddAsync(TRequest request)
    {
        try
        {
            var entity = _mapper.Map<TEntity>(request);
            await _repository.AddAsync(entity);
            return Result<string>.Success("Ok");
        }
        catch (AutoMapperMappingException e)
        {
            return Result<string>.Failure($"Ошибка преобразования данных: {e.Message}");
        }
        catch (Exception e)
        {
            return Result<string>.Failure($"Не удалось создать запись: {e.Message}");
        }
    }

    public async Task<Result<TResponse?>> GetByIdAsync(TId id)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(id);
            var response = _mapper.Map<TResponse>(entity);
            return Result<TResponse?>.Success(response);
        }
        catch (AutoMapperMappingException e)
        {
            return Result<TResponse?>.Failure($"Ошибка преобразования данных: {e.Message}");
        }
        catch (Exception e)
        {
            return Result<TResponse?>.Failure($"Не удалось найти запись: {e.Message}");
        }
    }

    public async Task<Result<IEnumerable<TResponse>>> GetAllAsync()
    {
        try
        {
            var entities = await _repository.GetAllAsync();
            var response = _mapper.Map<IEnumerable<TResponse>>(entities);
            return Result<IEnumerable<TResponse>>.Success(response);
        }
        catch (AutoMapperMappingException e)
        {
            return Result<IEnumerable<TResponse>>.Failure($"Ошибка преобразования данных: {e.Message}");
        }
        catch (Exception e)
        {
            return Result<IEnumerable<TResponse>>.Failure($"Не удалось найти записи: {e.Message}");
        }
    }

    public async Task<Result<string>> UpdateAsync(TId id, TRequest request)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException("Entity not found");

            _mapper.Map(request, entity);

            await _repository.UpdateAsync(entity);
            return Result<string>.Success("Ok");
        }
        catch (AutoMapperMappingException e)
        {
            return Result<string>.Failure($"Ошибка преобразования данных: {e.Message}");
        }
        catch (Exception e)
        {
            return Result<string>.Failure($"Не удалось обновить запись: {e.Message}");
        }
    }

    public async Task<Result<string>> RemoveAsync(TId id)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) throw new KeyNotFoundException("Entity not found");
            await _repository.RemoveAsync(entity);
            return Result<string>.Success("Ok");
        }
        catch (Exception e)
        {
            return Result<string>.Failure($"Не удалось удалить запись: {e.Message}");
        }
    }
}