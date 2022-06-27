import useMapTokens from '@hooks/useMapTokens';
import React from 'react';
import { TileLayer } from 'react-leaflet';

export type District = {
    id: string,
    geojson: string,
    border: string,
    background: string,
    displayedOnMap: boolean,
};

const parseGeoJson = (district: District) => {
    const { geojson, id } = district;
    try {
        return JSON.parse(geojson || '');
    } catch (e) {
        warning(
            false,
            `Using empty geojson for ${id} because we couldn't parse the geojson : ${
                geojson || ''
            }`,
        );
        return null;
    }
};

export const formatGeoJsons = (districts: Array<District>) => {
    let geoJsons = [];
    if (districts) {
        geoJsons = districts
            .filter(d => d.geojson && d.displayedOnMap)
            .map(d => ({
                district: parseGeoJson(d),
                style: {
                    border: d.border,
                    background: d.background,
                },
            }));
    }
    return geoJsons;
};

export const getMapboxUrl = (mapTokens: {
    styleOwner: string | null,
    styleId: string | null,
    publicToken: string | null,
}) => {
    return `https://api.mapbox.com/styles/v1/${mapTokens.styleOwner}/${mapTokens.styleId}/tiles/256/{z}/{x}/{y}?access_token=${mapTokens.publicToken}`;
};

export const CapcoTileLayer = () => {
    const mapTokens = useMapTokens();
    return (
        <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
            url={getMapboxUrl(mapTokens)}
        />
    );
};
