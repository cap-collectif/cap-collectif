<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class GroupAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'createdAt',
    ];

    /**
     * {@inheritdoc}
     */
    public function getExportFields(): array
    {
        return [
            'title',
            'description',
            'countUserGroups',
            'createdAt',
            'updatedAt',
        ];
    }

    public function getExportFormats(): array
    {
        return ['csv'];
    }

    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('titleInfo', null, [
                'label' => 'admin.fields.group.title',
                'template' => 'CapcoAdminBundle:Group:title_list_field.html.twig',
            ])
            ->add('countUserGroups', null, [
                'label' => 'admin.fields.group.number_users',
            ])
            ->add('createdAt', 'datetime', [
                'label' => 'admin.fields.group.created_at',
            ])
            ->add('updatedAt', 'datetime', [
                'label' => 'admin.fields.group.updated_at',
            ])
        ;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.group.title',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.group.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.group.updated_at',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('delete');
    }
}
