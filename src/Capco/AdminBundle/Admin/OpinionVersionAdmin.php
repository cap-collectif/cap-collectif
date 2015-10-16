<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class OpinionVersionAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.opinion_version.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.opinion_version.body',
            ))
            ->add('comment', null, array(
                'label' => 'admin.fields.opinion_version.comment',
            ))
            ->add('author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.opinion_version.author',
            ], null, array(
                'property' => 'username',
            ))
            ->add('parent', null, array(
                'label' => 'admin.fields.opinion_version.parent',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.opinion_version.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion_version.is_trashed',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_version.updated_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.opinion_version.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.opinion_version.body',
            ))
            ->add('comment', null, array(
                'label' => 'admin.fields.opinion_version.comment',
            ))
            ->add('author', null, array(
                'label' => 'admin.fields.opinion_version.author',
            ))
            ->add('parent', null, array(
                'label' => 'admin.fields.opinion_version.parent',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.opinion_version.is_enabled',
                'editable' => true,
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion_version.is_trashed',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_version.updated_at',
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
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.opinion_version.group_content', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.opinion_version.group_publication', array('class' => 'col-md-12'))->end()
            ->end()
        ;

        $formMapper
            // Content
            ->with('admin.fields.opinion_version.group_content')
                ->add('title', null, array(
                    'label' => 'admin.fields.opinion_version.title',
                ))
                ->add('author', 'sonata_type_model_autocomplete', [
                    'label' => 'admin.fields.opinion_version.author',
                    'property' => 'username',
                ])
                ->add('parent', 'sonata_type_model', array(
                    'label' => 'admin.fields.opinion_version.parent',
                ))
                ->add('body', 'ckeditor', array(
                    'label' => 'admin.fields.opinion_version.body',
                    'config_name' => 'admin_editor',
                ))
                ->add('comment', null, [
                    'label' => 'admin.fields.opinion_version.comment',
                ])
            ->end()

            // Publication
            ->with('admin.fields.opinion_version.group_publication')
                ->add('enabled', null, array(
                    'label' => 'admin.fields.opinion_version.is_enabled',
                    'required' => false,
                ))
                ->add('isTrashed', null, array(
                    'label' => 'admin.fields.opinion_version.is_trashed',
                    'required' => false,
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.opinion_version.trashed_reason',
                ))
            ->end()
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
                'label' => 'admin.fields.opinion_version.title',
            ))
            ->add('author', null, array(
                'label' => 'admin.fields.opinion_version.author',
            ))
            ->add('parent', null, array(
                'label' => 'admin.fields.opinion_version.parent',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.opinion_version.body',
            ))
            ->add('comment', null, array(
                'label' => 'admin.fields.opinion_version.comment',
            ))
            ->add('voteCountOk', null, array(
                'label' => 'admin.fields.opinion_version.vote_count_ok',
            ))
            ->add('voteCountNok', null, array(
                'label' => 'admin.fields.opinion_version.vote_count_nok',
            ))
            ->add('voteCountMitige', null, array(
                'label' => 'admin.fields.opinion_version.vote_count_mitige',
            ))
            ->add('argumentsCount', null, array(
                'label' => 'admin.fields.opinion_version.argument_count',
            ))
            ->add('sourcesCount', null, array(
                'label' => 'admin.fields.opinion_version.source_count',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.opinion_version.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion_version.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_version.updated_at',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.opinion_version.is_trashed',
            ))
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, array(
                    'label' => 'admin.fields.opinion_version.trashed_at',
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.opinion_version.trashed_reason',
                ))
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('list', 'show', 'create', 'edit', 'delete'));
    }

    public function getBatchActions()
    {
        return;
    }
}
