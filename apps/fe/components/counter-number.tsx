"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface CounterNumberProps {
  value: number
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  prefix?: string
  suffix?: string
  currency?: string
  decimalPlaces?: number
  className?: string
  duration?: number
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
  "2xl": "text-4xl",
}

export function CounterNumber({
  value,
  size = "md",
  prefix = "",
  suffix = "",
  currency = "",
  decimalPlaces = 0,
  className,
  duration = 2000,
}: CounterNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const startValue = 0
    const endValue = value
    const startTime = Date.now()

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValue + (endValue - startValue) * easeOut
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
      }
    }

    animate()
  }, [isVisible, value, duration])

  const formatValue = (num: number) => {
    if (currency) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(num)
    }

    return num.toFixed(decimalPlaces)
  }

  return (
    <div ref={ref} className={cn(sizeClasses[size], className)}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </div>
  )
}
