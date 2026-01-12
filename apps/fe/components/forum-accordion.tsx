"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  authorUsername: string
  createdAt: string
  replies: number
  views: number
}

interface ForumAccordionProps {
  posts: ForumPost[]
}

export function ForumAccordion({ posts }: ForumAccordionProps) {
  const items = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: (
      <div
        key={post.id}
        className="grid pb-8 lg:pt-4 relative gap-6 lg:gap-8 md:grid-cols-2"
      >
        <div>
          <p className="text-xs leading-relaxed">{post.content}</p>
        </div>
        <div className="space-y-3 pr-6 text-[8px]">
          <h2 className="font-semibold uppercase">Related Topics</h2>
          <p className="text-muted-foreground">
            Zero-Knowledge Proofs, Privacy Transactions, Solana Blockchain,
            Cryptography, Decentralized Finance, Security Best Practices
          </p>
        </div>
        <div className="absolute bottom-0 right-0">
          <Button
            asChild
            className="rounded-r-none rounded-b-none h-12 text-sm cursor-pointer px-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-0 shine"
          >
            <Link href={`/posts/${post.id}`}>
              View Full Post
            </Link>
          </Button>
        </div>
      </div>
    ),
  }))

  return (
    <div className="w-full">
      <Accordion
        type="single"
        collapsible
        className="w-full border border-white/10 rounded-xl glass-dark overflow-hidden"
        defaultValue={items[0]?.id}
      >
        {items.map((item) => (
          <AccordionItem value={item.id} key={item.id} className="border-b border-white/10 last:border-0">
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-5 px-6 font-medium transition-all hover:no-underline cursor-pointer group hover:bg-white/5">
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative h-5 w-5">
                    <Plus className="h-5 w-5 shrink-0 transition-all duration-500 group-data-[state=open]:opacity-0 group-data-[state=closed]:opacity-100 group-data-[state=open]:rotate-180 text-primary" />
                    <Minus className="absolute inset-0 h-5 w-5 opacity-0 transition-all duration-500 group-data-[state=open]:opacity-100 group-data-[state=open]:rotate-0 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                </div>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>

            <AccordionContent className="p-0 px-6 pb-6">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
