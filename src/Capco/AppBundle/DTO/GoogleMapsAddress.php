<?php

namespace Capco\AppBundle\DTO;

class GoogleMapsAddress
{
    protected string $json;
    protected ?string $formatted;
    protected array $types;
    protected float $lat;
    protected float $lng;

    public function __construct(
        string $json,
        array $types,
        float $lat,
        float $lng,
        ?string $formatted
    ) {
        $this->json = $json;
        $this->types = $types;
        $this->lat = $lat;
        $this->lng = $lng;
        $this->formatted = $formatted;
    }

    public static function fromApi(string $response): ?self
    {
        try {
            $decoded = \GuzzleHttp\json_decode($response, true);
            if (\count($decoded) > 0 && ($address = $decoded[0])) {
                if (
                    !isset(
                        $address['geometry'],
                        $address['geometry']['location'],
                        $address['geometry']['location']['lat'],
                        $address['geometry']['location']['lng']
                    )
                ) {
                    return null;
                }

                return new self(
                    $response,
                    explode('|', $address['geometry']['location_type']),
                    (float) $address['geometry']['location']['lat'],
                    (float) $address['geometry']['location']['lng'],
                    $address['formatted_address'] ?? null
                );
            }

            return null;
        } catch (\InvalidArgumentException $exception) {
            return null;
        }
    }

    public function getJson(): string
    {
        return $this->json;
    }

    public function setJson(string $json): self
    {
        $this->json = $json;

        return $this;
    }

    public function getFormatted(): ?string
    {
        return $this->formatted;
    }

    public function setFormatted(?string $formatted = null): self
    {
        $this->formatted = $formatted;

        return $this;
    }

    public function getTypes(): array
    {
        return $this->types;
    }

    public function setTypes(array $types): self
    {
        $this->types = $types;

        return $this;
    }

    public function getLat(): float
    {
        return $this->lat;
    }

    public function setLat(float $lat): self
    {
        $this->lat = $lat;

        return $this;
    }

    public function getLng(): float
    {
        return $this->lng;
    }

    public function setLng(float $lng): self
    {
        $this->lng = $lng;

        return $this;
    }

    public function decompose(): array
    {
        $decomposed = [];
        $decoded = \GuzzleHttp\json_decode($this->json, true);
        if (\count($decoded) > 0 && ($address = $decoded[0])) {
            foreach ($address['address_components'] as $component) {
                foreach ($component['types'] as $type) {
                    if ('point_of_interest' === $type) {
                        $decomposed['point_of_interest'] = $component['long_name'];

                        break;
                    }
                    if ('neighborhood' === $type) {
                        $decomposed['point_of_interest'] = $component['long_name'];

                        break;
                    }
                    if ('street_number' === $type) {
                        $decomposed['street_number'] = $component['long_name'];

                        break;
                    }
                    if ('route' === $type) {
                        $decomposed['route'] = $component['long_name'];

                        break;
                    }
                    if ('postal_code' === $type) {
                        $decomposed['postal_code'] = $component['long_name'];

                        break;
                    }
                    if ('locality' === $type) {
                        $decomposed['locality'] = $component['long_name'];

                        break;
                    }
                    if ('country' === $type) {
                        $decomposed['country'] = $component['long_name'];

                        break;
                    }
                }
            }
        }

        return $decomposed;
    }
}
