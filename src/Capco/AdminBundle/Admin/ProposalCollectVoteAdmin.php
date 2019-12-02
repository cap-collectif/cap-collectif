<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class ProposalCollectVoteAdmin extends AbstractAdmin
{
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('proposal', null, ['label' => 'admin.fields.proposal'])
            ->add(
                'user',
                'doctrine_orm_model_autocomplete',
                ['label' => 'global.author'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            );
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('proposal', 'sonata_type_model', ['label' => 'admin.fields.proposal'])
            ->add('user', 'sonata_type_model', ['label' => 'global.author'])
            ->add('collectStep', 'sonata_type_model', ['label' => 'admin.fields.step'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('private', null, ['label' => 'admin.global.private'])
            ->add('username', null, ['label' => 'admin.global.username'])
            ->add('email', null, ['label' => 'admin.global.email'])
            ->add('_action', 'actions', ['actions' => ['show' => []]]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('proposal', 'sonata_type_model', [
                'label' => 'global.argument.label',
            ])
            ->add('user', 'sonata_type_model', ['label' => 'global.author'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('edit');
    }
}
