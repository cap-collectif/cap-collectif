<?php

namespace Capco\AppBundle\Translator;

use Symfony\Component\Translation\TranslatorBagInterface;
use Symfony\Contracts\Translation\LocaleAwareInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class NoTranslator implements TranslatorInterface, TranslatorBagInterface, LocaleAwareInterface
{
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function trans($id, array $parameters = [], $domain = null, $locale = null)
    {
        if ('routes' === $domain) {
            return $this->translator->trans($id, $parameters, $domain, $locale);
        }
        if (0 === \count($parameters)) {
            return $id;
        }

        return $id . ' ' . json_encode($parameters);
    }

    public function transChoice($id, $number, array $parameters = [], $domain = null, $locale = null)
    {
        return $this->trans($id, $parameters, $domain, $locale);
    }

    public function getCatalogue($locale = null)
    {
        if (!$this->translator instanceof TranslatorBagInterface) {
            throw new \RuntimeException("Translator doesn't implement TranslatorBagInterface.");
        }

        return $this->translator->getCatalogue($locale);
    }

    public function setLocale($locale)
    {
        return $this->translator->setLocale($locale);
    }

    public function getLocale()
    {
        return $this->translator->getLocale();
    }
}
