// @ts-nocheck
import React from 'react'

export const Bold = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const Italic = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
  </svg>
)
export const Underlined = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
  </svg>
)
export const Strikethrough = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
  </svg>
)
export const Size = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" />
  </svg>
)
export const ColorFill = ({ currentColor, ...props }: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15a1.49 1.49 0 000 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z" />
    <path fill={currentColor} d="M0 20h24v4H0z" />
  </svg>
)
export const ColorText = ({ currentColor, ...props }: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path fill={currentColor} d="M0 20h24v4H0z" />
    <path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z" />
  </svg>
)
export const ClearFormat = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z" />
  </svg>
)
export const AlignLeft = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const AlignCenter = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const AlignRight = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const ListBulleted = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
    <path fill="none" d="M0 0h24v24H0V0z" />
  </svg>
)
export const ListNumbered = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const Quote = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const InsertLink = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
  </svg>
)
export const RemoveLink = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11A4.991 4.991 0 002 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z" />
    <path fill="none" d="M0 24V0" />
  </svg>
)
export const InsertPhoto = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const InsertEmbed = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z" />
  </svg>
)
export const IndentIncrease = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const IndentDecrease = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const Fullscreen = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
)
export const FullscreenExit = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
)
export const Undo = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
)
export const Redo = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16a8.002 8.002 0 017.6-5.5c1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
  </svg>
)
export const ViewSource = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
  </svg>
)
export const ArrowDropdown = (props: Record<string, any>) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path d="M7 10l5 5 5-5z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const InsertNewLine = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
  </svg>
)
export const InsertHorizontalRule = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M15 21v-2h2v2h-2zm-4 0v-2h2v2h-2zm-4 0v-2h2v2H7zm8-4v-2h2v2h-2zm-4 0v-2h2v2h-2zm-4 0v-2h2v2H7zm8-8V7h2v2h-2zm-4 0V7h2v2h-2zM7 9V7h2v2H7zm8-4V3h2v2h-2zm-4 0V3h2v2h-2zM7 5V3h2v2H7zm-6 8v-2h22v2H1z" />
  </svg>
)
export const CloudUpload = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
  </svg>
)
export const Delete = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const Info = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
)
export const Edit = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)
export const OpenInNewWindow = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
  </svg>
)
export const Lock = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
)
export const LockOpen = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
  </svg>
)
export const AttachFile = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
  </svg>
)
export const Table = (props: Record<string, any>) => (
  <svg width={24} height={24} {...props}>
    <g>
      <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
    </g>
  </svg>
)
