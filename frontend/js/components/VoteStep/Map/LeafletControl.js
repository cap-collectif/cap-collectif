// @flow
import L from 'leaflet';
import * as React from 'react';

const ControlClasses = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

type Props = {
  +position?: $Keys<typeof ControlClasses>,
  +children: React.Node,
};

const LeafletControl = ({ position, children }: Props) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  });

  return (
    <div ref={ref} className={position && ControlClasses[position]}>
      <div className="leaflet-control">{children}</div>
    </div>
  );
};

export default LeafletControl;
