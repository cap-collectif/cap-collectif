<?php
namespace Capco\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class CapcoUserBundle extends Bundle
{
    /**
     * {@inheritdoc}
     */
    public function getParent()
    {
        return 'SonataUserBundle';
    }
}
