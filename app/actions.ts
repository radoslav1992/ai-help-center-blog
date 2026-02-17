"use server";

import { ModerationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getImageFile, getImageFiles, saveImageFile, saveImageFiles } from "@/lib/image-upload";
import { parseImageUrls, slugify } from "@/lib/utils";

async function requireUser(callbackPath: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return session.user;
}

async function requireAdmin() {
  const user = await requireUser("/admin");

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

const pathOrUrlField = z.string().refine((value) => {
  if (value.startsWith("/")) {
    return true;
  }

  return z.string().url().safeParse(value).success;
});

const optionalImageField = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  },
  pathOrUrlField.optional()
);

const optionalUrlField = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  },
  z.string().url().optional()
);

const commentSchema = z.object({
  postId: z.string().min(1),
  slug: z.string().min(1),
  body: z.string().min(6).max(1200)
});

export async function createCommentAction(formData: FormData) {
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    slug: formData.get("slug"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    redirect(`/posts/${formData.get("slug")}?comment=invalid`);
  }

  const user = await requireUser(`/posts/${parsed.data.slug}`);

  await db.comment.create({
    data: {
      postId: parsed.data.postId,
      userId: user.id,
      body: parsed.data.body,
      status: ModerationStatus.PENDING
    }
  });

  revalidatePath(`/posts/${parsed.data.slug}`);
  revalidatePath("/admin/moderation");
  redirect(`/posts/${parsed.data.slug}?comment=submitted`);
}

const reviewSchema = z.object({
  postId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(8).max(1200)
});

export async function createReviewAction(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    postId: formData.get("postId"),
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    redirect(`/posts/${formData.get("slug")}?review=invalid`);
  }

  const user = await requireUser(`/posts/${parsed.data.slug}`);

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id }
  });

  if (!subscription?.active) {
    redirect(`/subscribe?next=/posts/${parsed.data.slug}`);
  }

  await db.review.upsert({
    where: {
      postId_userId: {
        postId: parsed.data.postId,
        userId: user.id
      }
    },
    update: {
      rating: parsed.data.rating,
      body: parsed.data.body,
      status: ModerationStatus.PENDING
    },
    create: {
      postId: parsed.data.postId,
      userId: user.id,
      rating: parsed.data.rating,
      body: parsed.data.body,
      status: ModerationStatus.PENDING
    }
  });

  revalidatePath(`/posts/${parsed.data.slug}`);
  revalidatePath("/admin/moderation");
  redirect(`/posts/${parsed.data.slug}?review=submitted`);
}

export async function subscribeAction() {
  const user = await requireUser("/subscribe");

  await db.subscription.upsert({
    where: { userId: user.id },
    update: {
      active: true,
      tier: "Free Member"
    },
    create: {
      userId: user.id,
      tier: "Free Member",
      active: true
    }
  });

  revalidatePath("/subscribe");
  revalidatePath("/");
  redirect("/subscribe?status=active");
}

export async function cancelSubscriptionAction() {
  const user = await requireUser("/subscribe");

  await db.subscription.updateMany({
    where: { userId: user.id },
    data: { active: false }
  });

  revalidatePath("/subscribe");
  redirect("/subscribe?status=paused");
}

const createPostSchema = z.object({
  title: z.string().min(8).max(160),
  excerpt: z.string().min(16).max(220),
  content: z.string().min(80),
  coverImageUrl: optionalImageField,
  galleryImageUrls: z.string().max(5000).optional(),
  published: z.string().optional()
});

export async function createPostAction(formData: FormData) {
  await requireAdmin();

  const parsed = createPostSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl"),
    galleryImageUrls: formData.get("galleryImageUrls"),
    published: formData.get("published")
  });

  if (!parsed.success) {
    redirect("/admin/posts/new?error=invalid");
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  const galleryUrls = parseImageUrls(parsed.data.galleryImageUrls);
  const coverImageFile = getImageFile(formData.get("coverImageFile"));
  const galleryImageFiles = getImageFiles(formData.getAll("galleryImageFiles"));

  if (!galleryUrls.every((url) => pathOrUrlField.safeParse(url).success)) {
    redirect("/admin/posts/new?error=invalid");
  }

  let uploadedCoverImageUrl: string | null = null;
  let uploadedGalleryUrls: string[] = [];

  try {
    if (coverImageFile) {
      uploadedCoverImageUrl = await saveImageFile(coverImageFile, "articles/cover");
    }

    if (galleryImageFiles.length) {
      uploadedGalleryUrls = await saveImageFiles(galleryImageFiles, "articles/gallery");
    }
  } catch {
    redirect("/admin/posts/new?error=invalid");
  }

  const existing = await db.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
  }

  const combinedGalleryUrls = [...galleryUrls, ...uploadedGalleryUrls];

  await db.post.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: uploadedCoverImageUrl ?? parsed.data.coverImageUrl ?? null,
      galleryImageUrls: combinedGalleryUrls.length > 0 ? combinedGalleryUrls.join("\n") : null,
      published: parsed.data.published === "on"
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?status=created");
}

