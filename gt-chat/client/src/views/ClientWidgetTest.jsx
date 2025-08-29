import { ClientChat } from 'client-chat-widget';
import 'client-chat-widget/styles/ClientChat.css'; // nuevo path exportado

export default function ClientWidgetTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Probando el Widget</h1>
      <ClientChat
        clientId="mariafernanda@.com"
        clientName="Fernanda Maria Vergara Sofia"
        systemCode="avaluos"
      />
    </div>
  );
}
