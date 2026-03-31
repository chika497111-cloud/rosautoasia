import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from "firebase/firestore";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

/**
 * Add a review for a product. Requires authenticated user info.
 */
export async function addReview(
  productId: string,
  userId: string,
  userName: string,
  rating: number,
  text: string
): Promise<Review> {
  if (rating < 1 || rating > 5) throw new Error("Рейтинг должен быть от 1 до 5");
  if (!text.trim()) throw new Error("Текст отзыва не может быть пустым");

  const docData = {
    productId,
    userId,
    userName,
    rating,
    text: text.trim(),
    createdAt: Timestamp.now(),
  };

  const ref = await addDoc(collection(db, "reviews"), docData);

  return {
    id: ref.id,
    productId,
    userId,
    userName,
    rating,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get all reviews for a product, sorted newest first.
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
    firestoreLimit(50),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt;
    const createdAt =
      ts && typeof ts.toDate === "function"
        ? ts.toDate().toISOString()
        : typeof ts === "string"
          ? ts
          : new Date().toISOString();

    return {
      id: d.id,
      productId: data.productId ?? "",
      userId: data.userId ?? "",
      userName: data.userName ?? "",
      rating: data.rating ?? 5,
      text: data.text ?? "",
      createdAt,
    };
  });
}

/**
 * Get average rating for a product. Returns 0 if no reviews.
 */
export async function getAverageRating(
  productId: string
): Promise<{ average: number; count: number }> {
  const reviews = await getProductReviews(productId);
  if (reviews.length === 0) return { average: 0, count: 0 };

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
