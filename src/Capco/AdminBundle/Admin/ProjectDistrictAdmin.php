<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;

class ProjectDistrictAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'project_district';

    public function getTemplate($name)
    {
        return 'CapcoAdminBundle:ProjectDistrict:list.html.twig';
    }
}
