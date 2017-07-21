<?php

namespace Capco\AppBundle\Twig;

use Limenius\ReactRenderer\Twig\ReactRenderExtension as BaseExtension;

class ReactRenderExtension extends \Twig_Extension
{
    private $extension;
    private $messages;
    private $toggleManager;
    private $tokenStorage;

    public function __construct(BaseExtension $extension, $toggleManager, $tokenStorage)
    {
        $this->extension = $extension;
        $this->toggleManager = $toggleManager;
        $this->tokenStorage = $tokenStorage;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('react_render_component', [$this, 'reactRenderIntlComponent'], ['is_safe' => ['html']]),
        ];
    }

    public function reactRenderIntlComponent($componentName, $options = [])
    {
        if ($this->tokenStorage->getToken() && $this->tokenStorage->getToken()->getUser()) {
            $options['rendering'] = 'client_side';
        }

        if (!$this->toggleManager->isActive('server_side_rendering')) {
            $options['rendering'] = 'client_side';
        }

        return $this->extension->reactRenderComponent($componentName, $options);
    }
}
