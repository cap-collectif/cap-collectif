<?php

namespace Capco\AdminBundle;

use Capco\AdminBundle\DependencyInjection\AdminExtensionCompilerPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class CapcoAdminBundle extends Bundle
{
    public function build(ContainerBuilder $container)
    {
        parent::build($container);

        $container->addCompilerPass(new AdminExtensionCompilerPass());
    }
}
