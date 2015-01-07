<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class OpinionAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.opinion.author',
            ))
            ->add('Consultation', null, array(
                'label' => 'admin.fields.opinion.consultation',
            ))
            ->add('OpinionType', null, array(
                'label' => 'admin.fields.opinion.opinion_type',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion.updated_at',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion.source_count',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.author',
            ))
            ->add('Consultation', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.consultation',
            ))
            ->add('voteCountTotal', 'integer', array(
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'template' => 'CapcoAdminBundle:Opinion:vote_count_list_field.html.twig',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion.source_count',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.opinion.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'editable' => true,
                'label' => 'admin.fields.opinion.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                )
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.author',
            ))
            ->add('body', null, array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.opinion.body',
            ))
            ->add('Consultation', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.consultation',
            ))
            ->add('OpinionType', 'sonata_type_model', array(
                'label' => 'admin.fields.opinion.opinion_type',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion.is_enabled',
                'required' => false,
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion.is_trashed',
                'required' => false,
            ))
            ->add('trashedReason', null, array(
                'label' => 'admin.fields.opinion.trashed_reason',
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.opinion.title',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.opinion.author',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.opinion.body',
            ))
            ->add('Consultation', null, array(
                'label' => 'admin.fields.opinion.consultation',
            ))
            ->add('OpinionType', null, array(
                'label' => 'admin.fields.opinion.opinion_type',
            ))
            ->add('voteCountTotal', 'integer', array(
                'label' => 'admin.fields.opinion.vote_count_total',
                'mapped' => false,
                'data' => $subject->getVoteCountAll(),
            ))
            ->add('voteCountOk', null, array(
                'label' => 'admin.fields.opinion.vote_count_ok',
            ))
            ->add('voteCountNok', null, array(
                'label' => 'admin.fields.opinion.vote_count_nok',
            ))
            ->add('voteCountMitige', null, array(
                'label' => 'admin.fields.opinion.vote_count_mitige',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion.source_count',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion.is_trashed',
            ))
            ->add('trashedReason', null, array(
                'label' => 'admin.fields.opinion.trashed_reason',
            ))
            ->add('trashedAt', null, array(
                'label' => 'admin.fields.opinion.trashed_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion.updated_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('delete');
        $collection->remove('edit');
    }
}
