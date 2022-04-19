<?php

namespace Capco\AppBundle\CivicIA;

use Capco\AppBundle\Enum\CivicIASentimentEnum;
use Doctrine\ORM\Mapping as ORM;

trait CivicIATrait
{
    /**
     * @ORM\Column(name="ia_category", type="text", nullable=true)
     */
    private ?string $iaCategory = null;

    /**
     * @ORM\Column(name="ia_readability", type="integer", nullable=true)
     */
    private ?int $iaReadability = null;

    /**
     * @ORM\Column(name="ia_sentiment", type="text", nullable=true)
     */
    private ?string $iaSentiment = null;

    public function getIaCategory(): ?string
    {
        return $this->iaCategory;
    }

    public function setIaCategory(?string $iaCategory): void
    {
        $this->iaCategory = $iaCategory;
    }

    public function getIaReadability(): ?int
    {
        return $this->iaReadability;
    }

    public function setIaReadability(?int $iaReadability): void
    {
        self::checkIaReadability($iaReadability);
        $this->iaReadability = $iaReadability;
    }

    public function getIaSentiment(): ?string
    {
        return $this->iaSentiment;
    }

    public function setIaSentiment(?string $iaSentiment): void
    {
        self::checkIaSentiment($iaSentiment);
        $this->iaSentiment = $iaSentiment;
    }

    protected static function checkIaReadability(?int $iaReadability): void
    {
        if (null !== $iaReadability && (0 > $iaReadability || $iaReadability > 100)) {
            throw new \RuntimeException(
                'civic ia readability must be in 0-100, cannot be ' . $iaReadability
            );
        }
    }

    protected static function checkIaSentiment(?string $iaSentiment): void
    {
        if ($iaSentiment && !CivicIASentimentEnum::isValid($iaSentiment)) {
            throw new \RuntimeException('unknown civic ia sentiment : ' . $iaSentiment);
        }
    }
}
