<?php

namespace Capco\AppBundle\Twig;

class ReactIntlExtension extends \Twig_Extension
{
    private $translationFolder;

    public function __construct(string $translationFolder)
    {
        $this->translationFolder = $translationFolder;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('intl_locale', [$this, 'getLocale']),
            new \Twig_SimpleFunction('intl_messages', [$this, 'getIntlMessages']),
        ];
    }

    public function getLocale(): string
    {
        return 'fr-FR';
    }

    public function getIntlMessages()
    {
        return json_decode(file_get_contents($this->translationFolder . 'messages.' . $this->getLocale() . '.json'), true);
    }
}
