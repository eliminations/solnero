"use client"

import * as React from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Wallet",
    href: "/",
    description: "Create and manage your private Solana wallet",
  },
  {
    title: "Forum",
    href: "/posts",
    description: "Community discussions about private transactions",
  },
  {
    title: "Documentation",
    href: "#",
    description: "Learn how to use Solnero for private transactions",
  },
]

export function Menus() {
  return (
    <NavigationMenu viewport={true}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={cn(navigationMenuTriggerStyle(), "bg-transparent text-xs")}
          >
            <Link href="/">Wallet</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={cn(navigationMenuTriggerStyle(), "bg-transparent text-xs")}
          >
            <Link href="/posts">Forum</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-xs hover:bg-white/5 data-[state=open]:bg-white/10">
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-4 glass-dark border-white/10">
            <ul className="grid gap-3 md:grid-cols-3 w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link 
          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-accent-foreground focus:bg-white/5 focus:text-accent-foreground" 
          href={href}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground/70 mt-2">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
