<?php

namespace Capco\AdminBundle\Twig;

use Capco\AppBundle\Entity\Menu;

class TypeDisplayExtension extends \Twig_Extension
{
    protected $translator;

    public function __construct($translator)
    {
        $this->translator = $translator;
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('capco_display_type', array($this, 'displayType')),
        );
    }

    public function displayType($value)
    {
        return $this->translator->trans(Menu::$types[$value]);
    }

    public function getName()
    {
        return 'type_display';
    }
}
