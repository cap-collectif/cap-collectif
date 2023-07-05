<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\OpinionVote;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class OpinionVoteAdmin extends AbstractAdmin
{
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'opinion.title'];

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('opinion', null, ['label' => 'global.proposal'])
            ->add('user', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('value', null, ['label' => 'global.value'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation'])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('value', null, [
                'label' => 'global.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_list_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles,
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('user', ModelType::class, ['label' => 'global.author'])
            ->add('value', null, [
                'label' => 'global.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_show_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles,
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation'])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('opinion', ModelType::class, ['label' => 'global.proposal'])
            ->add('user', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('value', ChoiceType::class, [
                'label' => 'global.value',
                'choices' => OpinionVote::$voteTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('create');
    }
}
