import NavBar from '../UI/NavBar';
import { Skeleton } from '@cap-collectif/ui';
import { FC } from 'react';

const NavBarPlaceholder: FC = () => (
    <NavBar>
        <Skeleton.Text size="sm" width="300px" />

        <NavBar.List ml="auto" mr={8}>
            <Skeleton.Text size="md" width={9} />
        </NavBar.List>

        <NavBar.List spacing={8} pr={4}>
            <Skeleton.Text size="md" width={9} />
            <Skeleton.Circle size={6} />
        </NavBar.List>
    </NavBar>
);

export default NavBarPlaceholder;
