import { NextPage } from 'next';
import { PageProps } from '../types';

const Index: NextPage<PageProps> = ({ viewerSession }) => {
    return (
        <>
            <p style={{ textAlgin: 'center' }}>Bienvenue: {JSON.stringify(viewerSession)}</p>
            {'You can try hot module reloading with: '}
            <a href="/emails">Emails</a>
            {' | '}
            <a href="/dashboard">Dashboard</a>
        </>
    );
};

export default Index;
