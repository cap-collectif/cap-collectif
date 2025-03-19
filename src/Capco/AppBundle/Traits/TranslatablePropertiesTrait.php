<?php

declare(strict_types=1);

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Model\TranslationInterface;
use Doctrine\Common\Collections\Collection;

trait TranslatablePropertiesTrait
{
    /**
     * @var Collection<string, TranslationInterface>
     */
    protected $translations;

    /**
     * @var Collection<string, TranslationInterface>
     */
    protected $newTranslations;

    protected ?string $currentLocale = null;

    protected string $defaultLocale = 'en';
}
