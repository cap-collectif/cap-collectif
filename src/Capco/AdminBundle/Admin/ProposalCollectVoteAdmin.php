<?php
namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class ProposalCollectVoteAdmin extends Admin
{
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('createdAt', null, ['label' => 'admin.fields.opinion_vote.created_at'])
            ->add('proposal', null, ['label' => 'admin.fields.proposal'])
            ->add(
                'user',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.argument_vote.voter'],
                null,
                ['property' => 'username']
            );
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();

        $listMapper
            ->add('proposal', 'sonata_type_model', ['label' => 'admin.fields.proposal'])
            ->add('user', 'sonata_type_model', ['label' => 'admin.fields.argument_vote.voter'])
            ->add('collectStep', 'sonata_type_model', ['label' => 'admin.fields.step'])
            ->add('createdAt', null, ['label' => 'admin.fields.opinion_vote.created_at'])
            ->add('private', null, ['label' => 'admin.global.private'])
            ->add('username', null, ['label' => 'admin.global.username'])
            ->add('email', null, ['label' => 'admin.global.email'])
            ->add('_action', 'actions', ['actions' => ['show' => []]]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();
        $showMapper
            ->add('proposal', 'sonata_type_model', [
                'label' => 'admin.fields.argument_vote.argument',
            ])
            ->add('user', 'sonata_type_model', ['label' => 'admin.fields.argument_vote.voter'])
            ->add('createdAt', null, ['label' => 'admin.fields.argument_vote.created_at']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('edit');
    }
}
