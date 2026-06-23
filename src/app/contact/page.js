import PagePlaceholder from "@/components/PagePlaceholder";
import { getSiteMeta } from "@/lib/api";

export const metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const meta = await getSiteMeta();
  const name = meta.siteTitle || "OddsCheck";
  const { email, phone, address } = meta;
  return (
    <PagePlaceholder title="Contact us" crumb="Contact" lead={`Get in touch with the ${name} team.`}>
      <div className="card" style={{ padding: 28 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 15 }}>
          {email && (
            <li><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a></li>
          )}
          {phone && (
            <li><strong>Phone:</strong> <a href={`tel:${String(phone).replace(/\s+/g, "")}`}>{phone}</a></li>
          )}
          {address && <li><strong>Address:</strong> {address}</li>}
          {!email && !phone && !address && (
            <li className="mute">Reach us through the social channels linked in the footer.</li>
          )}
        </ul>
      </div>
    </PagePlaceholder>
  );
}
