<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\OpinionVote;

class OpinionVoteAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'opinion.title',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('opinion', null, array(
                'label' => 'admin.fields.opinion_vote.opinion',
            ))
            ->add('user', null, array(
                'label' => 'admin.fields.opinion_vote.voter',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.opinion_vote.value',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_vote.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion_vote.created_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion_vote.opinion',
            ))
            ->add('user', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion_vote.voter',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.opinion_vote.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_list_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_vote.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion_vote.opinion',
            ))
            ->add('user', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion_vote.voter',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.opinion_vote.value',
                'template' => 'CapcoAdminBundle:OpinionVote:value_show_field.html.twig',
                'labels' => OpinionVote::$voteTypesLabels,
                'styles' => OpinionVote::$voteTypesStyles,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_vote.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion_vote.created_at',
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion_vote.opinion',
            ))
            ->add('user', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion_vote.voter',
            ))
            ->add('value', 'choice', array(
                'label' => 'admin.fields.opinion_vote.value',
                'choices' => OpinionVote::$voteTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
    }
}
