<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Toggle\Manager;
use Limenius\ReactRenderer\Twig\ReactRenderExtension as BaseExtension;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Twig\Extension\RuntimeExtensionInterface;

class ReactRenderRuntime implements RuntimeExtensionInterface
{
    public function __construct(private readonly BaseExtension $extension, private readonly Manager $toggleManager, private readonly TokenStorageInterface $tokenStorage)
    {
    }

    public function reactRenderIntlComponent($componentName, array $options = []): string
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
