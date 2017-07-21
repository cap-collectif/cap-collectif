<?php

namespace Capco\AppBundle\Twig;

use Limenius\ReactRenderer\Twig\ReactRenderExtension;

class ReactIntlRenderExtension extends \Twig_Extension
{
    private $extension;
    private $messages;
    private $toggleManager;
    private $tokenStorage;

    public function __construct(ReactRenderExtension $extension, $file, $toggleManager, $tokenStorage)
    {
        $this->extension = $extension;
        $this->messages = json_decode(file_get_contents($file), true);
        $this->toggleManager = $toggleManager;
        $this->tokenStorage = $tokenStorage;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('react_intl_component', [$this, 'reactRenderIntlComponent'], ['is_safe' => ['html']]),
        ];
    }

    public function reactRenderIntlComponent($componentName, $options = [])
    {
        if (!array_key_exists('props', $options)) {
            $options['props'] = [];
        }
        if (is_string($options['props'])) {
            $props = json_decode($options['props'], true);
            $props['messages'] = $this->messages;
            $options['props'] = $props;
        } else {
            $options['props']['messages'] = $this->messages;
        }

        if ($this->tokenStorage->getToken() && $this->tokenStorage->getToken()->getUser()) {
            $options['rendering'] = 'client_side';
        }

        if (!$this->toggleManager->isActive('server_side_rendering')) {
            $options['rendering'] = 'client_side';
        }

        return $this->extension->reactRenderComponent($componentName, $options);
    }
}
