export async function generateMetadata({ params }) {
  return {
    title: params.locale === "ru" ? "Обмен и Возврат" : "Schimb și Returnare",
  };
}

export default function ConsumerRights() {
  return (
    <div className="flex justify-center">
      <div className="flex py-8 px-4 sm:px-6 lg:px-8 w-full md:w-[80%] xl:w-[70%]">
        <div className="mx-auto rounded-lg overflow-hidden border p-4 border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-center">
            Drepturile Consumatorului Gamma
          </h1>
          <div className="p-6 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Produse fără defecte
              </h2>
              <p>
                Puteți preschimba produsul cu unul similar sau de o calitate mai
                bună (cu achitarea diferenței de preț), dacă nu-l puteți utiliza
                conform destinației.
              </p>
              <p>
                Dacă produsul nu poate fi schimbat, aveți dreptul să solicitați
                restituirea banilor.
              </p>
              <p>
                Termenul pentru înlocuirea produsului de calitate
                corespunzătoare este de 14 zile calendaristice (fără a include
                data cumpărării).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Produse cu defecte</h2>
              <p>
                Aveți dreptul să solicitați repararea gratuită a produsului.
              </p>
              <p>Puteți cere înlocuirea cu un produs similar de calitate.</p>
              <p>Puteți solicita returnarea banilor achitați.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Cumpărături online cu livrare la domiciliu
              </h2>
              <p>Dreptul de a anula și returna comanda în termen de 14 zile.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <p>
                Pentru orice reclamații sau informații suplimentare, vă rugăm să
                contactați serviciul clienți Gamma!
              </p>
              <p className="font-medium">
                *Notă: Vă rugăm să păstrați bonul fiscal pentru orice solicitare
                de retur sau schimb.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
