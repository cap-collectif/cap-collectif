<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ProgressStepAdmin extends Admin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected $translationDomain = 'SonataAdminBundle';

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.step.group_general')
            ->add('title', null, [
                'label' => 'admin.fields.step.title',
                'required' => true,
            ])
            ->add('startAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.step.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'dp_use_current' => false,
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
                'required' => true,
            ])
            ->add('endAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.step.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'dp_use_current' => false,
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
                'required' => false,
            ])
        ;
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'delete', 'edit']);
    }
}
