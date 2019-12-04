<?php

namespace Capco\AppBundle\DTO;

class GoogleMapsAddress
{
    protected $json;
    protected $formatted;
    protected $types;
    protected $lat;
    protected $lng;

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
}
