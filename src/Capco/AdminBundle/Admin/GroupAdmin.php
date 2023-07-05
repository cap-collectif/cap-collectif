<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class GroupAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'group';
    protected array $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'createdAt',
    ];

    public function getExportFields(): array
    {
        return ['title', 'description', 'countUserGroups', 'createdAt', 'updatedAt'];
    }

    public function getExportFormats(): array
    {
        return ['csv'];
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('titleInfo', null, [
                'label' => 'global.title',
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
            ])
        ;
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('create');
        $collection->remove('delete');
    }

    protected function configureFormFields(FormMapper $form): void
    {
        // Content
        $form->with('global.contenu', ['class' => 'col-md-12'])->end();

        $form
            ->with('global.contenu')
            ->add('title', null, ['label' => 'global.title'])
            ->end()
        ;
    }
}
