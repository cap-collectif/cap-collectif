<?php

namespace Capco\AppBundle\DTO\Analytics;

class AggregatedResult
{
    private readonly string $key;
    private readonly int $totalCount;

    private function __construct(string $key, int $totalCount)
    {
        $this->key = $key;
        $this->totalCount = $totalCount;
    }

    public static function fromEs(array $response, ?string $customAggregation = null): self
    {
        $isHistogram = isset($response['key_as_string']);
        $key = $isHistogram ? 'key_as_string' : 'key';
        if ($customAggregation) {
            return new self($response[$key], $response[$customAggregation]['value']);
        }

        return new self($response[$key], $response['doc_count']);
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function getTotalCount(): int
    {
        return $this->totalCount;
    }
}
