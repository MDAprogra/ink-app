"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleArticleStatus(articleId: number, currentStatus: boolean, stockTotal: number) {
  
  // RÈGLE MÉTIER : On empêche la désactivation s'il reste du stock
  if (currentStatus === true && stockTotal > 0) {
    throw new Error("Impossible d'archiver un article qui a encore du stock.");
  }

  await db.catalogue.update({
    where: { id: articleId },
    data: { actif: !currentStatus },
  });

  revalidatePath(`/catalogue/${articleId}`);
  revalidatePath("/catalogue");
}