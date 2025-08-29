using Microsoft.AspNetCore.SignalR;

namespace server.Hubs;

public class ChatHub : Hub
{


    public async Task JoinChat(int chatSessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, chatSessionId.ToString());
    }
    public async Task SendMessage(int chatSessionId, string sender, string content)
    {
        // ✅ quitar "chat-" del grupo
        await Clients.Group(chatSessionId.ToString())
            .SendAsync("ReceiveMessage", chatSessionId, sender, content, DateTime.UtcNow);
    }

    public override async Task OnConnectedAsync()
    {
        var chatSessionId = Context.GetHttpContext()?.Request.Query["chatSessionId"].ToString();
        if (!string.IsNullOrEmpty(chatSessionId))
        {
            // ✅ quitar "chat-"
            await Groups.AddToGroupAsync(Context.ConnectionId, chatSessionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var chatSessionId = Context.GetHttpContext()?.Request.Query["chatSessionId"].ToString();
        if (!string.IsNullOrEmpty(chatSessionId))
        {
            // ✅ quitar "chat-"
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatSessionId);
        }

        await base.OnDisconnectedAsync(exception);
    }



}
