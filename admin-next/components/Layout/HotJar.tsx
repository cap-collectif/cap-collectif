import * as React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { HotJarQuery as HotJarQueryType } from '@relay/HotJarQuery.graphql';
import { useAppContext } from '../AppProvider/App.context';

export const QUERY = graphql`
    query HotJarQuery {
        hotjar: siteParameter(keyname: "admin.analytics.hotjarid") {
            value
        }
    }
`;

function loadHotJarScript(id: string, sv: number) {
    (function (h, o, t, j) {
        let a = null;
        let r = null;

        // @ts-ignore
        h.hj =
            // @ts-ignore
            h.hj ||
            function () {
                // @ts-ignore
                (h.hj.q = h.hj.q || []).push(arguments);
            };

        // @ts-ignore
        h._hjSettings = { hjid: id, hjsv: sv };
        // @ts-ignore
        h._scriptPath = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        // @ts-ignore
        if (!document.querySelector('script[src*="' + h._scriptPath + '"]')) {
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = true;
            // @ts-ignore
            r.src = h._scriptPath;
            a.appendChild(r);
        }
    })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');
}

function setHotJarConfig() {
    var params = Array.prototype.slice.call(arguments);
    // @ts-ignore
    if (!window.hj) {
        throw new Error('Hotjar is not initialized');
    }

    // @ts-ignore
    window.hj.apply(undefined, params);
}

const HotJar = (): null => {
    const query = useLazyLoadQuery<HotJarQueryType>(QUERY, {});
    const { viewerSession } = useAppContext();

    React.useEffect(() => {
        if (query.hotjar?.value) {
            loadHotJarScript(query.hotjar?.value, 6);
            // @ts-ignore
            setHotJarConfig('identify', viewerSession.id, {
                email: viewerSession.email,
                username: viewerSession.username,
                isAdmin: viewerSession.isAdmin ? 'Yes' : 'No',
                isSuperAdmin: viewerSession.isSuperAdmin ? 'Yes' : 'No',
                isProjectAdmin: viewerSession.isProjectAdmin ? 'Yes' : 'No',
            });
        }
    }, [query.hotjar?.value]);

    return null;
};

export default HotJar;