const settingsSchema = z.object({
  bannerText: z.string().trim().min(4).max(180),
  bannerCtaLabel: z.string().trim().min(2).max(40),
  bannerImageUrl: optionalImageField,
  bannerImageMode: z.enum(["COVER", "CONTAIN", "FILL"]),
  logoImageUrl: optionalImageField,
  buyMeACoffeeUrl: optionalUrlField,
  bannerEnabled: z.string().optional()
});

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    bannerText: formData.get("bannerText"),
    bannerCtaLabel: formData.get("bannerCtaLabel"),
    bannerImageUrl: formData.get("bannerImageUrl"),
    bannerImageMode: formData.get("bannerImageMode"),
    logoImageUrl: formData.get("logoImageUrl"),
    buyMeACoffeeUrl: formData.get("buyMeACoffeeUrl"),
    bannerEnabled: formData.get("bannerEnabled")
  });

  if (!parsed.success) {
    redirect("/admin/settings?status=invalid");
  }

  const bannerImageFile = getImageFile(formData.get("bannerImageFile"));
  const logoImageFile = getImageFile(formData.get("logoImageFile"));

  let uploadedBannerImageUrl: string | null = null;
  let uploadedLogoImageUrl: string | null = null;

  try {
    if (bannerImageFile) {
      uploadedBannerImageUrl = await saveImageFile(bannerImageFile, "branding");
    }

    if (logoImageFile) {
      uploadedLogoImageUrl = await saveImageFile(logoImageFile, "branding");
    }
  } catch {
    redirect("/admin/settings?status=invalid");
  }

  await db.siteSetting.upsert({
    where: { id: "main" },
    update: {
      bannerEnabled: parsed.data.bannerEnabled === "on",
      bannerText: parsed.data.bannerText,
      bannerCtaLabel: parsed.data.bannerCtaLabel,
      bannerImageUrl: uploadedBannerImageUrl ?? parsed.data.bannerImageUrl ?? null,
      bannerImageMode: parsed.data.bannerImageMode,
      logoImageUrl: uploadedLogoImageUrl ?? parsed.data.logoImageUrl ?? null,
      buyMeACoffeeUrl: parsed.data.buyMeACoffeeUrl ?? null
    },
    create: {
      id: "main",
      bannerEnabled: parsed.data.bannerEnabled === "on",
      bannerText: parsed.data.bannerText,
      bannerCtaLabel: parsed.data.bannerCtaLabel,
      bannerImageUrl: uploadedBannerImageUrl ?? parsed.data.bannerImageUrl ?? null,
      bannerImageMode: parsed.data.bannerImageMode,
      logoImageUrl: uploadedLogoImageUrl ?? parsed.data.logoImageUrl ?? null,
      buyMeACoffeeUrl: parsed.data.buyMeACoffeeUrl ?? null
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/subscribe");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?status=saved");
}

const togglePostSchema = z.object({
  postId: z.string().min(1),
  publish: z.string().min(1)
});

export async function togglePostPublishAction(formData: FormData) {
  await requireAdmin();

  const parsed = togglePostSchema.safeParse({
    postId: formData.get("postId"),
    publish: formData.get("publish")
  });

  if (!parsed.success) {
    redirect("/admin/posts?status=invalid");
  }

  await db.post.update({
    where: { id: parsed.data.postId },
    data: { published: parsed.data.publish === "true" }
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?status=updated");
}

const moderationSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"])
});

export async function setCommentStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = moderationSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    redirect("/admin/moderation?status=invalid");
  }

  await db.comment.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status }
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/");
  redirect("/admin/moderation?status=updated");
}

export async function setReviewStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = moderationSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    redirect("/admin/moderation?status=invalid");
  }

  await db.review.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status }
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/");
  redirect("/admin/moderation?status=updated");
}
