<?php
namespace Capco\AppBundle;

use Capco\AppBundle\DependencyInjection\Compiler\SimpleSAMLServicePass;
use Capco\AppBundle\DependencyInjection\Compiler\SonataMediaResizerServicePass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

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
        $container->addCompilerPass(new SonataMediaResizerServicePass());
        $container->addCompilerPass(new SimpleSAMLServicePass());
    }
}
