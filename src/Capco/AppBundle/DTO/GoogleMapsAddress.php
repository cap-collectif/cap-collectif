<?php

namespace Capco\AppBundle\DTO;

class GoogleMapsAddress
{

    protected $raw;
    protected $formatted;
    protected $types;
    protected $lat;
    protected $lng;

    private function __construct(string $raw, array $types, float $lat, float $lng, ?string $formatted)
    {

        $this->raw = $raw;
        $this->types = $types;
        $this->lat = $lat;
        $this->lng = $lng;
        $this->formatted = $formatted;
    }

    public static function fromApi(string $response): ?self
    {
        $decoded = \GuzzleHttp\json_decode($response, true);
        if (count($decoded) > 0 && $address = $decoded[0]) {
            return new self(
                $response,
                explode('|', $address['geometry']['location_type']),
                (float)$address['geometry']['location']['lat'],
                (float)$address['geometry']['location']['lng'],
                $address['formatted_address'] ?? null
            );
        }
        return null;
    }

    public function getRaw(): string
    {
        return $this->raw;
    }

    public function setRaw($raw): self
    {
        $this->raw = $raw;
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

    public function getLat()
    {
        return $this->lat;
    }

    public function setLat(float $lat): self
    {
        $this->lat = $lat;

        return $this;
    }

    public function getLng()
    {
        return $this->lng;
    }

    public function setLng(float $lng): self
    {
        $this->lng = $lng;

        return $this;
    }

}
