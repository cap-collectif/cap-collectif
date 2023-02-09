<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;

class ProposalCategoryAdmin extends CapcoAdmin
{
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $form): void
    {
        $form->add('name', null, [
            'label' => 'global.name',
            'required' => true,
        ]);
    }
}
