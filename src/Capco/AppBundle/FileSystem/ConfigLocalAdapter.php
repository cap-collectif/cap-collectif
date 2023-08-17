<?php

declare(strict_types=1);

namespace Capco\AppBundle\FileSystem;

use Gaufrette\Adapter\Local as LocalAdapter;
use Symfony\Component\HttpKernel\KernelInterface;

class ConfigLocalAdapter extends LocalAdapter
{
    public function __construct(KernelInterface $kernel)
    {
        parent::__construct($kernel->getProjectDir() . '/config');
    }
}
