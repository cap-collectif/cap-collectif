<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Enum\CivicIASentimentEnum;
use Doctrine\ORM\Mapping as ORM;

trait CivicIATrait
{
    /**
     * @ORM\Column(name="ia_category", type="text", nullable=true)
     */
    private ?string $iaCategory = null;

    /**
     * @ORM\Column(name="ia_category_details", type="text", nullable=true)
     */
    private ?string $iaCategoryDetails = null;

    /**
     * @ORM\Column(name="ia_readability", type="float", nullable=true)
     */
    private ?float $iaReadability = null;

    /**
     * @ORM\Column(name="ia_sentiment", type="text", nullable=true)
     */
    private ?string $iaSentiment = null;

    /**
     * @ORM\Column(name="ia_sentiment_details", type="text", nullable=true)
     */
    private ?string $iaSentimentDetails = null;

    public function getIaCategory(): ?string
    {
        return self::handleIllFormattedCategory($this->iaCategory);
    }

    public function setIaCategory(?string $iaCategory): void
    {
        $this->iaCategory = self::handleIllFormattedCategory($iaCategory);
    }

    public function getIaCategoryDetails(): ?string
    {
        return $this->iaCategoryDetails;
    }

    public function setIaCategoryDetails(?string $iaCategoryDetails): void
    {
        $this->iaCategoryDetails = $iaCategoryDetails;
    }

    public function getIaReadability(): ?float
    {
        return $this->iaReadability;
    }

    public function setIaReadability(?float $iaReadability): void
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

    public function getIaSentimentDetails(): ?string
    {
        return $this->iaSentimentDetails;
    }

    public function setIaSentimentDetails(?string $iaSentimentDetails): void
    {
        $this->iaSentimentDetails = $iaSentimentDetails;
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

    /**
     * To handle ill formatted category previously received, we take the first non-empty element exploded by /
     * e.g.
     * /literacy/complaint -> literacy
     * /literacy -> literacy
     * literacy -> literacy.
     *
     * This method should be removed when no more needed
     */
    private static function handleIllFormattedCategory(?string $iaCategory): ?string
    {
        if ($iaCategory) {
            $exploded = array_filter(explode('/', $iaCategory));
            $iaCategory = reset($exploded);
        }

        return $iaCategory;
    }
}
