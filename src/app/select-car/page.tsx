"use client";

import { useState } from "react";
import Link from "next/link";
import { carBrands, getModelsByBrand } from "@/lib/car-data";
import { products } from "@/lib/mock-data";

export default function SelectCarPage() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>("");

  const models = selectedBrand ? getModelsByBrand(selectedBrand) : [];
  const matchingProducts = selectedBrandName
    ? products.filter(
        (p) => p.car_brand.toLowerCase() === selectedBrandName.toLowerCase()
      )
    : [];

  function handleBrandSelect(brandId: string, brandName: string) {
    setSelectedBrand(brandId);
    setSelectedBrandName(brandName);
    setSelectedModel(null);
    setSelectedModelName("");
  }

  function handleModelSelect(modelId: string, modelName: string) {
    setSelectedModel(modelId);
    setSelectedModelName(modelName);
  }

  function handleReset() {
    setSelectedBrand(null);
    setSelectedBrandName("");
    setSelectedModel(null);
    setSelectedModelName("");
  }

  return (
    <div className="min-h-screen bg-surface-low">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#451A03] to-[#5d260a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-outline mb-4">
            <Link href="/" className="hover:text-primary-container transition-colors">
              Главная
            </Link>
            <span>/</span>
            <span className="text-white">Подбор по авто</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Подбор по <span className="text-primary-container">автомобилю</span>
          </h1>
          <p className="text-outline-variant mt-2">
            Выберите марку и модель, чтобы найти подходящие запчасти
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress steps */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !selectedBrand
                ? "bg-primary-container text-on-surface"
                : "bg-[#451A03] text-white"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Марка
          </div>
          <div className="h-px flex-1 bg-outline-variant" />
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedBrand && !selectedModel
                ? "bg-primary-container text-on-surface"
                : selectedModel
                ? "bg-[#451A03] text-white"
                : "bg-surface-high text-on-surface-variant"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Модель
          </div>
          <div className="h-px flex-1 bg-outline-variant" />
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedModel
                ? "bg-primary-container text-on-surface"
                : "bg-surface-high text-on-surface-variant"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              3
            </span>
            Запчасти
          </div>
        </div>

        {/* Selected info + reset */}
        {selectedBrand && (
          <div className="flex items-center gap-3 mb-6 animate-[fadeIn_0.3s_ease-in-out]">
            <button
              onClick={handleReset}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors underline"
            >
              Начать заново
            </button>
            <span className="text-outline-variant">|</span>
            <span className="text-sm font-medium text-on-surface-variant">
              {selectedBrandName}
              {selectedModelName && ` → ${selectedModelName}`}
            </span>
          </div>
        )}

        {/* Step 1: Brand selection */}
        {!selectedBrand && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Выберите марку автомобиля
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {carBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand.id, brand.name)}
                  className="bg-white border border-outline-variant/30 rounded-xl p-5 text-center font-semibold text-on-surface transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/40"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-surface-low rounded-lg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0h4m-4 0H9m4 0a1 1 0 01-1 1H6a1 1 0 01-1-1m14 0V9a1 1 0 00-1-1h-2l-3-4H8"
                      />
                    </svg>
                  </div>
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Model selection */}
        {selectedBrand && !selectedModel && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Выберите модель{" "}
              <span className="text-primary">{selectedBrandName}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id, model.name)}
                  className="bg-white border border-outline-variant/30 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/40"
                >
                  <div className="font-semibold text-on-surface">
                    {model.name}
                  </div>
                  <div className="text-sm text-on-surface-variant mt-1">
                    {model.years}
                  </div>
                </button>
              ))}
            </div>
            {models.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">
                Модели для этой марки пока не добавлены
              </div>
            )}
          </div>
        )}

        {/* Step 3: Matching products */}
        {selectedModel && (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Запчасти для{" "}
              <span className="text-primary">
                {selectedBrandName} {selectedModelName}
              </span>
            </h2>

            {matchingProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-white border border-outline-variant/30 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-container"
                  >
                    <div className="w-full h-40 bg-surface-mid rounded-lg mb-4 flex items-center justify-center text-outline">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-xs text-on-surface-variant mb-1">
                      {product.article}
                    </div>
                    <div className="font-semibold text-on-surface mb-1">
                      {product.name}
                    </div>
                    <div className="text-sm text-on-surface-variant mb-3">
                      {product.brand} · {product.car_brand} {product.car_model}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-on-surface">
                        {product.price.toLocaleString()} сом
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.quantity > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.quantity > 0 ? "В наличии" : "Под заказ"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-outline-variant/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-outline-variant mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-on-surface-variant text-lg mb-2">
                  Запчасти не найдены
                </p>
                <p className="text-outline text-sm mb-6">
                  Попробуйте выбрать другую модель или свяжитесь с нами
                </p>
                <Link
                  href="/contacts"
                  className="inline-block bg-primary-container text-on-surface font-semibold px-6 py-2 rounded-lg hover:bg-primary-container/80 transition-colors"
                >
                  Связаться с нами
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
