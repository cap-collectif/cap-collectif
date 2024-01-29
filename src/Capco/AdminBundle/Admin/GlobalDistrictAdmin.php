<?php

namespace Capco\AdminBundle\Admin;

class GlobalDistrictAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'project_district';

    public function __construct(string $code, string $class, string $baseControllerName)
    {
        parent::__construct($code, $class, $baseControllerName);
    }

    protected function configure(): void
    {
        parent::configure();
    }
}
