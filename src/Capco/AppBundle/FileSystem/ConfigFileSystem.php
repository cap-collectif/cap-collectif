<?php

declare(strict_types=1);

namespace Capco\AppBundle\FileSystem;

use Gaufrette\Filesystem;

class ConfigFileSystem extends FileSystem
{
    public function __construct(ConfigLocalAdapter $adapter)
    {
        parent::__construct($adapter);
    }
}
