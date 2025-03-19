<?php

namespace Capco\AdminBundle\DependencyInjection;

use Capco\AdminBundle\Admin\Extension\TranslatableAdminExtension;
use Capco\AppBundle\Model\TranslatableInterface;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * @deprecated
 *
 * Use this to add our own TranslatableAdminExtension to SonataAdmin services (old sonata admin pages).
 * You can remove it once sonata admin is no more used.
 */
class AdminExtensionCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        foreach ($container->findTaggedServiceIds('sonata.admin') as $id => $attributes) {
            $admin = $container->getDefinition($id);
            $modelClass = $container->getParameterBag()->resolveValue($admin->getArgument(1));
            if (!$modelClass || !class_exists($modelClass)) {
                continue;
            }
            $modelClassReflection = new \ReflectionClass($modelClass);

            if ($modelClassReflection->implementsInterface(TranslatableInterface::class)) {
                $admin->addMethodCall('addExtension', [
                    new Reference(TranslatableAdminExtension::class),
                ]);
            }
        }
    }
}
