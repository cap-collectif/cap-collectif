<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Symfony\Component\Validator\Constraints\Valid;

class CapcoAdmin extends AbstractAdmin
{
    public function getFormBuilder()
    {
        if (isset($this->formOptions['cascade_validation'])) {
            unset($this->formOptions['cascade_validation']);
            $this->formOptions['constraints'][] = new Valid();
        }

        return parent::getFormBuilder();
    }
}
