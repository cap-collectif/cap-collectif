<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;

class ProjectDistrictAdmin extends Admin
{
    public function getTemplate($name)
    {
        return 'CapcoAdminBundle:ProjectDistrict:list.html.twig';
    }
}
