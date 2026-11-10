import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
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

export function ResetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 9.5A8 8 0 1 1 4 14" />
      <path d="M4.5 4.5v5h5" />
    </IconBase>
  )
}

export function ZoomInIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" />
    </IconBase>
  )
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21M7.5 10.5h6" />
    </IconBase>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  )
}

export function SignalOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12h3l2.2-5 3.1 10 2.4-6.5 1.7 3.5H21" />
      <path d="M4 4l16 16" />
    </IconBase>
  )
}

export function PendingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" strokeDasharray="2.5 3" />
      <path d="M12 7.5V12l3 2" />
    </IconBase>
  )
}

export function TableIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
      <path d="M3.5 9.5h17M9.5 9.5v10M15 9.5v10" />
    </IconBase>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10.5v6M12 7.5v.5" />
    </IconBase>
  )
}
