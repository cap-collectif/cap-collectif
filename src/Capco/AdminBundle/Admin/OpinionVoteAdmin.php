<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\OpinionVote;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class OpinionVoteAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'opinion.title',
    ];

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('opinion', null, [
                'label' => 'admin.fields.opinion_vote.opinion',
            ])
            ->add('user', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.opinion_vote.voter',
            ], null, [
                'property' => 'username',
            ])
            ->add('value', null, [
                'label' => 'admin.fields.opinion_vote.value',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion_vote.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.opinion_vote.created_at',
            ])
            ->add('expired', null, ['label' => 'admin.global.expired'])
        ;
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();

        $listMapper
            ->add('opinion', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_vote.opinion',
            ])
            ->add('user', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_vote.voter',
            ])
            ->add('value', null, [
                'label' => 'admin.fields.opinion_vote.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_list_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles,
            ])
            ->add('expired', null, [
                'label' => 'admin.global.expired',
                'editable' => $currentUser->hasRole('ROLE_SUPER_ADMIN'),
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion_vote.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();
        $showMapper
            ->add('opinion', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_vote.opinion',
            ])
            ->add('user', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_vote.voter',
            ])
            ->add('value', null, [
                'label' => 'admin.fields.opinion_vote.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_show_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles,
            ])
            ->add('expired', null, [
                'label' => 'admin.global.expired',
                'attr' => [
                  'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                  'read_only' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                ],
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion_vote.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.opinion_vote.created_at',
            ])
        ;
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();
        $formMapper
            ->add('opinion', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_vote.opinion',
            ])
            ->add('user', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.opinion_vote.voter',
                'property' => 'username',
            ])
            ->add('value', 'choice', [
                'label' => 'admin.fields.opinion_vote.value',
                'choices' => OpinionVote::$voteTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('expired', null, [
                'label' => 'admin.global.expired',
                'attr' => [
                  'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                  'readonly' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                ],
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
    }
}
