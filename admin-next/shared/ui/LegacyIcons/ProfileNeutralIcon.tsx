import * as React from 'react'
type Props = {
  readonly className?: string
  readonly size: number
  readonly color: string
}

const ProfileNeutralIcon = ({ className, size, color }: Props) => {
  return (
    <svg
      className={className}
      width={`${size}px`}
      height={`${size}px`}
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      viewBox="0 0 24 24"
    >
      <title>single-neutral-circle</title>
      <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm7.49,18.239a9.745,9.745,0,0,1-14.979,0,.25.25,0,0,1-.054-.207.257.257,0,0,1,.126-.173,33.03,33.03,0,0,1,4.04-1.669l.674-.249a.966.966,0,0,0,.477-.723,2.194,2.194,0,0,0-.249-1.752c-.839-.924-1.659-2.064-1.659-4.915A4.043,4.043,0,0,1,12,4.151a4.043,4.043,0,0,1,4.135,4.4c0,2.851-.82,3.991-1.659,4.915a2.194,2.194,0,0,0-.249,1.752.966.966,0,0,0,.477.723l.675.249a33.134,33.134,0,0,1,4.038,1.668.259.259,0,0,1,.126.173A.25.25,0,0,1,19.49,18.239Z" />
    </svg>
  )
}

ProfileNeutralIcon.defaultProps = {
  size: 16,
  color: '#000',
}
export default ProfileNeutralIcon
