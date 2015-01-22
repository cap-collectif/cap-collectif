<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SourceAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.source.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.source.body',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.source.author',
            ))
            ->add('Opinion', null, array(
                'label' => 'admin.fields.source.opinion',
            ))
            ->add('Category', null, array(
                'label' => 'admin.fields.source.opinion',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.source.link',
            ))
            ->add('voteCountSource', null, array(
                'label' => 'admin.fields.source.vote_count_source',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.source.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.source.created_at',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.source.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.source.is_trashed',
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
                'label' => 'admin.fields.source.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.source.author',
            ))
            ->add('Opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.source.opinion',
            ))
            ->add('Category', 'sonata_type_model', array(
                'label' => 'admin.fields.source.category',
            ))
            ->add('voteCountSource', null, array(
                'label' => 'admin.fields.source.vote_count_source',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.source.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'editable' => true,
                'label' => 'admin.fields.source.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.source.updated_at',
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
                'label' => 'admin.fields.source.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.source.is_enabled',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.source.body',
                'attr' => array('class' => 'ckeditor'),
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.source.author',
            ))
            ->add('Opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.source.opinion',
            ))
            ->add('Category', 'sonata_type_model', array(
                'label' => 'admin.fields.source.category',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.source.link',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.source.is_trashed',
            ))
            ->add('trashedReason', null, array(
                'label' => 'admin.fields.source.trashed_reason',
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
                'label' => 'admin.fields.source.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.source.body',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.source.author',
            ))
            ->add('Opinion', null, array(
                'label' => 'admin.fields.source.opinion',
            ))
            ->add('Category', null, array(
                'label' => 'admin.fields.source.category',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.source.link',
            ))
            ->add('voteCountSource', null, array(
                'label' => 'admin.fields.source.vote_count_source',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.source.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.source.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.source.updated_at',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.source.is_trashed',
            ))
        ;
        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, array(
                    'label' => 'admin.fields.source.trashed_at',
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.source.trashed_reason',
                ))
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
