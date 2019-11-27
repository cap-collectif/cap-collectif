<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class GroupAdmin extends AbstractAdmin
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
        return ['title', 'description', 'countUserGroups', 'createdAt', 'updatedAt'];
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
                'label' => 'search.form.types.users',
            ])
            ->add('createdAt', 'datetime', [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', 'datetime', [
                'label' => 'global.maj',
            ]);
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.group.title',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('delete');
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        // Content
        $formMapper->with('global.contenu', ['class' => 'col-md-12'])->end();

        $formMapper
            ->with('global.contenu')
            ->add('title', null, ['label' => 'admin.fields.group.title'])
            ->end();
    }
}
