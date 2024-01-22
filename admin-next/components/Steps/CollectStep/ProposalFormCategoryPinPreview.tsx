import * as React from 'react';
import styled from 'styled-components';
// @ts-ignore
import { renderToString } from 'react-dom/server';

import { MapContainer, Marker } from 'react-leaflet';
import { CapcoTileLayer } from '@utils/leaflet';
import { CapUIIcon, CapUIIconSize, Icon } from '@cap-collectif/ui';
import convertIconToDs from '@components/Steps/CollectStep/ProposalFormAdminCategories.utils';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
// @ts-ignore
import L from 'leaflet';

export interface ProposalFormCategoryPinPreviewProps {
    color: string;
    icon: string;
}
const Container = styled.div`
    max-height: 128px;
    min-height: 115px;
    position: relative;
    width: 49%;
    border-radius: 4px;
    border: 1px solid #e3e3e3;

    .preview-icn svg {
        height: 40px !important;
        width: 40px !important;
        max-height: none !important;
        max-width: none !important;
        padding: 0 !important;
    }

    .preview-icn svg:nth-child(2) {
        position: absolute;
        top: 7px;
        left: 12px;
        height: 16px !important;
        width: 16px !important;
        padding: 0;
        max-height: none !important;
        max-width: none !important;
    }

    .leaflet-bottom.leaflet-right {
        display: none;
    }
`;

const ProposalFormCategoryPinPreview: React.FC<ProposalFormCategoryPinPreviewProps> = ({
    color,
    icon,
}) => {
    return (
        <Container>
            <MapContainer
                center={{
                    lat: 48.8604,
                    lng: 2.3507,
                }}
                doubleClickZoom={false}
                dragging={false}
                touchZoom={false}
                scrollWheelZoom={false}
                zoom={16}
                zoomControl={false}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                gestureHandling>
                <CapcoTileLayer />
                <Marker
                    position={[48.8601, 2.3507]}
                    // @ts-ignore
                    icon={L.divIcon({
                        className: 'preview-icn',
                        html: renderToString(
                            <div>
                                <Icon name={CapUIIcon.PinFull} size={CapUIIconSize.Md} color={color} />
                                {icon && (
                                    <Icon
                                        // @ts-ignore
                                        name={CapUIIcon[convertIconToDs(icon)]}
                                        size={CapUIIconSize.Xxl}
                                        color="white"
                                    />
                                )}
                            </div>,
                        ),
                        iconSize: [34, 48],
                        iconAnchor: [17, 48],
                    })}
                />
            </MapContainer>
        </Container>
    );
};

export default ProposalFormCategoryPinPreview;
