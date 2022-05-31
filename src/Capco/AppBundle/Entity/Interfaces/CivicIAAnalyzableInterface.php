<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface CivicIAAnalyzableInterface
{
    public function getIaCategory(): ?string;

    public function setIaCategory(?string $iaCategory): void;

    public function getIaReadability(): ?float;

    public function setIaReadability(?float $iaReadability): void;

    public function getIaSentiment(): ?string;

    public function setIaSentiment(?string $iaSentiment): void;

    public function getIaCategoryDetails(): ?string;

    public function setIaCategoryDetails(?string $iaCategory): void;

    public function getIaSentimentDetails(): ?string;

    public function setIaSentimentDetails(?string $iaSentiment): void;
}
