export async function generateMetadata({ params }) {
  return {
    title:
      params.locale === "ru"
        ? "Гарантийный Сертификат"
        : "Certificat de Garanție",
  };
}

export default function Warranty() {
  return (
    <div className="flex justify-center">
      <div className="flex py-8 px-4 sm:px-6 lg:px-8 w-full md:w-[80%] xl:w-[70%]">
        <div className="mx-auto rounded-lg overflow-hidden border p-4 border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-center">GARANȚIE</h1>
          <div className="p-6 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Dispoziții Generale
              </h2>
              <div className="space-y-2">
                <p>
                  1. Prezentul certificat de garanție este valabil pentru toate
                  produsele comercializate de compania Gamma, în conformitate cu
                  legislația în vigoare.
                </p>
                <p>
                  2. Perioada de garanție începe de la data achiziționării
                  produsului și este specificată individual pentru fiecare
                  produs în parte.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Condiții de Acordare a Garanției
              </h2>
              <div className="space-y-4">
                <div className="pl-4">
                  <p className="font-medium">
                    1. Garanția acoperă defecțiunile de fabricație și asigură:
                  </p>
                  <ul className="list-disc pl-8 mt-2">
                    <li>Reparația gratuită a produsului</li>
                    <li>
                      Înlocuirea produsului cu unul similar, în cazul în care
                      reparația nu este posibilă
                    </li>
                  </ul>
                </div>

                <div className="pl-4">
                  <p className="font-medium">
                    2. Pentru a beneficia de garanție, clientul trebuie să
                    prezinte:
                  </p>
                  <ul className="list-disc pl-8 mt-2">
                    <li>Bonul fiscal sau factura în original</li>
                    <li>
                      Certificatul de garanție completat corect și integral
                    </li>
                    <li>Produsul în ambalajul original</li>
                    <li>
                      Toate accesoriile cu care produsul a fost livrat inițial
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Obligațiile Companiei Gamma
              </h2>
              <div className="pl-4 space-y-4">
                <div>
                  <p className="font-medium">1. Gamma se obligă să:</p>
                  <ul className="list-disc pl-8 mt-2">
                    <li>
                      Repare sau să înlocuiască produsul defect în termenul
                      legal
                    </li>
                    <li>
                      Asigure piesele de schimb necesare pe toată perioada de
                      garanție
                    </li>
                    <li>
                      Ofere consultanță tehnică pentru utilizarea corectă a
                      produsului
                    </li>
                  </ul>
                </div>
                <p>
                  2. Timpul de rezolvare a reclamațiilor este de maxim 15 zile
                  lucrătoare de la data prezentării produsului.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Excluderi din Garanție
              </h2>
              <p className="mb-2">
                Garanția nu acoperă defecțiunile cauzate de:
              </p>
              <ul className="list-decimal pl-8">
                <li>Utilizarea necorespunzătoare a produsului</li>
                <li>Accidente, lovituri, șocuri electrice</li>
                <li>Reparații efectuate de persoane neautorizate</li>
                <li>Modificări aduse produsului de către utilizator</li>
                <li>Uzura normală a produsului</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
