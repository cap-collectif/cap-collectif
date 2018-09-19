<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class UserTypeAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'name',
    ];

    public function getFeatures()
    {
        return ['user_type'];
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('name', null, [
                'label' => 'admin.fields.user_type.name',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.user_type.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.user_type.updated_at',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('name', null, [
                'label' => 'admin.fields.user_type.name',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.user_type.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper->add('name', null, [
            'label' => 'admin.fields.user_type.name',
        ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('name', null, [
                'label' => 'admin.fields.user_type.name',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.user_type.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.user_type.updated_at',
            ]);
    }
}
