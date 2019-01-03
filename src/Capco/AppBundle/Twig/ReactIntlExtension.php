<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;

class ReactIntlExtension extends \Twig_Extension
{
    private $translationFolder;
    private $resolver;
    private $env;

    public function __construct(string $translationFolder, string $env, Resolver $resolver)
    {
        $this->translationFolder = $translationFolder;
        $this->env = $env;
        $this->resolver = $resolver;
    }

    public function getFunctions()
    {
        return [new \Twig_SimpleFunction('intl_locale', [$this, 'getLocale'])];
    }

    public function getLocale(): string
    {
        return $this->resolver->getValue('global.locale');
    }
}
