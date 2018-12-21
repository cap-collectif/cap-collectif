<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;

class ReactIntlExtension extends \Twig_Extension
{
    private $translationFolder;
    private $resolver;
    private $env;

    public function __construct(
        ?string $translationFolder = '',
        Resolver $resolver,
        ?string $env = ''
    ) {
        $this->translationFolder = $translationFolder;
        $this->resolver = $resolver;
        $this->env = $env;
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
        return $this->resolver->getValue('global.locale');
    }

    public function getIntlMessages()
    {
        if ('test' === $this->env) {
            return json_decode('{}');
        }
        $locale = $this->getLocale();
        $filename = 'messages.' . $locale . '.json';

        return json_decode(file_get_contents($this->translationFolder . $filename), true);
    }
}
