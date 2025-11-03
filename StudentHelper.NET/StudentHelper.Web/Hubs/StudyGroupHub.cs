using Microsoft.AspNetCore.SignalR;

namespace StudentHelper.Web.Hubs;

public class StudyGroupHub : Hub
{
    public async Task JoinGroup(string groupId, string userName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        await Clients.Group(groupId).SendAsync("UserJoinedGroup", userName);
    }

    public async Task LeaveGroup(string groupId, string userName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        await Clients.Group(groupId).SendAsync("UserLeftGroup", userName);
    }

    public async Task SendGroupMessage(string groupId, string userName, string message)
    {
        await Clients.Group(groupId).SendAsync("ReceiveGroupMessage", userName, message, DateTime.UtcNow);
    }

    public async Task ShareProgress(string groupId, string userName, string progress)
    {
        await Clients.Group(groupId).SendAsync("ProgressShared", userName, progress);
    }
}
