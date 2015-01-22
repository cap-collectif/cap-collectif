<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

use Capco\AppBundle\Entity\Argument;

class ArgumentAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'opinion.title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('type', null, array(
                'label' => 'admin.fields.argument.type',
            ))
            ->add('opinion', null, array(
                'label' => 'admin.fields.argument.opinion',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.argument.author',
            ))
            ->add('voteCount', null, array(
                'label' => 'admin.fields.argument.vote_count',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.argument.updated_at',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.argument.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.argument.is_trashed',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('body', null, array(
                'label' => 'admin.fields.argument.body',
                'template' => 'CapcoAdminBundle:Argument:body_list_field.html.twig',
            ))
            ->add('type', null, array(
                'label' => 'admin.fields.argument.type',
                'template' => 'CapcoAdminBundle:Argument:type_list_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels,
            ))
            ->add('opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.argument.opinion',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.argument.author',
            ))
            ->add('voteCount', null, array(
                'label' => 'admin.fields.argument.vote_count',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.argument.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'editable' => true,
                'label' => 'admin.fields.argument.is_trashed',
            ))
            ->add('updatedAt', 'datetime', array(
                'label' => 'admin.fields.argument.updated_at',
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
            ->add('type', 'choice', array(
                'label' => 'admin.fields.argument.type',
                'choices' => Argument::$argumentTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.argument.is_enabled',
            ))
            ->add('opinion', 'sonata_type_model', array(
                'label' => 'admin.fields.argument.opinion',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.argument.author',
            ))
            ->add('body', null, array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.argument.body',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.argument.is_trashed',
            ))
            ->add('trashedReason', null, array(
                'label' => 'admin.fields.argument.trashed_reason',
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
            ->add('body', null, array(
                'label' => 'admin.fields.argument.body',
            ))
            ->add('type', null, array(
                'label' => 'admin.fields.argument.type',
                'template' => 'CapcoAdminBundle:Argument:type_show_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels,
            ))
            ->add('opinion', null, array(
                'label' => 'admin.fields.argument.opinion',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.argument.author',
            ))
            ->add('voteCount', null, array(
                'label' => 'admin.fields.argument.vote_count',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.argument.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.argument.updated_at',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.argument.is_enabled',
            ))
            ->add('isTrashed', null, array(
                'label' => 'admin.fields.argument.is_trashed',
            ))
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, array(
                    'label' => 'admin.fields.argument.trashed_at',
                ))
                ->add('trashedReason', null, array(
                    'label' => 'admin.fields.argument.trashed_reason',
                ))
            ;
        }

    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
