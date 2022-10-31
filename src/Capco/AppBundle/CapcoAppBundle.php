<?php

namespace Capco\AppBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Capco\AppBundle\DependencyInjection\Compiler\MailerServicePass;
use Capco\AppBundle\DependencyInjection\Compiler\SimpleSAMLServicePass;

class CapcoAppBundle extends Bundle
{
    /**
     * Builds the bundle.
     *
     * It is only ever called once when the cache is empty.
     *
     * This method can be overridden to register compilation passes,
     * other extensions, ...
     *
     * @param ContainerBuilder $container A ContainerBuilder instance
     */
    public function build(ContainerBuilder $container)
    {
        $container->addCompilerPass(new SimpleSAMLServicePass());
        $container->addCompilerPass(new MailerServicePass());
    }
}
