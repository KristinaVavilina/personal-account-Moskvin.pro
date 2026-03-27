using Application.DTO.KnowledgeBase.KBItem;
using Application.DTO.KnowledgeBase.QuickLink;
using Application.DTO.System;
using Application.DTO.TimeLogs.DailyReflection;
using Application.DTO.TimeLogs.Task;
using Application.DTO.TimeLogs.TaskType;
using Application.DTO.TimeLogs.TimeLog;
using Application.DTO.Users.Position;
using Application.DTO.Users.User;
using AutoMapper;
using Domain.Models.KnowledgeBase;
using Domain.Models.System;
using Domain.Models.TimeLogs;
using Domain.Models.Users;

namespace Application.Mapping;

public class ApplicationMappingProfile : Profile
{
    private static int ParseTypeId(string? value)
    {
        return int.TryParse(value, out var id) ? id : 0;
    }

    public ApplicationMappingProfile()
    {
        CreateMap<KBItemRequest, KnowledgeBaseItem>();
        CreateMap<KnowledgeBaseItem, KBItemResponse>();

        CreateMap<QuickLinkRequest, QuickLink>();
        CreateMap<QuickLink, QuickLinkResponse>();

        CreateMap<TaskTypeRequest, TaskType>();
        CreateMap<TaskType, TaskTypeResponse>();

        CreateMap<TaskRequest, Domain.Models.TimeLogs.Task>()
            .ForMember(
                dest => dest.TypeId,
                opt => opt.MapFrom(src => ParseTypeId(src.TypeId))
            )
            .ForMember(dest => dest.Type, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());

        CreateMap<Domain.Models.TimeLogs.Task, TaskResponse>()
            .ForMember(dest => dest.TypeName, opt => opt.MapFrom(src => src.Type != null ? src.Type.Name : null));

        CreateMap<TimeLogRequest, TimeLog>()
            .ForMember(dest => dest.Task, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
        CreateMap<TimeLog, TimeLogResponse>();

        CreateMap<DailyReflectionRequest, DailyReflection>()
            .ForMember(dest => dest.User, opt => opt.Ignore());
        CreateMap<DailyReflection, DailyReflectionResponse>();

        CreateMap<PositionRequest, Position>();
        CreateMap<Position, PositionResponse>();

        CreateMap<SystemSettingRequest, SystemSetting>();
        CreateMap<SystemSetting, SystemSettingResponse>();

        CreateMap<UserRequest, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.Position, opt => opt.Ignore());

        CreateMap<User, UserResponse>()
            .ForMember(dest => dest.PositionName, opt => opt.MapFrom(src => src.Position != null ? src.Position.Title : null));
    }
}

