import type { FC } from 'react';
import { graphql, useFragment } from 'react-relay';
import { Avatar, AvatarProps } from '@cap-collectif/ui';
import type { UserAvatar_user$key } from '@relay/UserAvatar_user.graphql';

const FRAGMENT = graphql`
    fragment UserAvatar_user on User {
        displayName
        media {
            url
        }
    }
`;

interface UserAvatarProps extends Omit<AvatarProps, 'name'> {
    user: UserAvatar_user$key;
}

export const UserAvatar: FC<UserAvatarProps> = ({ user: userFragment, alt, ...props }) => {
    const user = useFragment(FRAGMENT, userFragment);

    if (!user) return null;

    return (
        <Avatar
            name={user.displayName}
            src={user.media?.url}
            alt={alt ?? user.displayName}
            {...props}
        />
    );
};

export default UserAvatar;
