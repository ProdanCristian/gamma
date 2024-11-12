import { useLocale } from "next-intl";

export default function Delivery() {
  const locale = useLocale();
  return (
    <div className="max-w-[1250px] w-[90vw] mx-auto">
      <h1 className="text-3xl font-semibold mt-10">
        {locale === "ro" ? "Livrare" : "Доставка"}
      </h1>
      <div className="h-[200px]  md:h-[500px] overflow-hidden rounded-xl mt-4">
        {locale === "ro" && (
          <img
            src="/Livrare.webp"
            alt="Livrare"
            className="w-full h-full object-cover"
          />
        )}
        {locale === "ru" && (
          <img
            src="/Доставка.webp"
            alt="Доставка"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex justify-center">
        <div className="flex py-8 px-4 sm:px-6 lg:px-8 w-full md:w-[80%] xl:w-[70%]">
          <div className="mx-auto rounded-lg overflow-hidden border p-4 border-gray-200 dark:border-gray-700">
            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  {locale === "ro"
                    ? "Livrare în Chișinău"
                    : "Доставка в Кишинев"}
                </h2>
                <p>
                  {locale === "ro"
                    ? "Se efectuează în decurs 1 - 7 zile lucrătoare de la procesarea comenzii. Costul livrării pentru comanda până la 500 lei - 50 lei, pentru comenzile care depășesc 500 lei - GRATUIT."
                    : "Доставка осуществляется в течение 1 - 7 рабочих дней с момента обработки заказа. Стоимость доставки для заказов до 500 леев - 50 леев, для заказов свыше 500 леев - БЕСПЛАТНО."}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  {locale === "ro"
                    ? "Livrare în suburbii"
                    : "Доставка в пригороды"}
                </h2>
                <p>
                  {locale === "ro"
                    ? "Trușeni, Vatra, Ghidighici, Grătiești, Hulboaca, Stăuceni, Goianul Nou, Dumbrava, Durlești, Codru, Bacioi, Sangera, Bubuieci, Colonița, Tohatin, Cricova, Ciorescu, Vadul lui Vodă, Condrița, Dobrogea, Humulești - costul livrării în suburbii va fi de 60 lei. Pentru comenzile care depășesc 500 lei - GRATUIT."
                    : "Трушены, Ватра, Гидигич, Грэтишти, Хулбоака, Стауцень, Новый Гоян, Думбрава, Дурлешть, Кодру, Бачой, Сэнджера, Бубуечи, Колоница, Тохатин, Крикова, Чореску, Вадул-луй-Водэ, Кондрита, Доброджа, Хумулешть - стоимость доставки в пригороды - 60 леев. Для заказов свыше 500 леев - БЕСПЛАТНО."}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  {locale === "ro"
                    ? "Livrare în Moldova"
                    : "Доставка по Молдове"}
                </h2>
                <p>
                  {locale === "ro"
                    ? "Costul livrării prin Moldova - 60 lei. Pentru comenzile care depășesc 500 lei - GRATUIT."
                    : "Стоимость доставки по Молдове - 60 леев. Для заказов свыше 500 леев - БЕСПЛАТНО."}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  {locale === "ro" ? "Important!" : "Важно!"}
                </h2>
                <p>
                  {locale === "ro"
                    ? "Comanda se livrează numai până în centre raionale și poate dura până la 7 zile."
                    : "Заказы доставляются только до районных центров и могут занять до 7 дней."}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
