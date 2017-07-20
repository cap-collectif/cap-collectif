<?php

namespace Capco\AppBundle\Twig;

class ReactIntlExtension extends \Twig_Extension
{
    private $file;

    public function __construct(string $file)
    {
        $this->file = $file;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('intl_messages', [$this, 'getIntlMessages']),
        ];
    }

    public function getIntlMessages()
    {
        return json_decode(file_get_contents($this->file), true);
    }
}
