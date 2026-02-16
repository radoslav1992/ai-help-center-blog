import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@aihelpcenter.dev" },
    update: {},
    create: {
      name: "AI Help Center Admin",
      email: "admin@aihelpcenter.dev",
      password: adminPassword,
      role: Role.ADMIN,
      subscription: {
        create: {
          tier: "Free Member",
          active: true
        }
      }
    }
  });

  await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      bannerEnabled: true,
      bannerText: "Free reviews are open. Share your feedback and support AI Help Center.",
      bannerCtaLabel: "Buy me a coffee",
      buyMeACoffeeUrl: "https://buymeacoffee.com/aihelpcenter",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"
    }
  });

  const posts = [
    {
      title: "How To Build Reliable AI Workflows",
      slug: "how-to-build-reliable-ai-workflows",
      excerpt:
        "A practical guide to building AI systems that are measurable, safe, and useful in production.",
      content:
        "Reliable AI systems are designed, not guessed into existence.\\n\\nStart with a narrow use case, define measurable outcomes, and add human fallback paths where model confidence drops.\\n\\nThen add monitoring for quality drift, latency, and cost. Treat prompts and evaluations like code with versioning and reviews.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      published: true
    },
    {
      title: "Prompt Engineering Patterns That Actually Scale",
      slug: "prompt-engineering-patterns-that-actually-scale",
      excerpt:
        "Stop shipping one-off prompts. Use reusable structures and evaluation loops for repeatable quality.",
      content:
        "Prompt quality degrades as products grow unless you enforce structure.\\n\\nUse role/context/task/output constraints consistently. Back that with test suites for known edge cases and expected behavior.\\n\\nScale comes from process, not prompt magic.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1677756119517-756a188d2d94?auto=format&fit=crop&w=1200&q=80",
      galleryImageUrls:
        "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?auto=format&fit=crop&w=1200&q=80",
      published: true
    }
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
