import * as React from 'react'
type Props = {
  readonly className?: string
  readonly size: number
  readonly color: string
}

const PowerButtonIcon = ({ className, size, color }: Props) => {
  return (
    <svg
      className={className}
      width={`${size}px`}
      height={`${size}px`}
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      viewBox="0 0 24 24"
    >
      <title>power-button</title>
      <path d="M10.5,10.915a1.5,1.5,0,0,0,3,0V1.5a1.5,1.5,0,1,0-3,0Z" />
      <path d="M1.2,11.533a10.917,10.917,0,0,0,18.52,9.272A10.825,10.825,0,0,0,22.8,11.527,11.021,11.021,0,0,0,17.067,3.4,1.5,1.5,0,1,0,15.63,6.03a8.048,8.048,0,0,1,4.2,5.925A7.914,7.914,0,0,1,6.4,18.684a7.854,7.854,0,0,1-2.237-6.726A8.042,8.042,0,0,1,8.36,6.036,1.5,1.5,0,1,0,6.919,3.405,11.015,11.015,0,0,0,1.2,11.533Z" />
    </svg>
  )
}

PowerButtonIcon.defaultProps = {
  size: 16,
  color: '#000',
}
export default PowerButtonIcon
