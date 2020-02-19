<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Capco\AppBundle\Entity\OpinionVote;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Form\Type\ModelType;

class OpinionVoteAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'opinion.title'];

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('opinion', null, ['label' => 'global.proposal'])
            ->add('user', ModelAutocompletetype::class, ['label' => 'global.author'], null, [
                'property' => 'email,username',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                }
            ])
            ->add('value', null, ['label' => 'global.value'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('value', null, [
                'label' => 'global.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_list_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []]
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('value', null, [
                'label' => 'global.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_show_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('user', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                }
            ])
            ->add('value', ChoiceType::class, [
                'label' => 'global.value',
                'choices' => OpinionVote::$voteTypesLabels,
                'translation_domain' => 'CapcoAppBundle'
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
    }
}
