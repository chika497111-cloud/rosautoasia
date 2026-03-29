"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { addReview, getProductReviews, type Review } from "@/lib/reviews";

function StarRating({
  rating,
  interactive = false,
  onRate,
  size = "text-xl",
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? star <= (hovered || rating) : star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`${size} transition-colors ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            }`}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRate?.(star)}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                color: filled ? "#f97316" : "#d1d5db",
              }}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-surface-lowest rounded-xl p-6 warm-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-on-surface">{review.userName}</p>
          <p className="text-xs text-on-surface-variant">{formatDate(review.createdAt)}</p>
        </div>
        <StarRating rating={review.rating} size="text-lg" />
      </div>
      <p className="text-on-surface-variant leading-relaxed">{review.text}</p>
    </div>
  );
}

export function ReviewSection({ productId }: { productId: string }) {
  const { user, orders } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formText, setFormText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if user has purchased this product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasPurchased = user && orders.some((order) =>
    order.items?.some((item: any) => item.id === productId || item.productId === productId)
  );

  // Check if user already reviewed this product
  const alreadyReviewed = user && reviews.some((r) => r.userId === user.id);

  const loadReviews = useCallback(async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Войдите в аккаунт, чтобы оставить отзыв");
      return;
    }
    if (formRating === 0) {
      setError("Поставьте оценку");
      return;
    }
    if (!formText.trim()) {
      setError("Напишите текст отзыва");
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await addReview(productId, user.id, user.name, formRating, formText);
      setReviews((prev) => [newReview, ...prev]);
      setFormRating(0);
      setFormText("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при отправке отзыва");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-on-surface font-[family-name:var(--font-headline)]">
              {averageRating}
            </span>
            <StarRating rating={Math.round(averageRating)} size="text-xl" />
          </div>
          <span className="text-on-surface-variant">
            {reviews.length}{" "}
            {reviews.length === 1
              ? "отзыв"
              : reviews.length < 5
                ? "отзыва"
                : "отзывов"}
          </span>
        </div>
      )}

      {/* Write review button — only for buyers who haven't reviewed yet */}
      {user && hasPurchased && !alreadyReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="cta-gradient text-on-primary font-bold px-6 py-3 rounded-full mb-6 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
          Написать отзыв
        </button>
      )}

      {user && alreadyReviewed && (
        <p className="text-on-surface-variant text-sm mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
          Вы уже оставили отзыв на этот товар
        </p>
      )}

      {user && !hasPurchased && (
        <p className="text-on-surface-variant text-sm mb-6">
          Отзыв можно оставить только после покупки этого товара
        </p>
      )}

      {!user && (
        <p className="text-on-surface-variant text-sm mb-6">
          <a href="/login" className="text-primary font-bold hover:underline">
            Войдите
          </a>{" "}
          в аккаунт, чтобы оставить отзыв
        </p>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface-lowest rounded-xl p-6 warm-shadow mb-6 space-y-4"
        >
          <h3 className="font-[family-name:var(--font-headline)] font-bold text-lg text-on-surface">
            Ваш отзыв
          </h3>

          <div>
            <p className="text-sm text-on-surface-variant mb-2">Оценка</p>
            <StarRating
              rating={formRating}
              interactive
              onRate={setFormRating}
              size="text-3xl"
            />
          </div>

          <div>
            <label className="text-sm text-on-surface-variant mb-2 block" htmlFor="review-text">
              Текст отзыва
            </label>
            <textarea
              id="review-text"
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="Расскажите о своём опыте использования..."
              rows={4}
              className="w-full bg-surface-mid rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-error text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="cta-gradient text-on-primary font-bold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? "Отправка..." : "Отправить отзыв"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
                setFormRating(0);
                setFormText("");
              }}
              className="px-6 py-3 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-mid transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-on-surface-variant text-center py-12">
          <span className="material-symbols-outlined text-4xl mb-4 block text-outline-variant">
            rate_review
          </span>
          <p className="text-lg font-medium">Пока нет отзывов. Будьте первым!</p>
        </div>
      )}
    </div>
  );
}
