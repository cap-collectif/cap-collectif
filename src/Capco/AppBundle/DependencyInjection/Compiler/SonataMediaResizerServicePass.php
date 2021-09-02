<?php

namespace Capco\AppBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class SonataMediaResizerServicePass implements CompilerPassInterface
{
    /**
     * You can modify the container here before it is dumped to PHP code.
     *
     * @param ContainerBuilder $container
     *
     * @api
     */
    public function process(ContainerBuilder $container)
    {
        if ($container->hasDefinition('sonata.media.resizer.simple')) {
            $definition = $container->getDefinition('sonata.media.resizer.simple');

            $definition->replaceArgument(0, new Reference('sonata.media.adapter.image.imagick'));
        }

        if ($container->hasDefinition('sonata.media.resizer.square')) {
            $definition = $container->getDefinition('sonata.media.resizer.square');

            $definition->replaceArgument(0, new Reference('sonata.media.adapter.image.imagick'));
        }
    }
}
