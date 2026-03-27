import Link from "next/link";

export default function DeliveryPage() {
  return (
    <div className="bg-surface">
      {/* Header */}
      <section className="bg-surface-low px-8 lg:px-24 pt-8 pb-16">
        <div className="max-w-screen-2xl mx-auto">
          <nav className="text-sm text-on-surface-variant mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-on-surface">Доставка и оплата</span>
          </nav>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-headline)] text-[#451A03]">
              Доставка и оплата
            </h1>
            <p className="text-on-surface-variant font-medium">
              Простые и понятные способы получения вашего заказа
            </p>
          </div>
        </div>
      </section>

      {/* Delivery methods */}
      <section className="py-16 px-8 lg:px-24 bg-surface-low">
        <div className="max-w-screen-2xl mx-auto space-y-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Самовывоз */}
            <div className="bg-surface-lowest p-10 rounded-xl warm-shadow flex flex-col h-full border-t-4 border-primary/20">
              <span className="material-symbols-outlined text-primary-container text-5xl mb-6">store</span>
              <h3 className="text-xl font-bold font-[family-name:var(--font-headline)] text-[#451A03] mb-4">Самовывоз</h3>
              <p className="text-on-surface-variant mb-6 flex-grow">
                Удобный способ забрать деталь лично в нашем главном офисе.
              </p>
              <div className="pt-6 border-t border-surface-high space-y-2">
                <p className="font-bold text-primary">Бесплатно</p>
                <p className="text-sm text-on-surface-variant">г. Бишкек, ул. Льва Толстого, 126</p>
              </div>
            </div>

            {/* Курьер */}
            <div className="bg-surface-lowest p-10 rounded-xl warm-shadow flex flex-col h-full border-t-4 border-primary">
              <span className="material-symbols-outlined text-primary-container text-5xl mb-6">moped</span>
              <h3 className="text-xl font-bold font-[family-name:var(--font-headline)] text-[#451A03] mb-4">Курьер по Бишкеку</h3>
              <p className="text-on-surface-variant mb-6 flex-grow">
                Быстрая доставка до двери в пределах черты города.
              </p>
              <div className="pt-6 border-t border-surface-high space-y-2">
                <p className="font-bold text-primary">300 сом</p>
                <p className="text-sm text-on-surface-variant">В течение 1-2 рабочих дней</p>
              </div>
            </div>

            {/* Доставка по КР */}
            <div className="bg-surface-lowest p-10 rounded-xl warm-shadow flex flex-col h-full border-t-4 border-primary/20">
              <span className="material-symbols-outlined text-primary-container text-5xl mb-6">local_shipping</span>
              <h3 className="text-xl font-bold font-[family-name:var(--font-headline)] text-[#451A03] mb-4">Доставка по КР</h3>
              <p className="text-on-surface-variant mb-6 flex-grow">
                Отправка в любую точку страны через партнерские службы.
              </p>
              <div className="pt-6 border-t border-surface-high space-y-2">
                <p className="font-bold text-primary">от 500 сом</p>
                <p className="text-sm text-on-surface-variant">Региональные службы (2-5 дней)</p>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="pt-12">
            <h3 className="text-2xl font-bold font-[family-name:var(--font-headline)] text-center text-[#451A03] mb-8">
              Способы оплаты
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="px-8 py-6 bg-surface-mid rounded-xl flex items-center space-x-4">
                <span className="material-symbols-outlined text-primary">payments</span>
                <span className="font-bold text-on-surface-variant">Наличные</span>
              </div>
              <div className="px-8 py-6 bg-surface-mid rounded-xl flex items-center space-x-4">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <span className="font-bold text-on-surface-variant">Элсом</span>
              </div>
              <div className="px-8 py-6 bg-surface-mid rounded-xl flex items-center space-x-4">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                <span className="font-bold text-on-surface-variant">Банковская карта</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-8 lg:px-24 bg-surface-mid">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-headline)] text-center text-[#451A03]">
            Часто задаваемые вопросы
          </h2>
          <div className="space-y-4">
            <details className="group bg-surface-lowest rounded-xl warm-shadow transition-all" open>
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-[#451A03]">Предоставляете ли вы гарантию на запчасти?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="faq-content">
                <div>
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                    Да, мы предоставляем официальную гарантию на все приобретенные запчасти сроком от 3 до 12 месяцев в зависимости от производителя и типа детали.
                  </div>
                </div>
              </div>
            </details>

            <details className="group bg-surface-lowest rounded-xl warm-shadow transition-all">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-[#451A03]">Как проверить наличие детали на складе?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="faq-content">
                <div>
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                    Вы можете воспользоваться поиском по VIN-коду на нашем сайте или связаться с менеджером по телефону для оперативной проверки актуальных остатков.
                  </div>
                </div>
              </div>
            </details>

            <details className="group bg-surface-lowest rounded-xl warm-shadow transition-all">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                <span className="font-bold text-[#451A03]">Возможен ли возврат товара?</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="faq-content">
                <div>
                  <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                    Возврат возможен в течение 14 дней с момента покупки при условии сохранения товарного вида, целостности упаковки и наличия чека.
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
