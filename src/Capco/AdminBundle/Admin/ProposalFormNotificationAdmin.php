<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;

class ProposalFormNotificationAdmin extends Admin
{
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('on_create', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.notification.on_create',
                'required' => false
            ])
            ->add('on_update', CheckboxType::class, [
                    'label' => 'admin.fields.proposal_form.notification.on_update',
                    'required' => false
                ])
            ->add('on_delete', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.notification.on_delete',
                'required' => false
            ])
            ->end();
    }
}
