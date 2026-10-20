import { services } from "@/data/servicesData";

export default function SelectVille({ service, type, onChange }) {
  // 1️⃣ Récupérer la catégorie et le sous-service
  const category = services.find((s) => s.category === service);
  if (!category) return null;

  const sub = category.subservices.find((s) => s.slug === type);
  if (!sub) return null;

  // 2️⃣ Extraire les départements et leurs villes
  const departements = Object.entries(sub.villes); // [['herault', [...]], ['aude', [...]], ...]

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {departements.map(([dept, villes]) => (
        <div key={dept} style={{ marginBottom: "20px" }}>
          <h3>{dept.toUpperCase()}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {villes.map((v) => (
              <button
                key={v.name}
                onClick={() => onChange(v.name)}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background: "#eee",
                }}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
