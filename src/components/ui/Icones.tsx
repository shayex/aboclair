import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

function Base({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconeCoche = (p: Props) => (
  <Base strokeWidth={3} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Base>
)
export const IconePlus = (p: Props) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)
export const IconeLoupe = (p: Props) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Base>
)
export const IconeChevron = (p: Props) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
)
export const IconeCroix = (p: Props) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)
export const IconeCalendrier = (p: Props) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Base>
)
export const IconeLien = (p: Props) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Base>
)
export const IconeBouclier = (p: Props) => (
  <Base {...p}>
    <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.3-7.5 9.5-4.4-1.2-7.5-4.9-7.5-9.5V6L12 3z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </Base>
)
export const IconePartage = (p: Props) => (
  <Base {...p}>
    <path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" />
    <path d="M8 11H6.5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16" />
  </Base>
)
