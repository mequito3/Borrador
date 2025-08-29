interface ClientDetailsProps {
  clientName?: string;
  email?: string;
  company?: string;
  system?: string;
  clientId?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

const ClientDetails = ({
  clientName = "-",
  email = "-",
  company = "-",
  system = "-",
  clientId = "-",
  phone = "-",
  address = "-",
  createdAt = "-"
}: ClientDetailsProps) => (
  <div className="client-details">
    <h4>Datos básicos</h4>
    <p><strong>ID:</strong> {clientId}</p>
    <p><strong>Nombre:</strong> {clientName}</p>
    <p><strong>Correo:</strong> {email}</p>
    <p><strong>Teléfono:</strong> {phone}</p>
    <p><strong>Empresa:</strong> {company}</p>
    <p><strong>Sistema:</strong> {system}</p>
    <p><strong>Dirección:</strong> {address}</p>
    <p><strong>Cliente desde:</strong> {createdAt}</p>
  </div>
);

export default ClientDetails;
